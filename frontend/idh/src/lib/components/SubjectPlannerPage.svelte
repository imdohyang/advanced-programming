<script lang="ts">
  import { onMount } from 'svelte';
  import Header from '$lib/components/Header.svelte';
  import SubjectForm from '$lib/components/SubjectForm.svelte';
  import { deleteAllExams } from '$lib/api/exam';
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores/user';
  import { get } from 'svelte/store';
  import { confirmAllPlansFromList } from '$lib/api/confirm';
  import { generateStudyPlan } from '$lib/api/ai-planner';

  let subjects = [];
  let userId = '';
  let token = '';

  let showModal = false;
  let notionDbInput = '';

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
    const u = get(user);
    if (!u?.userId) {
      alert('로그인이 필요합니다.');
      goto('/');
      return;
    }

    userId = u.userId;
    token = u.token;

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

  function handleCreatePlan() {
    showModal = true;
  }

  async function submitGeneration() {
    showModal = false;

    try {
      const dbId = extractDatabaseId(notionDbInput.trim());
      if (!dbId) throw new Error('Notion DB ID가 유효하지 않습니다.');

      const u = get(user);
      await generateStudyPlan({
        userId: u.userId,
        databaseId: dbId
      });

      await confirmAllPlansFromList(u.userId);

      alert('✅ 계획 생성 및 Notion 연동이 완료되었습니다!');
      goto('/main');
    } catch (err) {
      console.error('[❌ 계획 생성 실패]', err);
      alert('❗ 계획 생성 또는 연동에 실패했습니다. 다시 시도해주세요.');
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

  {#if showModal}
    <div class="modal-overlay">
      <div class="modal">
        <h3>Notion Database ID 입력</h3>
        <input bind:value={notionDbInput} placeholder="Database address" />
        <div class="modal-actions">
          <button on:click={submitGeneration}>확인</button>
          <button on:click={() => showModal = false}>취소</button>
        </div>
      </div>
    </div>
  {/if}

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



  .modal-overlay {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    width: 320px;
    min-height: 180px; 
    display: flex;
    flex-direction: column;
    justify-content: center; 
    align-items: center;
    text-align: center;
  }

  .modal h3 {
    margin-bottom: 20px;
  }

  .modal input {
    width: 100%;
    padding: 10px;
    margin: 12px 0 0 0; 
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 14px;
  }

  .modal-actions {
    margin-top: 16px;
    display: flex;
    gap: 10px;
    justify-content: center;
  }

  .modal-actions button {
    padding: 8px 16px;
    font-size: 14px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }

  .modal-actions button:first-child {
    background-color: #1f2937;
    color: white;
  }

  .modal-actions button:last-child {
    background-color: #e5e7eb;
  }




</style>