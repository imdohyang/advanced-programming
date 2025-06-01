// src/lib/api/userpreference.ts


export type StudyPreference = {
    style: 'focus' | 'parallel';
    studyDays: string[]; // ['월', '화', ...]
    sessionsPerDay: number;
  };
  
  export async function saveUserPreference(userId: string, data: StudyPreference): Promise<void> {
    const response = await fetch(`https://advanced-programming.onrender.com/user-preference/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      throw new Error(`Failed to save preference: ${response.status}`);
    }
  }
  
  export async function getUserPreference(userId: string) {
    const res = await fetch(`https://advanced-programming.onrender.com/user-preference/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch user preference');
    return res.json();
  }