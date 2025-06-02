import { user } from '$lib/stores/user';
import { get } from 'svelte/store';

/**
 * 특정 사용자의 특정 과목 시험 정보를 서버에서 삭제.
 */
export async function deleteExam(userId: string, subject: string): Promise<{ message: string }> {
  const currentUser = get(user);
  const token = currentUser?.token;
  if (!token) throw new Error('인증 토큰이 없습니다.');

  const encodedSubject = encodeURIComponent(subject);

  const res = await fetch(`https://advanced-programming.onrender.com/exam/${userId}/${encodedSubject}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || '시험 삭제 실패');
  }

  return res.json();
}

/**
 * 특정 사용자의 시험 정보를 서버에 등록
 */
export async function createExam(examData: any): Promise<{ message: string }> {
  const currentUser = get(user);
  const token = currentUser?.token;
  if (!token) throw new Error('인증 토큰이 없습니다.');

  const res = await fetch(`https://advanced-programming.onrender.com/exam`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(examData),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || '시험 등록 실패');
  }

  return res.json();
}

export async function isSubjectNameDuplicate(userId: string, subjectName: string): Promise<boolean> {
  const res = await fetch(`https://advanced-programming.onrender.com/exam/${userId}`);
  
  if (!res.ok) {
    throw new Error('시험 정보 조회 실패');
  }

  const data = await res.json();
  const subjectList = data.exams.map((exam: any) => exam.subject.trim());

  return subjectList.includes(subjectName.trim());
}

export async function deleteAllExams(userId: string): Promise<{ message: string }> {
  const currentUser = get(user);
  const token = currentUser?.token;
  if (!token) throw new Error('인증 토큰이 없습니다.');

  const res = await fetch(`https://advanced-programming.onrender.com/exam/${userId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || '전체 과목 삭제 실패');
  }

  return res.json();
}