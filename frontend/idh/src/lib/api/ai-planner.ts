export async function getStudyPlans(userId: string): Promise<any[]> {
  try {
    const res = await fetch(
      `https://advanced-programming.onrender.com/ai-plan/list?userId=${encodeURIComponent(userId)}`,
      {
        method: 'GET',
        credentials: 'include', // ✅ HttpOnly 쿠키 기반 인증
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`❌ 학습 계획 조회 실패: ${errorText}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    throw new Error('❌ 학습 계획 가져오기 중 오류 발생');
  }
}