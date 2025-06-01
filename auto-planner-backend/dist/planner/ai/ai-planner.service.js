import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LlmClientService } from './server/llm-client.service';
import { format } from 'date-fns';
import { extractJsonBlock } from './utils/json-utils';

@Injectable()
export class AiPlannerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly llmClient: LlmClientService,
  ) {}

  async generateStudyPlan(userId: string, databaseId?: string): Promise<any[]> {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      include: {
        preference: true,
        exams: {
          include: { chapters: true },
        },
      },
    });

    if (!user || !user.preference || user.exams.length === 0) {
      throw new InternalServerErrorException('[❌ 사용자 정보 부케]');
    }

    const prompt = this.createPromptFromUserData(user);
    const llmRawResponse = await this.llmClient.generateSummary(prompt);

    let parsed = [];
    try {
      const jsonOnly = extractJsonBlock(llmRawResponse);
      parsed = JSON.parse(jsonOnly);
    } catch (err) {
      console.error('[❌ JSON 파싱 실패]', llmRawResponse);
      throw new InternalServerErrorException('LLM 응답 JSON 파싱 실패');
    }

    const resultWithMeta = parsed.map(plan => ({
      ...plan,
      userId,
      databaseId,
    }));

    return resultWithMeta;
  }

  private createPromptFromUserData(user: any): string {
    const { preference, exams } = user;
    const studyDays = preference.studyDays.join(', ');
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

    return `
너는 AI 기반 학습 스케줄러야. 사용자 선호도와 시험 정보를 기반으로 하루 단위 학습 계획을 짜.

✅ 사용자 선호도:
- 스타일: ${style}
- 요일: ${studyDays}
- 세션 수: ${sessions}

✅ 시험 정보:
${examStr}

[응답 형식 예시]
[
  {
    "subject": "의료기기인허가",
    "startDate": "2025-05-23",
    "endDate": "2025-06-16",
    "dailyPlan": [
      "6/1: Chapter 1 (p.1-10)",
      "6/2: Chapter 2 (p.11-30)"
    ]
  }
]

제약 조건:
- exam.importance가 높을수록 학습 우선순위를 높여줘.
- chapter.difficulty가 높을수록 하루에 적은 분량(페이지 수)을 할당해줘.
- preference.style이 "multi"이면 하루에 여러 과목을 섞어서 공부할 수 있어.
- preference.style이 "focus"이면 하루에 한 과목만 집중해서 공부해야 해.
- preference.sessionsPerDay는 하루 최대 공부 세션 수를 의미해.
- preference.studyDays는 사용자가 공부 가능한 요일이야 (예: ["월", "화", "수", "목", "금"]).

위 형식만 따르고, JSON 배열만 출력해.
    `.trim();
  }
}
