<script lang="ts">
  import { onMount } from 'svelte';
  import { saveUserPreference, getUserPreference } from '$lib/api/userPreference';

  let userId = '';
  let learningStyle: 'focus' | 'parallel' = 'focus';
  let studyDays: { [key: string]: boolean } = {
    mon: false, tue: false, wed: false,
    thu: false, fri: false, sat: false, sun: false,
  };
  let studySessions = 5;

  // ✅ 초기화 시, 로그인 정보 확인 + 기존 설정 로딩
  onMount(async () => {
    const storedId = localStorage.getItem('userId');
    if (!storedId) {
      alert('로그인이 필요합니다.');
      window.location.href = '/';
      return;
    }
    userId = storedId;

    try {
      const res = await getUserPreference(userId);

      // ✅ 기존 설정 반영
      if (res) {
        learningStyle = res.style === 'focus' ? 'focus' : 'parallel';

        // 요일은 문자열 배열 → 객체로 다시 매핑
        for (const key in studyDays) {
          studyDays[key] = res.studyDays.includes(convertDayKeyToKor(key));
        }

        studySessions = res.sessionsPerDay;
      }
    } catch (err: any) {
      if (err.message?.includes('404')) {
        // 처음인 경우 (기본값 유지)
        console.log('사용자 설정이 없습니다. 초기값으로 시작합니다.');
      } else {
        console.error('불러오기 오류:', err);
        alert('사용자 설정이 없습니다. 초기값으로 시작합니다.');
      }
    }
  });

  // 영어 요일 key → 한글 변환 함수
  function convertDayKeyToKor(key: string): string {
    const map = { mon: '월', tue: '화', wed: '수', thu: '목', fri: '금', sat: '토', sun: '일' };
    return map[key];
  }

  function toggleDay(day: string) {
    studyDays[day] = !studyDays[day];
  }

  async function handleSubmit() {
    const selectedDays = Object.entries(studyDays)
      .filter(([_, selected]) => selected)
      .map(([key]) => convertDayKeyToKor(key));

    const body = {
      style: learningStyle,
      studyDays: selectedDays,
      sessionsPerDay: studySessions,
    };

    try {
      await saveUserPreference(userId, body);
      alert('✅ 설정이 저장되었습니다!');
      window.location.href = '/userinfo';
    } catch (err) {
      console.error(err);
      alert('⚠️ 설정 저장 실패!');
    }
  }
</script>


