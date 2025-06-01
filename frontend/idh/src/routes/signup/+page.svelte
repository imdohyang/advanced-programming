<script>
  import { UserRound, CalendarCheck } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { checkUserExists } from '$lib/api/user';
  import { signupUser } from '$lib/api/user';
  import { Eye, EyeOff } from 'lucide-svelte'; 

  let userId = '';
  let password = '';
  let confirmPassword = '';

  let duplicateStatus = null;
  let passwordError = false;
  let passwordMismatch = false;
  let passwordTouched = false;
  let showModal = false;
  let missingField = null;
  let modalMessage = '';

  let userIdInput;
  let passwordInput;
  let confirmPasswordInput;

  let flashMessage = false;

  let showPassword = false;       
  let showConfirmPassword = false;

async function checkDuplicate() {
  if (!userId.trim()) return;

  try {
    const exists = await checkUserExists(userId);
    const newStatus = exists ? 'unavailable' : 'available';

    if (duplicateStatus !== newStatus) {
      flashMessage = true;
      duplicateStatus = null;
      setTimeout(() => {
        duplicateStatus = newStatus;
        flashMessage = false;
      }, 50); // 깜빡임 효과용 짧은 지연
    } else {
      // 동일한 상태일 경우에도 효과 주기
      flashMessage = true;
      duplicateStatus = null;
      setTimeout(() => {
        duplicateStatus = newStatus;
        flashMessage = false;
      }, 50);
    }

  } catch (e) {
    modalMessage = e.message || '중복 확인 중 오류가 발생했습니다.';
    showModal = true;
  }
}


  function validatePassword(pw) {
    return /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(pw);
  }

  function handlePasswordInput() {
    passwordTouched = true;
    passwordError = !validatePassword(password);
    passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  }

  function handleConfirmInput() {
    passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  }

  async function handleSignup() {
    if (!userId) {
      missingField = 'userId';
      modalMessage = '아이디는 필수 입력 사항입니다.';
      showModal = true;
      return;
    }

    if (!password) {
      missingField = 'password';
      modalMessage = '비밀번호는 필수 입력 사항입니다.';
      showModal = true;
      return;
    }

    if (!confirmPassword) {
      missingField = 'confirmPassword';
      modalMessage = '비밀번호 확인은 필수 입력 사항입니다.';
      showModal = true;
      return;
    }

    // ✅ 비밀번호 유효성 검사 추가
    if (password !== confirmPassword) {
      passwordMismatch = true;
      modalMessage = '비밀번호가 일치하지 않습니다. 다시 확인해주세요.';
      showModal = true;
      return;
    }

    if (password !== confirmPassword) {
      passwordMismatch = true;

      // ✅ 모달로 사용자에게 알림
      modalMessage = '비밀번호가 일치하지 않습니다. 다시 확인해주세요.';
      showModal = true;

      return;
    }

    if (password !== confirmPassword) {
      passwordMismatch = true;
      return;
    }

    try {
      await signupUser({ userId: userId.trim(), password: password.trim() });
      alert('가입이 완료되었습니다!');
      goto('/');
    } catch (e) {
      modalMessage = e.message;
      showModal = true;
    }
  }



  function handleModalConfirm() {
    showModal = false;
    if (missingField === 'userId') userIdInput.focus();
    else if (missingField === 'password') passwordInput.focus();
    else if (missingField === 'confirmPassword') confirmPasswordInput.focus();
    missingField = null;
  }

  function handleKeydown(event) {
    if (event.key === 'Enter') handleSignup();
  }
