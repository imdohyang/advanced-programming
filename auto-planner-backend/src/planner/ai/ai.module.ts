import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { AiPlannerController } from './ai-planner.controller';
import { AiPlannerService } from './ai-planner.service';
import { LlmClientService } from './server/llm-client.service';

import { UserPreferenceModule } from '../../user-preference/user-preference.module';
import { ExamModule } from '../../exam/exam.module';
import { NotionModule } from '../../notion/notion.module';
import { PrismaService } from '../../prisma/prisma.service'; // ✅ Prisma 의존성 추가

@Module({
  imports: [
    HttpModule,              // ✅ LLM API 호출용
    UserPreferenceModule,   // ✅ 사용자 선호도 모듈
    ExamModule,             // ✅ 시험 정보 모듈
    NotionModule,           // ✅ Notion 연동 모듈
  ],
  controllers: [AiPlannerController],
  providers: [
    AiPlannerService,
    LlmClientService,
    PrismaService,          // ✅ 필수! 서비스에서 prisma를 직접 사용할 경우 필요
  ],
  exports: [AiPlannerService],
})
export class AiModule {}
