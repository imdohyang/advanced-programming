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
  let notionDbInput = '';

  // 모달 상태
  let showModal = false;
  let showLoading = false;            
  let showSuccess = false;    
  let showNotionLoading = false; 
  let showNotionDone = false;       
  let showErrorModal = false;        // 에러 모달
  let errorModalMessage = '';        // 에러 메시지

  // 커스텀 confirm 모달 상태
  let showConfirmModal = false;
  let confirmModalMessage = '';
  let confirmModalResolve: ((result: boolean) => void) | null = null;

  // 커스텀 confirm 함수
  function customConfirm(message: string): Promise<boolean> {
    confirmModalMessage = message;
    showConfirmModal = true;
    return new Promise((resolve) => {
      confirmModalResolve = resolve;
    });
  }
  function handleConfirmResult(result: boolean) {
    showConfirmModal = false;
    if (confirmModalResolve) {
      confirmModalResolve(result);
      confirmModalResolve = null;
    }
  }

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
      errorModalMessage = '로그인이 필요합니다.';
      showErrorModal = true;
      // goto('/')는 모달 닫을 때 처리
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
      errorModalMessage = '과목 정보를 불러오지 못했습니다.';
      showErrorModal = true;
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
    const ok = await customConfirm('모든 과목 정보를 삭제하고 초기화할까요?');
    if (!ok) return;

    try {
      await deleteAllExams(userId, token);
      subjects = [getEmptySubject()];
      errorModalMessage = '✅ 모든 과목이 초기화되었습니다.';
      showErrorModal = true;
    } catch (err) {
      errorModalMessage = `❌ 초기화 실패: ${err.message}`;
      showErrorModal = true;
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
    showLoading = true;

    try {
      const dbId = extractDatabaseId(notionDbInput.trim());
      if (!dbId) throw new Error('Notion DB ID가 유효하지 않습니다.');

      const u = get(user);
      await generateStudyPlan({
        userId: u.userId,
        databaseId: dbId
      });

      showLoading = false;
      showSuccess = true;
    } catch (err) {
      showLoading = false;
      errorModalMessage = '❗ 계획 생성에 실패했습니다. 다시 시도해주세요.';
      showErrorModal = true;
      console.error('[❌ 계획 생성 실패]', err);
    }
  }

  async function sendToNotion() {
    showSuccess = false;
    showNotionLoading = true;

    try {
      const u = get(user);
      await confirmAllPlansFromList(u.userId);

      showNotionLoading = false;
      showNotionDone = true;
    } catch (err) {
      showNotionLoading = false;
      // 인증 관련 에러 메시지 분기
      if (err.message && (err.message.includes('인증') || err.message.includes('401'))) {
        errorModalMessage = '노션 인증을 먼저 완료해주세요.';
      } else {
        errorModalMessage = '❗ 노션 연동에 실패했습니다. 다시 시도해주세요.';
      }
      showErrorModal = true;
      console.error('[❌ 노션 연동 실패]', err);
    }
  }

  function gotoMain() {
    showNotionDone = false;
    goto('/main');
  }

  function closeErrorModal() {
    showErrorModal = false;
    // 로그인 필요 에러일 때만 메인으로 이동
    if (errorModalMessage === '로그인이 필요합니다.') {
      goto('/');
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
          <button on:click={() => showModal = false}>취소</button>
          <button on:click={submitGeneration}>확인</button>
        </div>
      </div>
    </div>
  {/if}

  {#if showLoading}
    <div class="modal-overlay">
      <div class="modal">
        <div class="spinner"></div>
        <div style="margin-top: 20px;">계획 생성 중...</div>
      </div>
    </div>
  {/if}

  {#if showSuccess}
    <div class="modal-overlay">
      <div class="modal">
        <h3>계획 생성 완료</h3>
        <div style="margin: 16px 0;">계획이 성공적으로 생성되었습니다.</div>
        <div class="modal-actions">
          <button class="notion-btn" on:click={sendToNotion}>노션에 보내기</button>
        </div>
      </div>
    </div>
  {/if}

  {#if showNotionLoading}
    <div class="modal-overlay">
      <div class="modal">
        <div class="spinner"></div>
        <div style="margin-top: 20px;">노션에 보내는 중...</div>
      </div>
    </div>
  {/if}

  {#if showNotionDone}
    <div class="modal-overlay">
      <div class="modal">
        <h3>완료되었습니다</h3>
        <div style="margin: 16px 0;">계획이 노션에 성공적으로 연동되었습니다.</div>
        <div class="modal-actions">
          <button class="notion-btn" on:click={gotoMain}>확인</button>
        </div>
      </div>
    </div>
  {/if}

  {#if showErrorModal}
    <div class="modal-overlay">
      <div class="modal">
        <h3>알림</h3>
        <div style="margin: 16px 0;">{errorModalMessage}</div>
        <div class="modal-actions">
          <button on:click={closeErrorModal}>확인</button>
        </div>
      </div>
    </div>
  {/if}

  {#if showConfirmModal}
    <div class="modal-overlay">
      <div class="modal">
        <div style="font-size:2rem; margin-bottom:8px;">⚠️</div>
        <div style="margin-bottom:24px;">{confirmModalMessage}</div>
        <div class="modal-actions">
          <button on:click={() => handleConfirmResult(false)}>취소</button>
          <button class="notion-btn" on:click={() => handleConfirmResult(true)}>확인</button>
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

  /* 기본 모달 버튼 스타일 */
  .modal-actions button:first-child {
    background-color: #e5e7eb;
    color: #374151;
  }

  .modal-actions button:last-child {
    background-color: #1f2937;
    color: white;
  }

  /* 노션 버튼 스타일 우선순위 높이기 */
  .modal-actions .notion-btn {
    background-color: #1f2937 !important;
    color: #fff !important;
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .modal-actions .notion-btn:hover {
    background-color: #111827 !important;
  }

  .spinner {
    margin: 0 auto;
    border: 6px solid #f3f3f3;
    border-top: 6px solid #1f2937;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg);}
    100% { transform: rotate(360deg);}
  }
</style>
