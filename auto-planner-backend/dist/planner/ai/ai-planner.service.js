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
const date_utils_1 = require("./utils/date-utils");
let AiPlannerService = class AiPlannerService {
    prisma;
    llmClient;
    constructor(prisma, llmClient) {
        this.prisma = prisma;
        this.llmClient = llmClient;
    }
    extractAllJsonBlocks(text) {
        const regex = /\[\s*{[\s\S]*?}\s*\]/g;
        const matches = text.match(regex);
        return matches || [];
    }
    async generateStudyPlanAndSave(userId, databaseId) {
        const user = await this.prisma.user.findUnique({
            where: { userId },
            include: {
                preference: true,
                exams: { include: { chapters: true } },
            },
        });
        if (!user || !user.preference || user.exams.length === 0) {
            throw new common_1.InternalServerErrorException('[❌ 사용자 정보 부족]');
        }
        await this.cleanupExistingPlans(user.id);
        const prompt = this.createPromptFromUserData(user, userId, databaseId);
        const llmRawResponse = await this.llmClient.generateSummary(prompt);
        let parsed;
        try {
            const jsonBlocks = this.extractAllJsonBlocks(llmRawResponse);
            if (jsonBlocks.length === 0) {
                throw new Error('No valid JSON found');
            }
            parsed = jsonBlocks.flatMap(block => JSON.parse(block));
        }
        catch (err) {
            console.error('[❌ JSON 파싱 실패]', llmRawResponse);
            throw new common_1.InternalServerErrorException('LLM 응답 JSON 파싱 실패');
        }
        const exams = await this.prisma.exam.findMany({
            where: { userId: user.id },
            select: { subject: true },
        });
        const registeredSubjects = new Set(exams.map((exam) => exam.subject));
        const uniquePlans = new Map();
        for (const plan of parsed) {
            if (!registeredSubjects.has(plan.subject)) {
                continue;
            }
            if (!uniquePlans.has(plan.subject)) {
                uniquePlans.set(plan.subject, plan);
            }
        }
        await this.saveStudyPlans(Array.from(uniquePlans.values()).map(plan => ({
            userId,
            subject: plan.subject,
            startDate: plan.startDate,
            endDate: plan.endDate,
            dailyPlan: plan.dailyPlan,
            databaseId,
        })));
        const responseData = Array.from(uniquePlans.values()).map(plan => ({
            userId: userId,
            subject: plan.subject,
            startDate: plan.startDate,
            endDate: plan.endDate,
            dailyPlan: plan.dailyPlan,
            databaseId: databaseId || 'default'
        }));
        return responseData;
    }
    async cleanupExistingPlans(userId) {
        try {
            const existingPlans = await this.prisma.studyPlan.findMany({
                where: { userId },
                select: { id: true }
            });
            if (existingPlans.length > 0) {
                const studyPlanIds = existingPlans.map(plan => plan.id);
                await this.prisma.dailyPlan.deleteMany({
                    where: {
                        studyPlanId: { in: studyPlanIds }
                    }
                });
                await this.prisma.studyPlan.deleteMany({
                    where: { userId }
                });
                console.log(`🗑️ 기존 계획 ${existingPlans.length}개 정리 완료`);
            }
        }
        catch (error) {
            console.error('기존 계획 정리 중 오류:', error);
            throw new common_1.InternalServerErrorException('기존 계획 정리 실패');
        }
    }
    async getStudyPlansByUserId(userId) {
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
                        date: 'asc',
                    },
                },
            },
            orderBy: {
                startDate: 'asc',
            },
        });
        return studyPlans;
    }
    async saveStudyPlans(parsedPlans) {
        const createPlans = [];
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
                        create: dailyPlan.map((dayPlan) => {
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
    createPromptFromUserData(user, userId, databaseId) {
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
};
exports.AiPlannerService = AiPlannerService;
exports.AiPlannerService = AiPlannerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        llm_client_service_1.LlmClientService])
], AiPlannerService);
//# sourceMappingURL=ai-planner.service.js.map