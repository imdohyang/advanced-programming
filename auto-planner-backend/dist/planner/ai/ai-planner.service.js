"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiPlannerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const llm_client_service_1 = require("./server/llm-client.service");
const date_fns_1 = require("date-fns");
const json_utils_1 = require("./utils/json-utils");
let AiPlannerService = class AiPlannerService {
    prisma;
    llmClient;
    constructor(prisma, llmClient) {
        this.prisma = prisma;
        this.llmClient = llmClient;
    }
    async generateStudyPlan(userId, databaseId) {
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
            throw new common_1.InternalServerErrorException('[❌ 사용자 정보 부족]');
        }
        const prompt = this.createPromptFromUserData(user);
        const llmRawResponse = await this.llmClient.generateSummary(prompt);
        let parsed = [];
        try {
            const jsonOnly = (0, json_utils_1.extractJsonBlock)(llmRawResponse);
            parsed = JSON.parse(jsonOnly);
        }
        catch (err) {
            console.error('[❌ JSON 파싱 실패]', llmRawResponse);
            throw new common_1.InternalServerErrorException('LLM 응답 JSON 파싱 실패');
        }
        const resultWithMeta = parsed.map(plan => ({
            ...plan,
            userId,
            databaseId,
        }));
        return resultWithMeta;
    }
    createPromptFromUserData(user) {
        const { preference, exams } = user;
        const studyDays = preference.studyDays.join(', ');
        const style = preference.style;
        const sessions = preference.sessionsPerDay;
        const examStr = exams
            .map(exam => {
            const chapters = exam.chapters
                .map(c => `    - ${c.chapterTitle} (${c.difficulty}, ${c.contentVolume}p)`)
                .join('\n');
            return `과목: ${exam.subject}\n기간: ${(0, date_fns_1.format)(exam.startDate, 'yyyy-MM-dd')} ~ ${(0, date_fns_1.format)(exam.endDate, 'yyyy-MM-dd')}\n중요도: ${exam.importance}\n챕터:\n${chapters}`;
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
};
exports.AiPlannerService = AiPlannerService;
exports.AiPlannerService = AiPlannerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        llm_client_service_1.LlmClientService])
], AiPlannerService);
//# sourceMappingURL=ai-planner.service.js.map