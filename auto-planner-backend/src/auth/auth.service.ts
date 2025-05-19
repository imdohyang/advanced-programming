import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(userId: string, password: string) {
    const user = await this.userService.findOne(userId);
    if (!user) return null;

    // 비밀번호 검사 (tokenFreeLogin 제거)
    if (user.password !== password) {
      return null;
    }

    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.userId, dto.password);

    if (!user) {
      throw new UnauthorizedException('잘못된 사용자 정보입니다.');
    }

    const payload = { sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signup(dto: CreateUserDto) {
    return await this.userService.create(dto);
  }
}
