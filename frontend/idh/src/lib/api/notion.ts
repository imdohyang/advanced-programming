import { user } from '$lib/stores/user';
import { get } from 'svelte/store';

const BASE_URL = 'https://advanced-programming.onrender.com';

// 🔹 노션 인증 창으로 바로 리다이렉트
export async function requestNotionRedirect() {
  const currentUser = get(user);
  const userId = currentUser?.userId;
  if (!userId) throw new Error('로그인이 필요합니다.');

  const res = await fetch(`${BASE_URL}/auth/notion/redirect?userId=${userId}`, {
    credentials: 'include' // ✅ 쿠키 포함 (httpOnly)
  });

  if (!res.ok) throw new Error('Notion 인증 URL 요청 실패');

  const notionAuthUrl = await res.text();
  window.location.href = notionAuthUrl;
}

// 🔹 새 창 또는 팝업용 URL 반환
export async function getNotionAuthUrl(): Promise<string> {
  const currentUser = get(user);
  const userId = currentUser?.userId;
  if (!userId) throw new Error('로그인이 필요합니다.');

  const res = await fetch(`${BASE_URL}/auth/notion/redirect?userId=${userId}`, {
    credentials: 'include' // ✅ 쿠키 포함 (httpOnly)
  });

  if (!res.ok) throw new Error('Notion 인증 URL 요청 실패');

  return await res.text();
}

// 🔹 노션 연동 여부 확인
export async function checkNotionConnected(): Promise<boolean> {
  const currentUser = get(user);
  const userId = currentUser?.userId;
  if (!userId) throw new Error('로그인이 필요합니다.');

  const res = await fetch(`${BASE_URL}/auth/notion/status?userId=${userId}`, {
    credentials: 'include' // ✅ 쿠키 포함 (httpOnly)
  });

  if (!res.ok) return false;

  const data = await res.json();
  return data.connected === true;
}