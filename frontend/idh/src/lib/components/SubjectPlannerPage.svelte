<script lang="ts">
  import { onMount } from 'svelte';
  import Header from '$lib/components/Header.svelte';
  import SubjectForm from '$lib/components/SubjectForm.svelte';
  import { deleteAllExams } from '$lib/api/exam';
  import { checkNotionConnected } from '$lib/api/notion';
  import { confirmPlan } from '$lib/api/confirm';
  import { goto } from '$app/navigation';

  const token = sessionStorage.getItem('token');
  const userId = sessionStorage.getItem('userId');

  let subjects = [];
  

  function extractDatabaseId(input: string): string | null {
    try {
      const url = new URL(input);
      const path = url.pathname.replace(/\//g, '');
      return path || null;
    } catch (e) {
      return input.includes('?') ? input.split('?')[0] : input;
    }
  }

  onMount(async () => {
    try {
      const res = await fetch(`https://advanced-programming.onrender.com/exam/${userId}`);
      if (!res.ok) throw new Error('과목 정보 불러오기 실패');
      const data = await res.json();

      if (data.exams.length === 0) {
        subjects = [getEmptySubject()];
      } else {
        subjects = data.exams.map((exam) => ({
          subjectName: exam.subject,
          startDate: exam.startDate.slice(0, 10),
          endDate: exam.endDate.slice(0, 10),
          importance: exam.importance,
          units: exam.chapters.map((ch) => ({
            unitName: ch.chapterTitle,
            studyAmount: String(ch.contentVolume),
            difficulty: ch.difficulty,
          })),
        }));
      }
    } catch (err) {
      console.error(err);
      subjects = [getEmptySubject()];
    }
  });

  function getEmptySubject() {
    return {
      subjectName: '',
      startDate: '',
      endDate: '',
      importance: 3,
      units: [{ unitName: '', studyAmount: '', difficulty: '난이도 선택' }],
    };
  }

  async function resetSubjects() {
    const ok = confirm('⚠️ 모든 과목 정보를 삭제하고 초기화할까요?');
    if (!ok) return;

    try {
      await deleteAllExams(userId, token);
      subjects = [getEmptySubject()];
      alert('✅ 모든 과목이 초기화되었습니다.');
    } catch (err) {
      alert(`❌ 초기화 실패: ${err.message}`);
    }
  }

  function handleSubjectChange(index, updatedSubject) {
    subjects[index] = { ...updatedSubject };
    subjects = [...subjects];
  }

  function addSubject() {
    subjects = [...subjects, getEmptySubject()];
  }

  function removeSubject(index) {
    if (subjects.length > 1) {
      subjects = subjects.filter((_, i) => i !== index);
    }
  }

  async function handleCreatePlan() {
    try {
      const input = prompt('📌 노션 데이터베이스 **주소나 ID**를 입력하세요:');
      if (!input) {
        alert('❗ 입력이 취소되었습니다.');
        return;
      }

      const databaseId = extractDatabaseId(input);
      if (!databaseId) {
        alert('❗ 유효한 노션 주소 또는 ID가 아닙니다.');
        return;
      }

      for (const subject of subjects) {
        const payload = {
          userId,
          subject: '고급 프로그래밍',
          startDate: '2025-06-01',
          endDate:'2025-06-15',
          dailyPlan: [
            "6/1: Chapter 1",
            "6/2: Chapter 2"
          ],
          databaseId
        };

        await confirmPlan(userId, payload);
      }

      alert('✅ 노션에 학습 계획이 성공적으로 전송되었습니다.');
      goto('/main');

    } catch (err) {
      alert('❗ 노션 연동이 필요합니다. 메인 화면에서 연동을 먼저 진행해주세요.');
      goto('/main');
    }
  }

</script>

<div class="page-wrapper">
  <Header />
  <main class="content-area">
    <div class="form-wrapper">
      {#each subjects as subject, i (i)}
        <SubjectForm
          index={i}
          subjectData={subject}
          onChange={handleSubjectChange}
          onRemove={removeSubject}
          token={token}
          userId={userId}
        />
      {/each}

      <div class="button-pair">
        <button class="wide-button add-subject-btn" on:click={addSubject}>+ 과목 추가</button>
        <button class="wide-button reset-subject-btn" on:click={resetSubjects}>↺ 초기화</button>
      </div>

      <button class="create-plan-btn" on:click={handleCreatePlan}>학습 계획 생성하기</button>
    </div>
  </main>
</div>

<style>
  .page-wrapper {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: #f3f4f6;
    overflow-x: hidden;
  }

  .content-area {
    flex-grow: 1;
    padding: 40px 20px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }

  .form-wrapper {
    width: 100%;
    max-width: 896px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .button-pair {
    display: flex;
    gap: 16px;
  }

  .wide-button {
    flex: 1;
    height: 56px;
    font-size: 16px;
    border-radius: 12px;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    border: none;
  }

  .add-subject-btn {
    background-color: #ffffff;
    color: #374151;
    border: 1px solid #d1d5db;
  }

  .reset-subject-btn {
    background-color: #f87171;
    color: #ffffff;
    transition: background-color 0.2s ease;
  }

  .reset-subject-btn:hover {
    background-color: #ef4444;
  }

  .create-plan-btn {
    width: 100%;
    margin-top: 20px;
    height: 56px;
    font-size: 16px;
    font-family: 'Inter', sans-serif;
    background-color: #1f2937;
    color: #ffffff;
    border: none;
    border-radius: 12px;
    cursor: pointer;
  }

  :global(body) {
    margin: 0;
    font-family: 'Inter', sans-serif;
    background-color: #e5e5e5;
    overflow-x: hidden;
  }
</style>