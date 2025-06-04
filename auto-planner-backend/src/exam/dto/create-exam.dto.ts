import { ApiProperty } from '@nestjs/swagger';
import { ChapterInfoDto } from '../../exam/dto/chapter-info.dto';

export class CreateExamDto {
  @ApiProperty({ example: '수학', description: '시험 과목' })
  subject: string;

  @ApiProperty({ example: '2025-06-01' })
  startDate: string;

  @ApiProperty({ example: '2025-06-15' })
  endDate: string;

  @ApiProperty({ example: 5, description: '중요도 (1~5)' })
  importance: number;

  @ApiProperty({
    type: [ChapterInfoDto],
    description: '챕터 정보 리스트',
  })
  chapters: ChapterInfoDto[];

  @ApiProperty({ example: 'user123', description: '등록자 ID' })
  userId: string;
}
