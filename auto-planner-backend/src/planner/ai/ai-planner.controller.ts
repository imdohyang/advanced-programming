import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { AiPlannerService } from './ai-planner.service';
import { ApiTags, ApiOperation, ApiBody, ApiQuery, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('ai-plan')
@Controller('ai-plan')
export class AiPlannerController {
  constructor(private readonly aiPlannerService: AiPlannerService) {}

  @Post('/generate')
  @ApiOperation({
    summary: '학습 계획 생성 및 저장',
    description: '유저 ID 기반으로 LLM을 통해 학습 계획을 생성하고 데이터베이스에 저장합니다.',
  })
  @ApiBody({
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
  })
  @ApiOkResponse({
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
  })
  async generatePlan(
    @Body() body: { userId: string; databaseId?: string },
  ): Promise<any[]> {
    return await this.aiPlannerService.generateStudyPlanAndSave(body.userId, body.databaseId);
  }

  @Get('/list')
  @ApiOperation({
    summary: '유저의 학습 계획 조회',
    description: '유저 ID로 해당 유저의 모든 학습 계획과 일일 계획(dailyPlans)을 조회합니다.',
  })
  @ApiQuery({
    name: 'userId',
    required: true,
    description: '조회할 유저의 userId (문자열)',
    example: '202255150',
  })
  @ApiOkResponse({
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
  })
  async getStudyPlans(
    @Query('userId') userId: string,
  ): Promise<any[]> {
    return await this.aiPlannerService.getStudyPlansByUserId(userId);
  }
}
