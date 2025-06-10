<!-- <script lang='ts'>
  import Header from '$lib/components/Header.svelte';
  import SettingsSummary from '$lib/components/SettingsSummary.svelte'; 

  // Props or data for SettingsSummary can be passed here later
</script> -->

<script lang='ts'>
  import Header from '$lib/components/Header.svelte';
  import SettingsSummary from '$lib/components/SettingsSummary.svelte'; 
  import { onMount } from 'svelte';
  import { getUserPreference } from '$lib/api/userPreference';
  import { user } from '$lib/stores/user';
  import { get } from 'svelte/store';

  let userEmail = '';
  let learningStyle = '';
  let studyDays: string[] = [];
  let studySessions = 0;
  let isLoaded = false;

  onMount(async () => {
    const currentUser = get(user);
    if (!currentUser?.userId) {
      alert('로그인이 필요합니다.');
      window.location.href = '/';
      return;
    }

    userEmail = currentUser.name
      ? `${currentUser.name} (${currentUser.userId})`
      : `${currentUser.userId}`;

    try {
      const res = await getUserPreference();
      learningStyle = res.style === 'focus' ? '하루 한 과목 집중' : '여러 과목 병행';
      studyDays = res.studyDays;
      studySessions = res.sessionsPerDay;
      isLoaded = true;
    } catch (e) {
      console.error('불러오기 실패:', e);
    }
  });
</script>


<div class="page-container">
  <Header />
  <main class="content-area">
    {#if userEmail && learningStyle && studyDays.length > 0 && studySessions > 0}
      <SettingsSummary
        {userEmail}
        {learningStyle}
        {studyDays}
        {studySessions}
      />
    {:else}
      <p>설정 정보를 불러오는 중입니다...</p>
    {/if}
  </main>

</div>

<style>
  .page-container {
    width: 100%;
    max-width: 1440px;
    height: 100vh;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    border: 1px solid #ced4da;
    background-color: #ffffff;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .content-area {
    flex-grow: 1;
    padding: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: auto;
    background-color: #f3f4f6;
  }

  :global(body) {
    background-color: #e5e5e5; 
    margin: 0;
    font-family: 'Inter', sans-serif;
  }
</style> 