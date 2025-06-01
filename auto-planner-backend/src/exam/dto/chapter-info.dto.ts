import { ApiProperty } from '@nestjs/swagger';

export class ChapterInfoDto {
  @ApiProperty({ example: 'Chapter 1: Introduction' })
  chapterTitle: string;

  @ApiProperty({ example: "쉬움", description: '난이도 (쉬움, 보통, 어려움)' })
  difficulty: number;
  // difficulty: string; // string으로 수정

  @ApiProperty({ example: 10, description: '내용 분량' })
  contentVolume: number;
  // contentVolume: string; // string으로 수정
}
