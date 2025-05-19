import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        userId: createUserDto.userId,
        password: createUserDto.password,
      },
    });
  }

  async findOne(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { userId } });

    if (!user) {
      throw new NotFoundException('해당 사용자를 찾을 수 없습니다.');
    }

    return user;
  }

  async findAll() {
    return this.prisma.user.findMany();
  }
}
