<script lang="ts">
  import { CalendarCheck, UserRound, Eye, EyeOff } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { login } from '$lib/api/auth';

  let userId = '';
  let password = '';
  let loginError = false;
  let errorMessage = '';
  let userIdInput;
  let showPassword = false; // 디폴트: false (비밀번호 숨김, EyeOff 표시)

  async function handleLogin() {
    try {
      const result = await login({ userId, password });
      sessionStorage.setItem('token', result.token);     
      sessionStorage.setItem('userId', result.userId);
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
    padding: 1rem;
  }

  .login-box {
    background: white;
    padding: 2rem;
    width: 100%;
    max-width: 400px;
    height: auto;
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
    box-sizing: border-box;
    font-size: 1rem;
    height: 40px;
    line-height: 1.2;
    vertical-align: middle;
  }

  .password-wrapper {
    position: relative;
    width: 100%;
    margin-bottom: 1rem;
    height: 40px;
    display: flex;
    align-items: center;
    margin-top: 12px; /* 비밀번호 칸만 아래로 */
  }

  .password-wrapper input {
    width: 100%;
    padding: 0.5rem;
    padding-right: 2.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 1rem;
    height: 40px;
    line-height: 1.2;
    vertical-align: middle;
  }

  .eye-button {
    position: absolute;
    top: 50%;
    right: 0.75rem;
    transform: translateY(-50%);
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #6b7280;
    box-sizing: border-box;
  }

  .eye-button :global(svg) {
    width: 20px !important;
    height: 20px !important;
    display: block;
    margin: 0;
    padding: 0;
    vertical-align: middle;
    margin-bottom: 15px;
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
    height: 40px;
    font-size: 1rem;
    box-sizing: border-box;
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

  @media (max-width: 480px) {
    .login-box {
      padding: 1.25rem;
    }

    .login-box h2 {
      font-size: 1.125rem;
    }

    .login-box p {
      font-size: 0.8rem;
    }

    button {
      font-size: 0.95rem;
      height: 36px;
    }
    .password-wrapper,
    .password-wrapper input {
      height: 36px;
    }
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
        <div class="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            bind:value={password}
            placeholder="비밀번호를 입력하세요"
          />
          <button
            type="button"
            class="eye-button"
            on:click={() => (showPassword = !showPassword)}
            aria-label="비밀번호 보기 전환"
            tabindex="-1"
          >
            {#if showPassword}
              <EyeOff size={20} />
            {:else}
              <Eye size={20} />
            {/if}
          </button>
        </div>
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
