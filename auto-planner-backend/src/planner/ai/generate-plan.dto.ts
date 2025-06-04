// src/planner/ai/generate-plan.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AiGeneratePlanDto {
  @ApiProperty({ 
    example: '202255150',
    description: '사용자 ID' 
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ 
    example: 'notion-db-id',
    description: 'Notion 데이터베이스 ID (선택사항)',
    required: false 
  })
  @IsString()
  @IsOptional()
  databaseId?: string;
}