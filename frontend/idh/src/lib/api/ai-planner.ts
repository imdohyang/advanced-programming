// 학습 계획 생성 API 호출
export async function generatePlan(userId: string, databaseId: string) {
  const res = await fetch('https://advanced-programming.onrender.com/ai-plan/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, databaseId }),
  });

  if (!res.ok) {
    throw new Error('학습 계획 생성 실패');
  }

  return await res.json();
}
