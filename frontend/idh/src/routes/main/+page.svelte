<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  // 기존 import는 그대로 유지
  import Header from '$lib/components/Header.svelte';
  import Welcome from '$lib/components/Welcome.svelte';
  import MyInfoCard from '$lib/components/MyInfoCard.svelte';
  import PlanCard from '$lib/components/PlanCard.svelte';
  import NotionLink from '$lib/components/NotionLink.svelte';

  let userId = null;

  onMount(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      goto('/'); // 로그인 페이지로 리디렉션
    }

    userId = localStorage.getItem('userId');
  });
</script>


<!-- 헤더 -->
<Header />

<!-- 전체 구조 -->
<div class="main-wrapper">
  <section class="main-content-area">
    <div class="content-column">
      <Welcome />
      <div class="cards-row">
        <MyInfoCard />
        {#if userId}
          <PlanCard userId={userId}/>
        {:else}
          <p>userId를 불러오는 중입니다...</p>
        {/if}
      </div>
      <NotionLink />
    </div>
  </section>
</div>

<style>
  /* 전체 화면을 100vh로 고정 */
  .main-wrapper {
    height: calc(100vh - 64px); /* 헤더(64px)를 제외한 나머지 영역 */
    background-color: #f3f4f6;
    display: flex;
    justify-content: center;
    overflow-y: hidden;
  }

  .main-content-area {
    width: 100%;
    max-width: 1280px;
    padding: 0 24px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .content-column {
    width: 896px;
    display: flex;
    flex-direction: column;
    gap: 32px;
    padding: 48px 0;
    box-sizing: border-box;
    flex-shrink: 0;
  }

  .cards-row {
    display: flex;
    justify-content: space-between;
    gap: 32px;
    box-sizing: border-box;
  }
</style>
