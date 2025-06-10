<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  import Header from '$lib/components/Header.svelte';
  import Welcome from '$lib/components/Welcome.svelte';
  import MyInfoCard from '$lib/components/MyInfoCard.svelte';
  import PlanCard from '$lib/components/PlanCard.svelte';
  import NotionLink from '$lib/components/NotionLink.svelte';

  import { user } from '$lib/stores/user';
  import { get } from 'svelte/store';

  let userId: string | null = null;
  let loading = true;

  onMount(() => {
    const currentUser = get(user);
    if (!currentUser?.userId) {
      goto('/'); // 로그인 페이지로 리디렉션
      return;
    }
    userId = currentUser.userId;
    loading = false;
  });
</script>

<Header />

<div class="main-wrapper">
  <section class="main-content-area">
    <div class="content-column">
      <Welcome />
      <div class="cards-row">
        <MyInfoCard />
          {#if loading}
            <p>userId를 불러오는 중입니다...</p>
          {:else if userId}
            <PlanCard userId={userId} />
          {:else}
            <p>userId가 존재하지 않습니다.</p>
          {/if}
      </div>
      <NotionLink />
    </div>
  </section>
</div>

<style>
  .main-wrapper {
    height: calc(100vh - 64px);
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