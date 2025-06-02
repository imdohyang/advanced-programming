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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiPlannerController = void 0;
const common_1 = require("@nestjs/common");
const ai_planner_service_1 = require("./ai-planner.service");
const swagger_1 = require("@nestjs/swagger");
let AiPlannerController = class AiPlannerController {
    aiPlannerService;
    constructor(aiPlannerService) {
        this.aiPlannerService = aiPlannerService;
    }
    async generatePlan(body) {
        return await this.aiPlannerService.generateStudyPlanAndSave(body.userId, body.databaseId);
    }
    async getStudyPlans(userId) {
        return await this.aiPlannerService.getStudyPlansByUserId(userId);
    }
};
exports.AiPlannerController = AiPlannerController;
__decorate([
    (0, common_1.Post)('/generate'),
    (0, swagger_1.ApiOperation)({
        summary: '학습 계획 생성 및 저장',
        description: '유저 ID 기반으로 LLM을 통해 학습 계획을 생성하고 데이터베이스에 저장합니다.',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['userId', 'databaseId'],
            properties: {
                userId: {
                    type: 'string',
                    example: '202255150',
                },
                databaseId: {
                    type: 'string',
                    example: 'notion-db-id',
                },
            },
        },
    }),
    (0, swagger_1.ApiOkResponse)({
        description: '성공적으로 생성 및 저장된 학습 계획',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    subject: { type: 'string', example: '국어' },
                    startDate: { type: 'string', example: '2025-06-03' },
                    endDate: { type: 'string', example: '2025-06-05' },
                    dailyPlan: {
                        type: 'array',
                        items: { type: 'string', example: '6/3: Chapter 1 (p.1-25)' },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiPlannerController.prototype, "generatePlan", null);
__decorate([
    (0, common_1.Get)('/list'),
    (0, swagger_1.ApiOperation)({
        summary: '유저의 학습 계획 조회',
        description: '유저 ID로 해당 유저의 모든 학습 계획과 일일 계획(dailyPlans)을 조회합니다.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'userId',
        required: true,
        description: '조회할 유저의 userId (문자열)',
        example: '202255150',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: '성공적으로 조회된 학습 계획 목록',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    subject: { type: 'string', example: '국어' },
                    startDate: { type: 'string', example: '2025-06-03' },
                    endDate: { type: 'string', example: '2025-06-05' },
                    dailyPlans: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                date: { type: 'string', example: '2025-06-03T00:00:00.000Z' },
                                content: { type: 'string', example: 'Chapter 1 (p.1-25)' },
                            },
                        },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiPlannerController.prototype, "getStudyPlans", null);
exports.AiPlannerController = AiPlannerController = __decorate([
    (0, swagger_1.ApiTags)('ai-plan'),
    (0, common_1.Controller)('ai-plan'),
    __metadata("design:paramtypes", [ai_planner_service_1.AiPlannerService])
], AiPlannerController);
//# sourceMappingURL=ai-planner.controller.js.map