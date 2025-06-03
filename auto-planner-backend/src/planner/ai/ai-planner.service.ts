import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LlmClientService } from './server/llm-client.service';
import { format } from 'date-fns';
import { extractJsonBlock } from './utils/json-utils';
import { getValidStudyDates } from './utils/date-utils';
import { log } from 'console';
import { Prisma } from '@prisma/client'; 
@Injectable()
export class AiPlannerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly llmClient: LlmClientService,
  ) {}

  // ✅ 여러 JSON 블록 추출 함수 추가
  private extractAllJsonBlocks(text: string): string[] {
    const regex = /\[\s*{[\s\S]*?}\s*\]/g;
    const matches = text.match(regex);
    return matches || [];
  }

  // ✅ 계획 생성 + 저장
async generateStudyPlanAndSave(userId: string, databaseId?: string): Promise<any[]> {
  const user = await this.prisma.user.findUnique({
    where: { userId },
    include: {
      preference: true,
      exams: { include: { chapters: true } },
    },
  });

  if (!user || !user.preference || user.exams.length === 0) {
    throw new InternalServerErrorException('[❌ 사용자 정보 부케]');
  }

  const prompt = this.createPromptFromUserData(user);
  const llmRawResponse = await this.llmClient.generateSummary(prompt);

  interface LlmPlan {
    subject: string;
    startDate: string;
    endDate: string;
    dailyPlan: string[];
  }

  let parsed: LlmPlan[];
  try {
    const jsonBlocks = this.extractAllJsonBlocks(llmRawResponse);
    if (jsonBlocks.length === 0) {
      throw new Error('No valid JSON found');
    }
    parsed = jsonBlocks.flatMap(block => JSON.parse(block));
  } catch (err) {
    console.error('[❌ JSON 파싱 실패]', llmRawResponse);
    throw new InternalServerErrorException('LLM 응답 JSON 파싱 실패');
  }

  // 📚 Step 1: DB 등록 과목 가져오기
  const exams = await this.prisma.exam.findMany({
    where: { userId: user.id },
    select: { subject: true },
  });
  const registeredSubjects = new Set(exams.map((exam) => exam.subject));

  // 📚 Step 2: LLM Plan 필터링 (DB 등록 과목만, 중복 제거)
  const uniquePlans = new Map();
  for (const plan of parsed) {
    if (!registeredSubjects.has(plan.subject)) {
      continue;  // DB에 없는 과목 버림
    }
    if (!uniquePlans.has(plan.subject)) {
      uniquePlans.set(plan.subject, plan);  // 과목명 중복 제거
    }
  }

  // 📚 Step 3: 저장
  await this.saveStudyPlans(
    Array.from(uniquePlans.values()).map(plan => ({
      userId,
      subject: plan.subject,
      startDate: plan.startDate,
      endDate: plan.endDate,
      dailyPlan: plan.dailyPlan,
      databaseId,
    })),
  );

  return Array.from(uniquePlans.values());  // 저장 성공 후 결과 반환
}


  // ✅ StudyPlan + DailyPlan nested create
  private async saveStudyPlans(parsedPlans: any[]) {
    const createPlans: Prisma.PrismaPromise<any>[] = [];  // ✅ 여기!

    for (const plan of parsedPlans) {
      const { userId: userCode, subject, startDate, endDate, dailyPlan, databaseId } = plan;

      const user = await this.prisma.user.findUnique({
        where: { userId: userCode },
      });

      if (!user) {
        throw new Error(`User with userId ${userCode} not found`);
      }

      const studyPlanCreate = this.prisma.studyPlan.create({
        data: {
          userId: user.id,
          subject,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          databaseId,
          dailyPlans: {
            create: dailyPlan.map((dayPlan: string) => {
              if (!dayPlan.includes(':')) {
                throw new Error(`Invalid dailyPlan format: ${dayPlan}`);
              }
              const [dateStr, ...contentParts] = dayPlan.split(':');
              const content = contentParts.join(':').trim();
              const [month, day] = dateStr.split('/').map(Number);
              const year = new Date(startDate).getFullYear();
              const date = new Date(year, month - 1, day);

              return {
                date,
                content,
              };
            }),
          },
        },
      });

      createPlans.push(studyPlanCreate);
    }

    await this.prisma.$transaction(createPlans);

    console.log('✅ 모든 StudyPlan과 DailyPlan 저장 완료');
  }


  // ✅ 3. 조회 함수
  async getStudyPlansByUserId(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!user) {
      throw new Error(`User with userId ${userId} not found`);
    }

    const studyPlans = await this.prisma.studyPlan.findMany({
      where: {
        userId: user.id,
      },
      include: {
        dailyPlans: {
          orderBy: {
            date: 'asc', // dailyPlans 날짜 순 정렬
          },
        },
      },
      orderBy: {
        startDate: 'asc', // studyPlan 시작 날짜 순 정렬
      },
    });

    return studyPlans;
  }

  // ✅ 4. LLM 프롬프트 생성
  private createPromptFromUserData(user: any): string {
    const { preference, exams } = user;
    const studyDays = preference.studyDays;
    const style = preference.style;
    const sessions = preference.sessionsPerDay;

    const examStr = exams
      .map(exam => {
        const chapters = exam.chapters
          .map(c => `    - ${c.chapterTitle} (${c.difficulty}, ${c.contentVolume}p)`)
          .join('\n');

        return `과목: ${exam.subject}\n기간: ${format(exam.startDate, 'yyyy-MM-dd')} ~ ${format(exam.endDate, 'yyyy-MM-dd')} (마지막 날은 시험일입니다)\n중요도: ${exam.importance}\n챕터:\n${chapters}`;
      })
      .join('\n\n');

    const allValidDates = exams
      .flatMap(exam => {
        return getValidStudyDates(
          format(exam.startDate, 'yyyy-MM-dd'),
          format(exam.endDate, 'yyyy-MM-dd'),
          studyDays,
        );
      });

    const dateHint = Array.from(new Set(allValidDates)).sort().join(', ');

    return `

    너는 AI 기반 학습 스케줄러야. 사용자 선호도와 시험 정보를 기반으로 과목별 학습 계획(dailyPlan)을 작성해.

    📌 사용자 선호도:
    - 학습 스타일: ${style}  // focus 또는 multi
    - 학습 요일: ${studyDays.join(', ')}  // 예: 월,화,수,목
    - 하루 세션 수: ${sessions}

    📌 시험 정보:
    ${examStr}

    📌 가능한 학습 날짜 목록:
    [${dateHint}]
    ※ 반드시 이 날짜들만 사용할 것. 이외 날짜는 절대 사용하지 마.

    📌 출력 형식:
    [
      {
        "userId": "a",
        "subject": "과목명",
        "startDate": "YYYY-MM-DD",
        "endDate": "YYYY-MM-DD",
        "dailyPlan": [
          "6/1: Chapter 1 (p.1-25)",
          "6/3: Chapter 2 (p.1-30)",
          "6/5: Review"
        ],
        "databaseId": "abc123"
      }
    ]

    📌 반드시 지켜야 할 조건:

    1. 모든 과목의 **모든 챕터는 contentVolume 전체 분량을 빠짐없이 학습**해야 한다.)
      - 일부만 학습하고 넘어가는 경우는 절대 허용되지 않는다.
      - 마지막 챕터의 마지막 페이지까지 반드시 포함되어야 한다.
    2. 하나의 과목 내에서는 챕터 순서를 반드시 지켜야 하며, 이전 챕터를 완전히 학습한 후에만 다음 챕터로 넘어갈 수 있다.
    3. 하루에 같은 챕터를 나눠 학습하는 건 가능하지만, 하나의 줄로 병합해 출력한다.
      - 예: "6/3: Chapter 2 (p.1-30)" ← O
      - 예: "6/3: Chapter 2 (p.1-10)", "6/3: Chapter 2 (p.11-20)" ← X
    4. 하루에 배정되는 챕터 수는 ${sessions}개 이하여야 한다.
    5. 각 챕터는 difficulty에 따라 다음을 고려하여 분할하되, 전체 페이지 수와 학습 가능한 날짜 수를 고려해 아래 값을 유연하게 조정할 수 있다:
      - 쉬움: 평균 하루 25p
      - 보통: 평균 하루 17p
      - 어려움: 평균 하루 12p
    6. 일정은 날짜 순으로 정렬되어야야하고, 절대로 누락된 챕터가 있으면 안된다.
    7. 학습 스타일에 따라 다음을 따른다:
      - focus: 하루에 무조건 한 과목만을 학습한다.(하루에 한 과목의 여러챕터를 학습하는것은 가능)
      - multi: 하루에 여러 과목을 병행(가능한 contentVolme을 최소화하는 방향으로 실시한다.)
    8. dailyPlan은 studyDays에 해당하는 요일만 포함해야 한다. 예: ["월", "화", "수"]면 금/토/일은 제외한다.
    9. Review는 **모든 챕터가 완전히 끝난 이후**에만 배정한다. 하나라도 챕터가 누락되었으면 Review는 배정하지 않는다.
    10. 무조건 하루에 한 챕터를 끝낼 필요는 없고, 최대한 학습가능날짜에 학습계획을 수행하도록 한다.

    📌 출력은 반드시 JSON 배열만 포함해야 하며, 설명 문장이나 코드 블록은 절대 포함하지 않는다.
  `.trim();

  }
}
