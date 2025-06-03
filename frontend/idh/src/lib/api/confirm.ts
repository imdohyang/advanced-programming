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

export async function confirmStudyPlansFromList(studyPlans: any[]) {
  for (const plan of studyPlans) {
    const payload = {
      userId: String(plan.userId), // 백엔드에서 문자열로 받는 경우 문자열로 캐스팅
      subject: plan.subject,
      startDate: plan.startDate.slice(0, 10),
      endDate: plan.endDate.slice(0, 10),
      dailyPlan: plan.dailyPlans.map((dp: any) => {
        const date = new Date(dp.date);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}/${day}: ${dp.content}`;
      }),
      databaseId: plan.databaseId,
    };

    try {
      const res = await fetch(`https://advanced-programming.onrender.com/planner/${plan.id}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // ✅ HttpOnly 쿠키를 사용한 인증
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`❌ Confirm 실패 (ID: ${plan.id}): ${errorText}`);
      }

      console.log(`✅ Confirm 완료 (ID: ${plan.id})`);
    } catch (err) {
      console.error(err);
    }
  }
}
