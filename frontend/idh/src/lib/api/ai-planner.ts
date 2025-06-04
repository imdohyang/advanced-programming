export interface GeneratePlanRequest {
  userId: string;
  databaseId: string;
}

export async function generateStudyPlan(data: GeneratePlanRequest): Promise<Response> {
  const response = await fetch('http://10.125.208.184:4523/api#/ai-plan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
    credentials: 'include' // 필요 시 쿠키 인증을 위해 포함
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`학습 계획 생성 실패: ${response.status} ${errorText}`);
  }

  return response;
}
