// // src/auth/jwt.strategy.ts
// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') { // ✅ 이름 명시
//   constructor() {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       secretOrKey: 'secret-key',
//       ignoreExpiration: false,
//     });
//   }

//   async validate(payload: any) {
//     return { userId: payload.sub };
//   }
// }

// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
//   constructor() {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       secretOrKey: 'secret', // 👈 현재는 하드코딩된 키에 맞춤
      
//     });
//   }

//   async validate(payload: any) {
//     return { userId: payload.sub }; // 로그인 응답에서 sub로 넘겼다면 이렇게
//   }
// }


import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express'; // 테스트로 추가

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    super({
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // 쿠키에서 JWT를 추출하기 위해 ExtractJwt.fromExtractors 사용
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies?.access_token || null;
        }
      ]), // 쿠키에서 access_token 추출
      secretOrKey: configService.get<string>('JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    console.log('[DEBUG] JwtStrategy.validate 실행됨:', payload);
    return { userId: payload.sub }; // 또는 전체 payload 반환 가능
  }
}
