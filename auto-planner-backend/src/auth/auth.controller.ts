import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import axios from 'axios';
import { saveToken } from './notion-token.store';
import { Logger } from '@nestjs/common';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: '로그인 및 JWT 쿠키 발급' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { access_token } = await this.authService.login(dto);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      // secure: false, // 로컬에서는 false
      secure: true, // HTTPS 배포 시
      sameSite: 'lax',
    });

    return access_token;
  }

  // // ✅ 1. 로그인 (JWT 발급)
  // @Post('login')
  // @ApiOperation({ summary: '로그인 및 JWT 발급' })
  // login(@Body() dto: LoginDto) {
  //   return this.authService.login(dto);
  // }



  // ✅ 2. Notion OAuth 인증 리다이렉트
  @Get('notion/redirect')
  @ApiOperation({ summary: 'Notion OAuth 인증 리다이렉트' })
  redirectToNotion(@Query('userId') userId: string, @Res() res: Response) {
    const clientId = process.env.NOTION_CLIENT_ID as string;
    const redirectUri = process.env.NOTION_REDIRECT_URI as string;
    const state = `user-${userId}`; // ✅ 문자열로 강제
    console.log('🔧 사용 중인 redirectUri:', redirectUri);
    const notionOAuthUrl = `https://api.notion.com/v1/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&owner=user`;
    console.log(notionOAuthUrl)
    return res.send(notionOAuthUrl);
  }

  // ✅ 3. Notion OAuth 콜백 처리
  @Get('notion/callback')
  @ApiOperation({ summary: 'Notion OAuth 콜백 처리' })
  async handleNotionCallback(
    @Query('code') code: string,
    // @Query('state') userId: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    // ✅ 여기 로그 추가
    console.log('✅ [콜백 진입]');
    console.log('🔍 code:', code);
    // console.log('🔍 state:', userId);
    console.log('🔍 state:', state);
    const clientId = process.env.NOTION_CLIENT_ID as string;
    const clientSecret = process.env.NOTION_CLIENT_SECRET as string;
    const redirectUri = process.env.NOTION_REDIRECT_URI as string;

    try {
      const tokenResponse = await axios.post<{
        access_token: string;
        workspace_id: string;
      }>(
        'https://api.notion.com/v1/oauth/token',
        {
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
        },
        {
          auth: {
            username: clientId,
            password: clientSecret,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const access_token = tokenResponse.data.access_token;
      const workspace_id = tokenResponse.data.workspace_id;

      // ✅ 토큰 저장 (임시 store 또는 DB)
      const userId = state.replace('user-', '');
      console.log('✅ [콜백 진입]');
      console.log('🟡 저장할 userId:', userId);
      console.log('🟡 저장할 token:', access_token);
      saveToken(userId, access_token);
      console.log('✅ saveToken 실행됨!');
      console.log(`[✅ Notion 연동 완료] userId: ${userId}, token: ${access_token}`);
      


      return res.send('Notion 연동이 완료되었습니다! 이 창은 닫아도 됩니다.');
    } catch (error) {
      console.error('❌ Notion 연동 실패:', error.response?.data || error.message);
      return res.status(500).send('Notion 연동 중 오류가 발생했습니다.');
    }
  }
}
