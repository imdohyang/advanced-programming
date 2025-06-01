/**
 * 학습 계획을 백엔드에 확정 전송하고 Notion에 연동합니다.
 * @param userId - 사용자 ID (planner path param)
 * @param payload - 확정할 학습 계획 데이터
 */
export async function confirmPlan(userId: string, payload: {
  userId: string;
  subject: string;
  startDate: string;
  endDate: string;
  dailyPlan: string[];
  databaseId: string;
}): Promise<void> {
  const token = sessionStorage.getItem('token');

  if (!token) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }

  const res = await fetch(`https://advanced-programming.onrender.com/planner/${userId}/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // ✅ 인증 헤더 추가
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`학습 계획 전송 실패: ${errorText}`);
  }
}
