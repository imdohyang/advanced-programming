import { user } from '$lib/stores/user';

export async function login(credentials: { userId: string; password: string }) {
  const res = await fetch('https://advanced-programming.onrender.com/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
    credentials: 'include'
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || '로그인 실패');
  }

  // ✅ 응답이 순수 문자열(JWT token)이므로 text()로 받아야 함
  const token = await res.text();

  // ✅ 토큰 디코딩
  const payloadBase64 = token.split('.')[1];
  const decodedPayload = JSON.parse(atob(payloadBase64));
  const userId = decodedPayload.userId || decodedPayload.sub;

  // ✅ Svelte store에 저장
  user.set({ userId, token });

  return { userId, token };
}