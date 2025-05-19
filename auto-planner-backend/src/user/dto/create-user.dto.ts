import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: '202255179' })
  userId: string;

  @ApiProperty({ example: 'yuhuijeong' })
  password: string;
}