</script>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f3f4f6;
  }

  .header {
    background-color: #ffffff;
    border-bottom: 1px solid #e5e7eb;
    height: 64px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .header-container {
    width: 100%;
    max-width: 1280px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-sizing: border-box;
  }

  .header-container span {
    font-weight: 600;
    font-size: 1.25rem;
    color: #1f2937;
  }

  .content {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .signup-box {
    background: white;
    padding: 2rem;
    width: 400px;
    height: 650px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .icon-wrapper {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    background-color: #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 0.5rem;
  }

  h2 {
    font-size: 1.25rem;
    margin-bottom: 0.25rem;
  }

  p.description {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 1rem;
  }

  .form-group {
    text-align: left;
    margin-bottom: 0.5rem;
    min-height: 5.2rem;
    display: flex;
    flex-direction: column;
  }

  label {
    font-weight: 500;
    margin-bottom: 0.25rem;
    display: block;
  }

  input {
    width: 100%;
    padding: 0.5rem;
    border: 1.5px solid #222;
    border-radius: 4px;
    font-size: 1rem;
    background: #fff;
  }

  input.duplicate-fail,
  input.error,
  input.confirm-error {
    border-color: #dc2626 !important;
    background: #fef2f2 !important;
  }

  input.duplicate-success {
    border-color: #22c55e;
    background: #f0fdf4;
  }

  input::placeholder {
    color: #adaebc;
  }

  .duplicate-container {
    display: flex;
    gap: 0.5rem;
  }

  .duplicate-check {
    background-color: #1f2937;
    color: white;
    padding: 0.5rem 0.75rem;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    white-space: nowrap;
  }

  .msg-area {
    min-height: 1.7em;
    font-size: 0.85em;
    margin-top: 0.3em;
    display: flex;
    align-items: center;
    gap: 0.6em;
  }

  .status-message {
    color: #16a34a;
    font-weight: 500;
  }

  .status-message.fail {
    color: #dc2626;
  }

  .status-message.hidden,
  .error-message.hidden {
    visibility: hidden;
  }

  .error-message {
    color: #dc2626;
    font-weight: 500;
  }

  .note {
    color: #6b7280;
    font-size: 1em;
    font-weight: 400;
  }

  .signup-button {
    background-color: #1f2937;
    color: white;
    width: 100%;
    padding: 0.5rem;
    border: none;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
    margin-top: 0.5rem;
  }

  .footer {
    margin-top: 0.25rem;
    text-align: center;
    font-size: 0.875rem;
  }

  .footer a {
    display: block;
    margin-top: 0.25rem;
    text-decoration: underline;
    color: #1f2937;
    cursor: pointer;
  }

  .modal-backdrop {
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-box {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    text-align: center;
    width: 300px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.2);
  }

  .modal-button {
    background-color: #1f2937;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    margin-top: 1rem;
    cursor: pointer;
  }

  .password-wrapper {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
  }

  .password-wrapper input {
    width: 100%;
    padding: 0.5rem;
    padding-right: 2.5rem; /* 👈 오른쪽 Eye 버튼 공간 확보 */
    font-size: 1rem;
    border-radius: 4px;
    border: 1.5px solid #222;
    box-sizing: border-box;
  }

  .eye-button {
    position: absolute;
    top: 50%;
    right: 0.75rem;
    transform: translateY(-50%);
    background: none;
    border: none;
    padding: 0;
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
  }

</style>

<div class="wrapper">
  {#if showModal}
    <div class="modal-backdrop">
      <div class="modal-box">
        <p>{modalMessage}</p>
        <button class="modal-button" on:click={handleModalConfirm}>확인</button>
      </div>
    </div>
  {/if}

  <!-- 헤더 영역 (로그인과 동일한 위치로 구성) -->
  <div class="header">
    <div class="header-container">
      <CalendarCheck color="#1f2937" size={28} />
      <span>AutoPlanner</span>
    </div>
  </div>

  <!-- 회원가입 콘텐츠 -->
  <div class="content">
    <div class="signup-box">
      <div>
        <div class="icon-wrapper">
          <UserRound size={60} stroke="#6b7280" />
        </div>

        <h2>회원가입</h2>
        <p class="description">AutoPlanner의 회원이 되어보세요</p>

        <!-- 아이디 -->
        <div class="form-group">
          <label>아이디</label>
          <div class="duplicate-container">
            <input
              type="text"
              bind:value={userId}
              bind:this={userIdInput}   
              placeholder="아이디를 입력하세요"
              class:duplicate-success={duplicateStatus === 'available'}
              class:duplicate-fail={duplicateStatus === 'unavailable'}
              on:input={() => {
                userId = userId.trimStart(); // ✅ 공백 방지
                duplicateStatus = null; // ✅ 입력 시 중복확인 상태 초기화
              }}
              on:keydown={handleKeydown}
              autocomplete="username"
            />
            <button class="duplicate-check" on:click={checkDuplicate}>중복확인</button>
          </div>
            <div class="msg-area">
              {#if duplicateStatus === 'available'}
                <span class="status-message {flashMessage ? 'blink' : ''}">
                  사용 가능한 아이디입니다
                </span>
              {:else if duplicateStatus === 'unavailable'}
                <span class="status-message fail {flashMessage ? 'blink' : ''}">
                  이미 사용 중인 아이디입니다
                </span>
              {:else}
                <span class="status-message hidden">&nbsp;</span>
              {/if}
            </div>

        </div>

        <!-- 비밀번호 -->
        <div class="form-group">
          <label>비밀번호</label>
          <div class="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              bind:value={password}
              bind:this={passwordInput}
              placeholder="비밀번호를 입력하세요"
              on:input={handlePasswordInput}
              class:error={passwordError && passwordTouched}
              on:keydown={handleKeydown}
              autocomplete="new-password"
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
          <div class="msg-area">
            {#if passwordTouched && passwordError}
              <span class="error-message">❗영문 대/소문자, 숫자, 특수문자 조합 8자 이상</span>
            {:else}
              <span class="note">영문 대/소문자, 숫자, 특수문자 조합 8자 이상</span>
            {/if}
          </div>
        </div>


        <!-- 비밀번호 확인 -->
        <div class="form-group">
          <label>비밀번호 확인</label>
          <div class="password-wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              bind:value={confirmPassword}
              bind:this={confirmPasswordInput}
              placeholder="비밀번호를 다시 입력하세요"
              class:confirm-error={passwordMismatch}
              on:input={handleConfirmInput}
              on:keydown={handleKeydown}
              autocomplete="new-password"
            />
            <button
              type="button"
              class="eye-button"
              on:click={() => (showConfirmPassword = !showConfirmPassword)}
              aria-label="비밀번호 확인 보기 전환"
              tabindex="-1"
            >
              {#if showConfirmPassword}
                <EyeOff size={20} />
              {:else}
                <Eye size={20} />
              {/if}
            </button>
          </div>
          <div class="msg-area">
            <span class="error-message {passwordMismatch ? '' : 'hidden'}">
              {passwordMismatch ? '❗비밀번호가 일치하지 않습니다' : ''}
            </span>
          </div>
        </div>

      </div>

      <div>
        <button class="signup-button" on:click={handleSignup}>가입하기</button>
        <div class="footer">
          <p>이미 계정이 있으신가요?</p>
          <a on:click={() => goto('/')}>로그인하기</a>
        </div>
      </div>
    </div>
  </div>
</div>