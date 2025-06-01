/**
 * 특정 사용자의 특정 과목 시험 정보를 서버에서 삭제.
 * @param userId - 사용자 ID
 * @param subject - 과목명
 * @param token - 인증 토큰 (Bearer)
 * @returns 삭제 결과 메시지
 */
export async function deleteExam(
  userId: string,
  subject: string,
  token: string
): Promise<{ message: string }> {
  const encodedSubject = encodeURIComponent(subject); // 공백, 특수문자 인코딩

  const res = await fetch(`https://advanced-programming.onrender.com/exam/${userId}/${encodedSubject}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // 토큰 추가
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || '시험 삭제 실패');
  }

  return res.json(); // { message: "삭제되었습니다." }
}

/**
 * 특정 사용자의 시험 정보를 서버에 등록
 * @param examData - CreateExamDto 형태
 * @param token - 인증 토큰
 * @returns 등록 결과 메시지
 */
export async function createExam(examData: any, token: string): Promise<{ message: string }> {
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

export async function deleteAllExams(userId: string, token: string): Promise<{ message: string }> {
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

  return res.json(); // 예: { message: "8개의 시험과 모든 챕터가 삭제되었습니다." }
}