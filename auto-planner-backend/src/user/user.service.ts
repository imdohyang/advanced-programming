import { Injectable } from '@nestjs/common';
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
        // tokenFreeLogin 제거 또는 false로 고정
      },
    });
  }

  async findOne(userId: string) {
    return this.prisma.user.findUnique({ where: { userId } });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }
}
