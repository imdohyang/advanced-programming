import { user } from '$lib/stores/user';
import { get } from 'svelte/store';

const BASE_URL = 'https://advanced-programming.onrender.com';

export async function checkUserExists(userId: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/user/${userId}`, {
      credentials: 'include'
    });
    if (res.ok) return true; // 이미 존재
    if (res.status === 404) return false; // 존재하지 않음
    throw new Error('사용자 조회 실패');
  } catch (e) {
    console.error(e);
    throw new Error('네트워크 오류');
  }
}

export async function signupUser({ userId, password }: { userId: string; password: string }) {
  const res = await fetch(`${BASE_URL}/user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
      userId,
      password,
      studyPreference: '알수없음'  // 백엔드가 요구한다면 필수
    })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || '회원가입 실패');
  }

  return await res.json();
}