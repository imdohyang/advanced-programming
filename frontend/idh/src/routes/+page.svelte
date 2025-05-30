<script lang="ts">
  import { CalendarCheck, UserRound } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { login } from '$lib/api/auth';

  let userId = '';
  let password = '';
  let loginError = false;
  let errorMessage = '';
  let userIdInput;

  async function handleLogin() {
    try {
      const result = await login({ userId, password }); // ✅ userId 키 사용
      localStorage.setItem('token', result.access_token);
      loginError = false;
      goto('/main');
    } catch (e) {
      loginError = true;
      errorMessage = e.message || '로그인에 실패했습니다.';
      userId = '';
      password = '';
      userIdInput?.focus();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') handleLogin();
  }
</script>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f3f4f6;
  }

  header {
    background-color: white;
    border-bottom: 1px solid #e5e7eb;
    height: 64px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
  }

  .header-container {
    width: 100%;
    max-width: 1280px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
  }

  .logo-section {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .logo-text {
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 1.25rem;
    color: #1f2937;
    line-height: 1;
  }

  .content {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .login-box {
    background: white;
    padding: 2rem;
    width: 400px;
    height: 650px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
    display: flex;
    flex-direction: column;
  }

  .icon-wrapper {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    background-color: #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
  }

  .login-box h2 {
    font-size: 1.25rem;
    margin-bottom: 0.25rem;
  }

  .login-box p {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 1.5rem;
  }

  .login-box label {
    display: block;
    text-align: left;
    font-weight: 500;
    margin-bottom: 0.25rem;
  }

  input[type="text"],
  input[type="password"] {
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  input::placeholder {
    color: #adaebc;
  }

  .error {
    color: #dc2626;
    font-size: 0.85rem;
    text-align: left;
    margin-top: -0.25rem;
    margin-bottom: 0.5rem;
    height: 1.5rem;
  }

  .options {
    display: flex;
    justify-content: flex-end;
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }

  button {
    background-color: #1f2937;
    color: white;
    border: none;
    width: 100%;
    padding: 0.5rem;
    border-radius: 4px;
    font-weight: bold;
    margin-bottom: 1rem;
    cursor: pointer;
  }

  .divider {
    height: 1px;
    background-color: #e5e7eb;
    margin: 1rem 0;
  }

  .footer {
    font-size: 0.875rem;
  }

  .footer a {
    display: block;
    color: #1f2937;
    text-decoration: underline;
    cursor: pointer;
    margin-top: 0.25rem;
  }
</style>

<div class="wrapper">
  <header>
    <div class="header-container">
      <div class="logo-section">
        <CalendarCheck color="#1f2937" size={28} />
        <span class="logo-text">AutoPlanner</span>
      </div>
    </div>
  </header>

  <div class="content">
    <div class="login-box" on:keydown={handleKeydown}>
      <div class="icon-wrapper">
        <UserRound size={60} stroke="#6b7280" />
      </div>

      <h2>환영합니다</h2>
      <p>AutoPlanner에 로그인 하세요</p>

      <div>
        <label>아이디</label>
        <input
          bind:this={userIdInput}
          type="text"
          bind:value={userId}
          placeholder="아이디를 입력하세요"
        />
      </div>
      <div>
        <label>비밀번호</label>
        <input
          type="password"
          bind:value={password}
          placeholder="비밀번호를 입력하세요"
        />
      </div>

      <div class="error">
        {#if loginError}
          {errorMessage || '아이디 또는 비밀번호가 일치하지 않습니다.'}
        {/if}
      </div>

      <button on:click={handleLogin}>로그인</button>

      <div class="divider"></div>
      <div class="footer">
        <p>계정이 없으신가요?</p>
        <a on:click={() => goto('/signup')}>회원가입</a>
      </div>
    </div>
  </div>
</div>
