import { user } from '$lib/stores/user';
import { get } from 'svelte/store';

export type StudyPreference = {
  style: 'focus' | 'parallel';
  studyDays: string[]; // ['월', '화', ...]
  sessionsPerDay: number;
};

export async function saveUserPreference(data: StudyPreference): Promise<void> {
  const currentUser = get(user);
  const userId = currentUser?.userId;
  if (!userId) throw new Error('로그인이 필요합니다.');

  const response = await fetch(`https://advanced-programming.onrender.com/user-preference/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // httpOnly 쿠키 인증
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to save preference: ${response.status}`);
  }
}

export async function getUserPreference(): Promise<StudyPreference> {
  const currentUser = get(user);
  const userId = currentUser?.userId;
  if (!userId) throw new Error('로그인이 필요합니다.');

  const res = await fetch(`https://advanced-programming.onrender.com/user-preference/${userId}`, {
    credentials: 'include', // httpOnly 쿠키 인증
  });
  if (!res.ok) throw new Error('Failed to fetch user preference');
  return res.json();
}