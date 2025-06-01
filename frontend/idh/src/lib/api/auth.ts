// src/lib/api/auth.ts
export async function login(credentials: { userId: string; password: string }) {
  const res = await fetch('https://advanced-programming.onrender.com/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const errorText = await res.text();  // 서버가 JSON 에러를 안 줄 수도 있어서 text로 안전하게 받음
    throw new Error(errorText || '로그인 실패');
  }

  // ✅ 응답이 순수 문자열(JWT token)이므로 text()로 받아야 함
  const token = await res.text();

  // ✅ localStorage에 저장
  localStorage.setItem('token', token);

  // ✅ 토큰 디코딩
  const payloadBase64 = token.split('.')[1];
  const decodedPayload = JSON.parse(atob(payloadBase64));
  const userId = decodedPayload.userId || decodedPayload.sub;

  if (userId) {
    localStorage.setItem('userId', userId);
  }

  // ✅ 기존처럼 { token, userId } 형태로 반환
  return { token, userId };
}
