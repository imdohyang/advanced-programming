import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LlmClientService } from './server/llm-client.service';
import { format } from 'date-fns';
import { SyncToNotionDto } from '../../notion/dto/sync-to-notion.dto';
import { extractJsonBlock } from './utils/json-utils'; // 경로에 맞게


@Injectable()
export class AiPlannerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly llmClient: LlmClientService,
  ) {}

  async generateStudyPlan(userId: string, databaseId?: string): Promise<SyncToNotionDto[]> {
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
      throw new InternalServerErrorException('[❌ 사용자 정보 부족]');
    }

    const prompt = this.createPromptFromUserData(user);

    const llmRawResponse = await this.llmClient.generateSummary(prompt);

    let parsed: any[] = [];
    try {
      const jsonOnly = extractJsonBlock(llmRawResponse);
      parsed = JSON.parse(jsonOnly);  // ✅ JSON 부분만 안전하게 파싱
    } catch (err) {
      console.error('[❌ JSON 파싱 실패]', llmRawResponse);
      throw new InternalServerErrorException('LLM 응답 JSON 파싱 실패');
    }

    // 필수 필드 추가 (userId, databaseId)
    const resultWithMeta = parsed.map(plan => ({
      ...plan,
      userId,
      databaseId,
    }));

    // TODO: 저장 로직 (향후 StudyPlan 테이블에 저장 예정)

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
          .map(c =>
            `    - ${c.chapterTitle} (${c.difficulty}, ${c.contentVolume}p)`
          )
          .join('\n');
        return `과목: ${exam.subject}\n기간: ${format(exam.startDate, 'yyyy-MM-dd')} ~ ${format(exam.endDate, 'yyyy-MM-dd')}\n중요도: ${exam.importance}\n챕터:\n${chapters}`;
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
      "6/2: Chapter 2 (p.11-30)",
      ...
    ]
  }
]

위 형식만 따르고, JSON 배열만 출력해.
`.trim();
  }
}