<section class="main-section-container">
  <div class="content-card">
    <div class="profile-header">
      <div class="avatar-placeholder"></div>
      <div class="user-info">
        <p class="user-email">{userId}@email.com</p>
        <p class="manage-settings-text">학습 설정 관리</p>
      </div>
    </div>

    <form on:submit|preventDefault={handleSubmit} class="settings-form">
      <div class="form-group">
        <p class="group-title" id="learning-style-label">학습 스타일 선택</p>
        <div class="radio-group" role="radiogroup" aria-labelledby="learning-style-label">
          <label class="radio-label">
            <input type="radio" name="learningStyle" value="focus" bind:group={learningStyle}>
            <span>하루 한 과목 집중</span>
          </label>
          <label class="radio-label">
            <input type="radio" name="learningStyle" value="parallel" bind:group={learningStyle}>
            <span>여러 과목 병행</span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <p class="group-title" id="study-days-label">학습 요일 선택</p>
        <div class="days-selector" role="group" aria-labelledby="study-days-label">
          {#each Object.entries(studyDays) as [dayKey, selected], index (dayKey)}
            <button 
              type="button" 
              class:selected={selected}
              on:click={() => toggleDay(dayKey)}
            >
              {index === 0 ? '월' : index === 1 ? '화' : index === 2 ? '수' : index === 3 ? '목' : index === 4 ? '금' : index === 5 ? '토' : '일'}
            </button>
          {/each}
        </div>
      </div>

      <div class="form-group">
        <label class="group-title" for="study-sessions">하루 학습 세션 수: {studySessions}</label>
        <div class="slider-group">
          <input type="range" id="study-sessions" min="1" max="10" bind:value={studySessions} class="slider-input">
          <span class="slider-value">{studySessions}</span>
        </div>
      </div>

      <button type="submit" class="save-button" on:click={handleSubmit}>설정 저장</button>
    </form>
  </div>
</section>

<style>
  .main-section-container {
    height: 100vh; 
    background-color: #f3f4f6;
    padding: 0 48px;
    display: flex;
    justify-content: center;
    align-items: center; 
    box-sizing: border-box;
    overflow: hidden; 
  }

  .content-card {
    max-height: 100%;
    overflow-y: visible;
    width: 672px;
    background-color: #ffffff;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    padding: 32px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap:12px;
    margin-top: 0;
  }

  .profile-header {
    display: flex;
    align-items: center;
    gap: 16px; /* Spacing between avatar and user-info */
  }

  .avatar-placeholder {
    width: 80px; /* Figma img 6:42 width */
    height: 80px; /* Figma img 6:42 height */
    background-color: #e0e0e0; /* Placeholder color */
    border-radius: 9999px; /* Figma Frame 6:43 cornerRadius */
    /* img 6:42 is invisible in Figma, so this is a placeholder */
  }

  .user-info .user-email {
    font-family: 'Inter', sans-serif;
    font-size: 24px; /* Figma text 6:120 */
    color: #1f2937; /* Figma text 6:120 */
    margin: 0 0 4px 0;
    font-weight: 400; /* Figma text 6:120 */
  }

  .user-info .manage-settings-text {
    font-family: 'Inter', sans-serif;
    font-size: 16px; /* Figma text 6:122 */
    color: #4b5563; /* Figma text 6:122 */
    margin: 0;
    font-weight: 400; /* Figma text 6:122 */
  }

  .settings-form {
    display: flex;
    flex-direction: column;
    gap: 32px; /* Spacing between form groups */
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 16px; /* Spacing between title and inputs within a group */
  }

  .group-title {
    font-family: 'Inter', sans-serif;
    font-size: 18px; /* Figma text 6:124, 6:127, 6:130 */
    color: #1f2937; /* Figma text 6:124, 6:127, 6:130 */
    font-weight: 400;
  }

  .radio-group, .days-selector {
    display: flex;
    flex-direction: column; /* radio-group items stack vertically based on Figma */
    gap: 8px; /* Spacing between radio/button items */
  }
  .days-selector {
    flex-direction: row; /* day buttons are horizontal */
    gap: 8px;
  }

  .radio-label {
    display: flex;
    align-items: center;
    padding: 12px 16px; /* Approximate padding for label 6:134 */
    background-color: #f9fafb; /* Figma label 6:134 */
    border: 1px solid #e5e7eb; /* Figma label 6:134 */
    border-radius: 8px; /* Figma label 6:134 */
    cursor: pointer;
  }

  .radio-label input[type="radio"] {
    margin-right: 8px;
    width: 16px; /* Figma input 6:146 */
    height: 16px; /* Figma input 6:146 */
  }
  .radio-label span {
    font-family: 'Inter', sans-serif;
    font-size: 16px; /* Figma text 6:167 */
    color: #374151; /* Figma text 6:167 */
  }

  .days-selector button {
    font-family: 'Inter', sans-serif;
    font-size: 16px; /* Figma text in buttons e.g. 6:151 */
    color: #374151; /* Figma text in buttons */
    background-color: #f3f4f6; /* Figma button 6:136 */
    border: 1px solid #e5e7eb; /* Figma button 6:136 */
    border-radius: 8px; /* Figma button 6:136 */
    padding: 12px; /* Adjusted for better appearance */
    width: 48px; /* Figma button 6:136 */
    height: 48px; /* Figma button 6:136 */
    cursor: pointer;
    text-align: center;
  }

  .days-selector button.selected {
    background-color: #d1d5db; /* Example selected color */
    border-color: #9ca3af;
  }

  .slider-group {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .slider-input {
    flex-grow: 1;
    /* Default browser styles for range input will be used initially */
    /* Custom styling for 6:143 (slider track) and 6:165 (slider thumb) is complex */
    /* and would require more specific CSS for cross-browser consistency. */
    height: 8px; /* Figma input 6:143 height */
    background: #e5e5e5; /* Figma input 6:143 track color */
    border-radius: 9999px;
    -webkit-appearance: none;
    appearance: none;
  }

  .slider-input::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px; /* Figma svg 6:170 width/height (thumb indicator) */
    height: 18px; /* Figma svg 6:170 width/height */
    background: #0075ff; /* Figma div 6:165 fill */
    border-radius: 50%;
    cursor: pointer;
  }

  .slider-input::-moz-range-thumb {
    width: 18px;
    height: 18px;
    background: #0075ff;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
  
  .slider-value {
    font-family: 'Inter', sans-serif;
    font-size: 16px; /* Figma text 6:145 */
    color: #374151; /* Figma text 6:145 */
    min-width: 20px; /* Ensure space for number */
    text-align: right;
  }

  .save-button {
    font-family: 'Inter', sans-serif;
    font-size: 16px; /* Figma text 6:133 */
    color: #ffffff; /* Figma text 6:133 */
    background-color: #1f2937; /* Figma button 6:78 */
    border: 1px solid #e5e7eb; /* Figma button 6:78, though likely meant for borderless */
    border-radius: 8px; /* Figma button 6:78 */
    padding: 12px 0; /* Height 48px -> 12px padding top/bottom if text is ~20px high */
    text-align: center;
    cursor: pointer;
    font-weight: 400;
  }
</style> 