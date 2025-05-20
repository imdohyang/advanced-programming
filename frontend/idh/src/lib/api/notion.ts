// src/lib/api/notion.ts

export function decodeJwtPayload(token: string): any {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

export async function requestNotionRedirect() {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('로그인이 필요합니다.');

  const payload = decodeJwtPayload(token);
  const userId = payload.userId;
  if (!userId) throw new Error('userId가 JWT에 없습니다.');

  const res = await fetch(`https://advanced-programming.onrender.com/auth/notion/redirect?userId=${userId}`);
  if (!res.ok) throw new Error('Notion 인증 URL 요청 실패');

  const notionAuthUrl = await res.text();
  window.location.href = notionAuthUrl;
}
