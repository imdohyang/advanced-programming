import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class LlmClientService {
  constructor(private readonly httpService: HttpService) {}

  async generateSummary(prompt: string): Promise<string> {
    const url = 'http://10.125.208.217:9241/v1/completions';
    
    // 최대 3회 재시도
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        console.log(`🤖 LLM 호출 시도 ${attempt + 1}/3`);
        
        const response = await firstValueFrom(
          this.httpService.post(url, {
            prompt: prompt.trim(),
            model: 'meta-llama/Llama-3.3-70B-Instruct',
            max_tokens: 1024,
            temperature: 0.3,
          }, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer dummy-key`,
            },
            timeout: 300000, // 30초 타임아웃
          })
        );

        const raw = response.data?.choices?.[0]?.text || '';
        
        if (!raw.trim()) {
          throw new Error('빈 응답');
        }

        console.log(`✅ LLM 응답 성공 (${raw.length}자)`);
        return raw.trim();

      } catch (error) {
        console.error(`❌ LLM 호출 실패 (${attempt + 1}/3):`, error.message);
        
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
        }
      }
    }

    throw new HttpException('LLM 서버 연결 실패', HttpStatus.BAD_GATEWAY);
  }
}