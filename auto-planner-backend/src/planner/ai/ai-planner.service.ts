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
      throw new InternalServerErrorException('[❌ 사용자 정보 부족]');
    }

    // ✅ 기존 계획 정리 (외래키 제약 조건 해결)
    await this.cleanupExistingPlans(user.id);

    const prompt = this.createPromptFromUserData(user, userId, databaseId);
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

    // ✅ 응답에 userId와 databaseId 포함하여 반환
    const responseData = Array.from(uniquePlans.values()).map(plan => ({
      userId: userId,  // 요청에서 받은 userId 포함
      subject: plan.subject,
      startDate: plan.startDate,
      endDate: plan.endDate,
      dailyPlan: plan.dailyPlan,
      databaseId: databaseId || 'default'  // 요청에서 받은 databaseId 포함
    }));

    return responseData;  // 저장 성공 후 결과 반환
  }

  // ✅ 기존 계획 정리 함수 (외래키 제약 조건 해결)
  private async cleanupExistingPlans(userId: number): Promise<void> {
    try {
      // 1. 기존 StudyPlan ID들 조회
      const existingPlans = await this.prisma.studyPlan.findMany({
        where: { userId },
        select: { id: true }
      });

      if (existingPlans.length > 0) {
        const studyPlanIds = existingPlans.map(plan => plan.id);
        
        // 2. DailyPlan 먼저 삭제 (외래키 제약 조건 준수)
        await this.prisma.dailyPlan.deleteMany({
          where: {
            studyPlanId: { in: studyPlanIds }
          }
        });

        // 3. 그 다음 StudyPlan 삭제
        await this.prisma.studyPlan.deleteMany({
          where: { userId }
        });

        console.log(`🗑️ 기존 계획 ${existingPlans.length}개 정리 완료`);
      }
    } catch (error) {
      console.error('기존 계획 정리 중 오류:', error);
      throw new InternalServerErrorException('기존 계획 정리 실패');
    }
  }
  async getStudyPlansByUserId(userId: string) {
  // 1. 사용자 존재 확인
  const user = await this.prisma.user.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!user) {
    throw new Error(`User with userId ${userId} not found`);
  }

  // 2. 해당 사용자의 모든 학습 계획 조회
  const studyPlans = await this.prisma.studyPlan.findMany({
    where: {
      userId: user.id,  // 내부 DB ID 사용
    },
    include: {
      dailyPlans: {     // 일일 계획도 함께 조회
        orderBy: {
          date: 'asc',  // 날짜 순 정렬
        },
      },
    },
    orderBy: {
      startDate: 'asc', // 학습 계획도 시작일 순 정렬
    },
  });

  return studyPlans;
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

  // ✅ LLM 프롬프트 생성 (userId, databaseId 동적 전달)
  private createPromptFromUserData(user: any, userId: string, databaseId?: string): string {
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
        "userId": "${userId}",
        "subject": "과목명",
        "startDate": "YYYY-MM-DD",
        "endDate": "YYYY-MM-DD",
        "dailyPlan": [
          "6/1: Chapter 1 (p.1-25)",
          "6/3: Chapter 2 (p.1-30)",
          "6/5: Review"
        ],
        "databaseId": "${databaseId || 'default'}"
      }
    ]

    반드시 지켜야 할 조건:

    **챕터 순서 엄수 (최우선)**:
    1. **한 과목 내에서 챕터는 반드시 순서대로 진행**되어야 한다.
       - Chapter 1이 완전히 끝나지 않으면 Chapter 2는 절대 시작할 수 없다.
       - Chapter 2가 완전히 끝나지 않으면 Chapter 3는 절대 시작할 수 없다.
    
    2. **하루에 여러 챕터 동시 진행 금지**:
       - 잘못된 예: "6/6: Chapter 2 (p.1-15), Chapter 3 (p.1-12)"
       - 올바른 예: "6/6: Chapter 2 (p.1-30)" (Chapter 2 완료 후)
       - 올바른 예: "6/9: Chapter 3 (p.1-25)" (다음 날 Chapter 3 시작)

    3. **모든 챕터의 전체 페이지 완주**:
       - 각 챕터의 contentVolume 전체를 빠짐없이 학습해야 한다.
       - 일부 페이지만 학습하고 다음 챕터로 넘어가는 것은 절대 금지.

    **학습 계획 규칙**:
    4. **하루 학습량 제한**: 하루에 배정되는 챕터 수는 ${sessions}개 이하
    
    5. **페이지 분할 기준** (difficulty 고려, 유연하게 조정 가능):
       - 쉬움: 평균 하루 25p
       - 보통: 평균 하루 17p  
       - 어려움: 평균 하루 12p
    
    6. **하루 내 같은 챕터 분할 허용**:
       - "6/3: Chapter 2 (p.1-30)" (하루에 한 챕터 전체)
       - "6/3: Chapter 2 (p.1-15)" + "6/4: Chapter 2 (p.16-30)" (여러 날에 걸쳐 분할)
       - "6/3: Chapter 2 (p.1-10), Chapter 2 (p.11-20)" (같은 날 여러 줄 금지)

    **일정 관리**:
    7. **학습 스타일별 과목 배치**:
       - focus: 하루에 한 과목만 학습 (여러 챕터 가능하지만 같은 과목만)
       - multi: 하루에 여러 과목 병행 가능 (각 과목별로 챕터 순서는 엄수)
    
    8. **학습 요일 준수**: studyDays에 해당하는 요일만 사용
    
    9. **날짜 순 정렬**: dailyPlan은 시간 순서대로 정렬
    
    10. **Review 배치**: 모든 챕터가 완전히 끝난 후에만 Review 추가


    📌 출력은 반드시 JSON 배열만 포함해야 하며, 설명 문장이나 코드 블록은 절대 포함하지 않는다.
  `.trim();

  }
}