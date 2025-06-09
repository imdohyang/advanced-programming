import { user } from '$lib/stores/user';

// 로그인 응답 타입 정의
type LoginResponse = {
  userId: string;
  token: string;
};

// 로그인 함수
export async function login(
  credentials: { userId: string; password: string }
): Promise<LoginResponse> {
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

  const token = await res.text();
  const payloadBase64 = token.split('.')[1];
  const decodedPayload = JSON.parse(atob(payloadBase64));
  const userId = decodedPayload.userId || decodedPayload.sub;

  user.set({ userId, token });

  return { userId, token };
}
