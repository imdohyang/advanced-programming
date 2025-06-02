import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class LlmClientService {
  constructor(private readonly httpService: HttpService) {}

  async generateSummary(prompt: string): Promise<string> {
    const url = 'http://10.125.208.217:9241/v1/completions';  // ✅ 교수님 서버 주소

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          url,
          {
            prompt,                            // ✅ prompt 방식
            model: 'meta-llama/Llama-3.3-70B-Instruct',  // ✅ 서버에서 확인된 model명
            max_tokens: 1024, // 가능하면최대치로
            temperature: 0.7,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer dummy-key`, // ✅ 아무 문자열이면 OK
            },
          }
        )
      );

      const raw = response.data?.choices?.[0]?.text || '';
      console.log('🧪 Raw LLM response:', raw);
      return raw.trim();
    } catch (err) {
      console.error('❌ LLM 서버 호출 실패:', err?.message || err);
      throw new HttpException('LLM 요약/피드백 생성 실패', HttpStatus.BAD_GATEWAY);
    }
  }
}
