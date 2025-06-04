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
const generate_plan_dto_1 = require("./generate-plan.dto");
let AiPlannerController = class AiPlannerController {
    aiPlannerService;
    constructor(aiPlannerService) {
        this.aiPlannerService = aiPlannerService;
    }
    async generatePlan(generatePlanDto) {
        console.log('🔍 요청 데이터:', generatePlanDto);
        try {
            const result = await this.aiPlannerService.generateStudyPlanAndSave(generatePlanDto.userId.trim(), generatePlanDto.databaseId?.trim());
            console.log('✅ 생성된 계획:', result);
            return result;
        }
        catch (error) {
            console.error('학습 계획 생성 API 오류:', {
                userId: generatePlanDto.userId,
                databaseId: generatePlanDto.databaseId,
                error: error.message,
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    }
    async getStudyPlans(userId) {
        if (!userId?.trim()) {
            throw new common_1.BadRequestException('userId 파라미터가 필요합니다');
        }
        try {
            const result = await this.aiPlannerService.getStudyPlansByUserId(userId.trim());
            return result;
        }
        catch (error) {
            console.error('학습 계획 조회 API 오류:', {
                userId,
                error: error.message,
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    }
    async healthCheck() {
        try {
            return {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                llmConnection: true
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                llmConnection: false,
                error: error.message
            };
        }
    }
};
exports.AiPlannerController = AiPlannerController;
__decorate([
    (0, common_1.Post)('/generate'),
    (0, swagger_1.ApiOperation)({
        summary: '학습 계획 생성 및 저장',
        description: `
사용자 ID를 기반으로 LLM을 통해 개인화된 학습 계획을 생성하고 데이터베이스에 저장합니다.

**주요 기능:**
- 사용자의 선호도와 시험 정보를 분석
- AI 기반 맞춤형 학습 일정 생성
- 과목별 챕터 순서 및 난이도 고려
- 일일 학습량 자동 조절

**요구사항:**
- 사용자 선호도 설정 완료
- 시험 정보 및 챕터 등록 완료
    `
    }),
    (0, swagger_1.ApiBody)({
        type: generate_plan_dto_1.AiGeneratePlanDto,
        description: '학습 계획 생성 요청 데이터',
        examples: {
            example1: {
                summary: '기본 요청',
                description: 'databaseId가 포함된 기본 요청',
                value: {
                    userId: '202255150',
                    databaseId: 'notion-db-id'
                }
            },
            example2: {
                summary: 'databaseId 없는 요청',
                description: 'databaseId가 없는 요청 (기본값 사용)',
                value: {
                    userId: '202255150'
                }
            }
        }
    }),
    (0, swagger_1.ApiOkResponse)({
        description: '성공적으로 생성 및 저장된 학습 계획',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    userId: {
                        type: 'string',
                        example: '202255150',
                        description: '요청한 사용자 ID'
                    },
                    subject: {
                        type: 'string',
                        example: '데이터구조',
                        description: '과목명'
                    },
                    startDate: {
                        type: 'string',
                        example: '2025-06-03',
                        description: '학습 시작일 (YYYY-MM-DD)'
                    },
                    endDate: {
                        type: 'string',
                        example: '2025-06-15',
                        description: '학습 종료일 (YYYY-MM-DD)'
                    },
                    dailyPlan: {
                        type: 'array',
                        items: {
                            type: 'string',
                            example: '6/3: Chapter 1 배열과 리스트 (p.1-25)'
                        },
                        description: '일별 학습 계획 목록'
                    },
                    databaseId: {
                        type: 'string',
                        example: 'notion-db-id',
                        description: '요청한 데이터베이스 ID (또는 기본값)'
                    }
                },
            },
        },
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: '잘못된 요청 데이터',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 400 },
                message: {
                    type: 'string',
                    example: '사용자 선호도가 설정되지 않았습니다'
                },
                error: { type: 'string', example: 'Bad Request' }
            }
        }
    }),
    (0, swagger_1.ApiInternalServerErrorResponse)({
        description: '서버 내부 오류',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 500 },
                message: {
                    type: 'string',
                    example: 'LLM 서버 연결 실패'
                },
                error: { type: 'string', example: 'Internal Server Error' }
            }
        }
    }),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_plan_dto_1.AiGeneratePlanDto]),
    __metadata("design:returntype", Promise)
], AiPlannerController.prototype, "generatePlan", null);
__decorate([
    (0, common_1.Get)('/list'),
    (0, swagger_1.ApiOperation)({
        summary: '유저의 학습 계획 조회',
        description: `
사용자 ID로 해당 사용자의 모든 학습 계획과 일일 계획을 조회합니다.

**반환 데이터:**
- 학습 계획 기본 정보 (과목, 기간 등)
- 일별 상세 계획 목록 (날짜순 정렬)
- 진행 상황 추적 가능한 구조화된 데이터
    `
    }),
    (0, swagger_1.ApiQuery)({
        name: 'userId',
        required: true,
        description: '조회할 사용자의 고유 ID',
        example: '202255150',
        type: String
    }),
    (0, swagger_1.ApiOkResponse)({
        description: '성공적으로 조회된 학습 계획 목록',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number', example: 1 },
                    subject: {
                        type: 'string',
                        example: '데이터구조',
                        description: '과목명'
                    },
                    startDate: {
                        type: 'string',
                        example: '2025-06-03T00:00:00.000Z',
                        description: '학습 시작일'
                    },
                    endDate: {
                        type: 'string',
                        example: '2025-06-15T00:00:00.000Z',
                        description: '학습 종료일'
                    },
                    databaseId: {
                        type: 'string',
                        example: 'notion-db-id',
                        description: 'Notion 데이터베이스 ID'
                    },
                    dailyPlans: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'number', example: 1 },
                                date: {
                                    type: 'string',
                                    example: '2025-06-03T00:00:00.000Z',
                                    description: '학습 날짜'
                                },
                                content: {
                                    type: 'string',
                                    example: 'Chapter 1 배열과 리스트 (p.1-25)',
                                    description: '해당 날짜의 학습 내용'
                                },
                                studyPlanId: { type: 'number', example: 1 }
                            },
                        },
                        description: '일별 학습 계획 목록 (날짜순 정렬)'
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: '잘못된 사용자 ID',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 400 },
                message: {
                    type: 'string',
                    example: '사용자를 찾을 수 없습니다: invalid-user-id'
                },
                error: { type: 'string', example: 'Bad Request' }
            }
        }
    }),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiPlannerController.prototype, "getStudyPlans", null);
__decorate([
    (0, common_1.Get)('/health'),
    (0, swagger_1.ApiOperation)({
        summary: 'AI 서비스 상태 확인',
        description: 'LLM 서버 연결 상태와 서비스 가용성을 확인합니다.'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: '서비스 상태 정보',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'healthy' },
                timestamp: { type: 'string', example: '2025-06-04T10:30:00.000Z' },
                llmConnection: { type: 'boolean', example: true }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AiPlannerController.prototype, "healthCheck", null);
exports.AiPlannerController = AiPlannerController = __decorate([
    (0, swagger_1.ApiTags)('ai-plan'),
    (0, common_1.Controller)('ai-plan'),
    __metadata("design:paramtypes", [ai_planner_service_1.AiPlannerService])
], AiPlannerController);
//# sourceMappingURL=ai-planner.controller.js.map