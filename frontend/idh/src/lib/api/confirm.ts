// import { user } from '$lib/stores/user';
// import { get } from 'svelte/store';

// /**
//  * 학습 계획을 백엔드에 확정 전송하고 Notion에 연동합니다.
//  * @param userId - 사용자 ID (planner path param)
//  * @param payload - 확정할 학습 계획 데이터
//  */
// export async function confirmPlan(
//   userId: string,
//   payload: {
//     userId: string;
//     subject: string;
//     startDate: string;
//     endDate: string;
//     dailyPlan: string[];
//     databaseId: string;
//   }
// ): Promise<void> {
//   // 인증 토큰은 httpOnly 쿠키로 전송됨 (Authorization 헤더 제거)
//   const res = await fetch(`https://advanced-programming.onrender.com/planner/${userId}/confirm`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     credentials: 'include', // 쿠키 자동 전송
//     body: JSON.stringify(payload)
//   });

//   if (!res.ok) {
//     const errorText = await res.text();
//     throw new Error(`학습 계획 전송 실패: ${errorText}`);
//   }
// }

export async function confirmAllPlansFromList(userId: string): Promise<void> {
  // 1. GET으로 유저 계획 리스트 불러오기
  const res = await fetch(`https://advanced-programming.onrender.com/ai-plan/list?userId=${userId}`, {
    credentials: 'include',
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || '학습 계획 불러오기 실패');
  }

  const plans = await res.json();

  // 2. 각 plan을 순회하며 /planner/{id}/confirm POST 요청
  for (const plan of plans) {
    const confirmPayload = {
      userId: String(userId),
      subject: plan.subject,
      startDate: plan.startDate.slice(0, 10), // YYYY-MM-DD
      endDate: plan.endDate.slice(0, 10),
      databaseId: plan.databaseId,
      dailyPlan: plan.dailyPlans.map((d: any) => {
        const date = new Date(d.date);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}/${day}: ${d.content}`;
      }),
    };

    const postRes = await fetch(`https://advanced-programming.onrender.com/planner/${plan.id}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(confirmPayload),
    });

    if (!postRes.ok) {
      const errMsg = await postRes.text();
      console.error(`[❌ FAIL] confirm 실패 - planId=${plan.id}: ${errMsg}`);
      throw new Error(`confirm 실패: ${errMsg}`);
    }

    console.log(`[✅ SUCCESS] planId=${plan.id} confirm 완료`);
  }
}
