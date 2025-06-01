// // AutoPlanner에서 바로 노션 연동창 열림
// export async function requestNotionRedirect() {
//   const token = sessionStorage.getItem('token');
//   const userId = sessionStorage.getItem('userId');

//   if (!token || !userId) throw new Error('로그인이 필요합니다.');

//   const res = await fetch(`https://advanced-programming.onrender.com/auth/notion/redirect?userId=${userId}`);
//   if (!res.ok) throw new Error('Notion 인증 URL 요청 실패');

//   const notionAuthUrl = await res.text();
//   window.location.href = notionAuthUrl;
// }

// // 새 창으로 노션 연동
// export async function getNotionAuthUrl(): Promise<string> {
//   const token = sessionStorage.getItem('token');
//   const userId = sessionStorage.getItem('userId');

//   if (!token || !userId) throw new Error('로그인이 필요합니다.');

//   const res = await fetch(`https://advanced-programming.onrender.com/auth/notion/redirect?userId=${userId}`);
//   if (!res.ok) throw new Error('Notion 인증 URL 요청 실패');

//   return await res.text();
// }

// // 노션 연동 상태 확인
// const BASE_URL = 'https://advanced-programming.onrender.com';

// export async function checkNotionConnected(): Promise<boolean> {
//   const token = sessionStorage.getItem('token');
//   const userId = sessionStorage.getItem('userId');

//   if (!token || !userId) throw new Error('로그인이 필요합니다.');

//   const res = await fetch(`${BASE_URL}/auth/notion/status?userId=${userId}`);
//   if (!res.ok) return false;

//   const data = await res.json();
//   return data.connected === true;
// }


const BASE_URL = 'https://advanced-programming.onrender.com';

// 🔹 노션 인증 창으로 바로 리다이렉트
export async function requestNotionRedirect() {
  const userId = sessionStorage.getItem('userId');
  if (!userId) throw new Error('로그인이 필요합니다.');

  const res = await fetch(`${BASE_URL}/auth/notion/redirect?userId=${userId}`, {
    credentials: 'include' // ✅ 쿠키 포함
  });

  if (!res.ok) throw new Error('Notion 인증 URL 요청 실패');

  const notionAuthUrl = await res.text();
  window.location.href = notionAuthUrl;
}

// 🔹 새 창 또는 팝업용 URL 반환
export async function getNotionAuthUrl(): Promise<string> {
  const userId = sessionStorage.getItem('userId');
  if (!userId) throw new Error('로그인이 필요합니다.');

  const res = await fetch(`${BASE_URL}/auth/notion/redirect?userId=${userId}`, {
    credentials: 'include' // ✅ 쿠키 포함
  });

  if (!res.ok) throw new Error('Notion 인증 URL 요청 실패');

  return await res.text();
}

// 🔹 노션 연동 여부 확인
export async function checkNotionConnected(): Promise<boolean> {
  const userId = sessionStorage.getItem('userId');
  if (!userId) throw new Error('로그인이 필요합니다.');

  const res = await fetch(`${BASE_URL}/auth/notion/status?userId=${userId}`, {
    credentials: 'include' // ✅ 쿠키 포함
  });

  if (!res.ok) return false;

  const data = await res.json();
  return data.connected === true;
}
