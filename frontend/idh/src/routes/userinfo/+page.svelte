<script lang='ts'>
  import Header from '$lib/components/Header.svelte';
  import SettingsSummary from '$lib/components/SettingsSummary.svelte';
  import { onMount } from 'svelte';
  import { getUserPreference } from '$lib/api/userPreference';

  let userEmail = '';
  let learningStyle = '';
  let studyDays: string[] = [];
  let studySessions = 0;

  onMount(async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('로그인이 필요합니다.');
      window.location.href = '/';
      return;
    }

    userEmail = `${userId}@email.com`;

    try {
      const res = await getUserPreference(userId);
      learningStyle = res.style === 'focus' ? '하루 한 과목 집중' : '여러 과목 병행';
      studyDays = res.studyDays;
      studySessions = res.sessionsPerDay;
    } catch (e) {
      console.error('불러오기 실패:', e);
    }
  });
</script>


<div class="page-wrapper">
  <Header />
  <main class="content-area">
    <SettingsSummary
      {userEmail}
      {learningStyle}
      {studyDays}
      {studySessions}
    />
  </main>
</div>

<style>
  .page-wrapper {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #f3f4f6;
  }

  .content-area {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 32px;
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    font-family: 'Inter', sans-serif;
    background-color: #f3f4f6;
  }
</style>
