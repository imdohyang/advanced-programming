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
const date_utils_1 = require("./utils/date-utils");
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
            throw new common_1.InternalServerErrorException('[❌ 사용자 정보 부케]');
        }
        const prompt = this.createPromptFromUserData(user);
        const llmRawResponse = await this.llmClient.generateSummary(prompt);
        let parsed;
        try {
            const jsonOnly = (0, json_utils_1.extractJsonBlock)(llmRawResponse);
            parsed = JSON.parse(jsonOnly);
        }
        catch (err) {
            console.error('[❌ JSON 파싱 실패]', llmRawResponse);
            throw new common_1.InternalServerErrorException('LLM 응답 JSON 파싱 실패');
        }
        const resultWithMeta = parsed.map(plan => ({
            userId,
            subject: plan.subject,
            startDate: plan.startDate,
            endDate: plan.endDate,
            dailyPlan: plan.dailyPlan,
            databaseId,
        }));
        return resultWithMeta;
    }
    createPromptFromUserData(user) {
        const { preference, exams } = user;
        const studyDays = preference.studyDays;
        const style = preference.style;
        const sessions = preference.sessionsPerDay;
        const examStr = exams
            .map(exam => {
            const chapters = exam.chapters
                .map(c => `    - ${c.chapterTitle} (${c.difficulty}, ${c.contentVolume}p)`)
                .join('\n');
            return `과목: ${exam.subject}\n기간: ${(0, date_fns_1.format)(exam.startDate, 'yyyy-MM-dd')} ~ ${(0, date_fns_1.format)(exam.endDate, 'yyyy-MM-dd')} (마지막 날은 시험일입니다)\n중요도: ${exam.importance}\n챕터:\n${chapters}`;
        })
            .join('\n\n');
        const allValidDates = exams
            .flatMap(exam => {
            return (0, date_utils_1.getValidStudyDates)((0, date_fns_1.format)(exam.startDate, 'yyyy-MM-dd'), (0, date_fns_1.format)(exam.endDate, 'yyyy-MM-dd'), studyDays);
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
};
exports.AiPlannerService = AiPlannerService;
exports.AiPlannerService = AiPlannerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        llm_client_service_1.LlmClientService])
], AiPlannerService);
//# sourceMappingURL=ai-planner.service.js.map