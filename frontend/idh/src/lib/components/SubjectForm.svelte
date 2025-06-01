<script>
  export let index;
  export let subjectData;
  export let onChange;
  export let onRemove;
  export let userId;
  export let token;

  import { deleteExam, createExam } from '$lib/api/exam';

  const difficultyOptions = ['난이도 선택', '쉬움', '보통', '어려움'];

  function addUnit() {
    const newUnits = [...subjectData.units, { unitName: '', studyAmount: '', difficulty: '난이도 선택' }];
    const newSubject = { ...subjectData, units: newUnits };
    onChange(index, newSubject);
  }

  function removeUnit(i) {
    if (subjectData.units.length > 1) {
      const newUnits = subjectData.units.filter((_, j) => j !== i);
      const newSubject = { ...subjectData, units: newUnits };
      onChange(index, newSubject);
    }
  }

  function handleFieldChange(field, value) {
    const newSubject = { ...subjectData, [field]: value };
    onChange(index, newSubject);
  }

  function handleUnitChange(i, field, value) {
    const newUnits = subjectData.units.map((unit, idx) =>
      idx === i ? { ...unit, [field]: value } : unit
    );
    const newSubject = { ...subjectData, units: newUnits };
    onChange(index, newSubject);
  }

  async function handleDelete() {
    try {
      await deleteExam(userId, subjectData.subjectName, token);
      onRemove(index);
    } catch (err) {
      alert(`시험 삭제 실패: ${err.message}`);
    }
  }

  // ✅ 중복 과목명 체크 함수
  async function checkSubjectExists(userId, subjectName) {
    const res = await fetch(`https://advanced-programming.onrender.com/exam/${userId}`);
    if (!res.ok) {
      throw new Error('과목 정보 확인 실패');
    }
    const data = await res.json();
    return data.exams.some(exam => exam.subject.trim() === subjectName.trim());
  }

  async function handleConfirm() {
    try {
      // ✅ 과목 중복 체크
      const isDuplicate = await checkSubjectExists(userId, subjectData.subjectName);
      if (isDuplicate) {
        alert('⚠️ 이미 등록한 과목입니다.');
        return;
      }

      const chapters = subjectData.units.map(unit => ({
        chapterTitle: unit.unitName,
        contentVolume: Number(unit.studyAmount),
        difficulty: unit.difficulty,
      }));

      const examData = {
        userId,
        subject: subjectData.subjectName,
        startDate: subjectData.startDate,
        endDate: subjectData.endDate,
        importance: subjectData.importance,
        chapters,
      };

      console.log('✅ examData to send:', examData);
      await createExam(examData, token);
      alert('✅ 시험 등록 완료!');
    } catch (err) {
      alert(`시험 등록 실패: ${err.message}`);
    }
  }
</script>

<div class="subject-card">
  <h2 class="subject-card-title">과목 {index + 1}</h2>

  <div class="form-group">
    <label for="subject-name">과목명</label>
    <input type="text" id="subject-name" placeholder="과목명을 입력하세요" bind:value={subjectData.subjectName} on:input={(e) => handleFieldChange('subjectName', e.target.value)} />
  </div>

  <div class="date-group">
    <div class="form-group">
      <label>시작일</label>
      <input type="date" bind:value={subjectData.startDate} on:input={(e) => handleFieldChange('startDate', e.target.value)} />
    </div>
    <div class="form-group">
      <label>종료일</label>
      <input type="date" bind:value={subjectData.endDate} on:input={(e) => handleFieldChange('endDate', e.target.value)} />
    </div>
  </div>

  <div class="form-group">
    <label>중요도: {subjectData.importance}</label>
    <input type="range" min="1" max="5" bind:value={subjectData.importance} on:input={(e) => handleFieldChange('importance', +e.target.value)} class="slider" />
  </div>

  <div class="units-section">
    <h3 class="units-title">학습 단원</h3>
    {#each subjectData.units as unit, i (i)}
      <div class="unit-entry">
        <input type="text" placeholder="단원명" bind:value={unit.unitName} on:input={(e) => handleUnitChange(i, 'unitName', e.target.value)} class="unit-input" />
        <input type="text" placeholder="학습량" bind:value={unit.studyAmount} on:input={(e) => handleUnitChange(i, 'studyAmount', e.target.value)} class="unit-input" />
        <select bind:value={unit.difficulty} on:change={(e) => handleUnitChange(i, 'difficulty', e.target.value)} class="unit-select">
          {#each difficultyOptions as option}
            <option value={option}>{option}</option>
          {/each}
        </select>
        {#if subjectData.units.length > 1}
          <button type="button" class="remove-unit-btn" on:click={() => removeUnit(i)}>−</button>
        {/if}
      </div>
    {/each}
    <button type="button" on:click={addUnit} class="add-unit-btn">
      <span class="icon-placeholder">+</span> 단원 추가
    </button>
  </div>

  <div class="button-group">
    <button type="button" on:click={handleDelete} class="delete-btn">❌ 과목 삭제</button>
    <button type="button" on:click={handleConfirm} class="confirm-btn">✅ 확인</button>
  </div>

</div>


<style>
  .form-container {
    width: 896px; /* Figma div 6:562 width */
    display: flex;
    flex-direction: column;
    gap: 24px; /* Spacing between subject-card, add-subject-btn, create-plan-btn */
    padding: 20px; /* Padding around the entire form area */
    box-sizing: border-box;
  }

  .subject-card {
    background-color: #ffffff; /* Figma div 6:566 fill */
    border-radius: 12px; /* Figma div 6:566 cornerRadius */
    border: 1px solid #e5e7eb; /* Figma div 6:566 stroke */
    padding: 32px; /* Figma div 6:581 padding approx */
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .subject-card-title {
    font-family: 'Inter', sans-serif;
    font-size: 20px; /* Figma text 6:632 */
    color: #1f2937; /* Figma text 6:632 */
    margin: 0 0 8px 0; /* Added some bottom margin */
    font-weight: 400;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-group label {
    font-family: 'Inter', sans-serif;
    font-size: 16px; /* Figma text e.g. 6:648 */
    color: #374151; /* Figma text e.g. 6:648 */
    font-weight: 400;
  }

  .form-group input[type="text"],
  .form-group input[type="date"],
  .form-group select {
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    padding: 12px;
    border: 1px solid #d1d5db; /* Figma input stroke 6:638 */
    border-radius: 8px; /* Figma input cornerRadius 6:638 */
    box-sizing: border-box;
    height: 50px; /* Figma input height 6:638 */
  }
  .form-group input[type="date"] {
    color: #adaebc; /* Placeholder color like in Figma, actual date will be darker */
  }
  /* Fix for date placeholder not showing in some browsers */
  input[type="date"]:required:invalid::-webkit-datetime-edit {
      color: transparent;
  }
  input[type="date"]:focus::-webkit-datetime-edit {
      color: black !important;
  }


  .date-group {
    display: flex;
    gap: 16px;
  }
  .date-group .form-group {
    flex: 1;
  }

  .slider {
    width: 100%;
    height: 8px; /* Figma input 6:657 height */
    background: #e5e5e5; /* Figma input 6:657 track color */
    border-radius: 9999px;
    -webkit-appearance: none;
    appearance: none;
    margin-top: 8px; /* Align with label */
  }
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px; /* Figma svg 6:689 approx size */
    height: 18px;
    background: #0075ff; /* Figma div 6:681 fill */
    border-radius: 50%;
    cursor: pointer;
  }
  .slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    background: #0075ff;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }

  .units-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .units-title {
    font-family: 'Inter', sans-serif;
    font-size: 18px; /* Figma text 6:644 */
    color: #1f2937; /* Figma text 6:644 */
    font-weight: 400;
    margin: 0;
  }
  .unit-entry {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .unit-input {
    flex: 1;
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    padding: 12px;
    border: 1px solid #d1d5db; /* Figma input 6:682 */
    border-radius: 8px; /* Figma input 6:682 */
    height: 50px; /* Figma input 6:682 */
    box-sizing: border-box;
  }
  .unit-select {
    flex-basis: 150px; /* Give select a base width */
    height: 50px;
    padding: 0 12px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    color: #1f2937; /* Figma text 6:685 */
    background-color: #ffffff;
  }
  .remove-unit-btn {
    background-color: #ef4444; /* Red for removal */
    color: white;
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .add-unit-btn {
    font-family: 'Inter', sans-serif;
    font-size: 16px; /* Figma text 6:665 */
    color: #4b5563; /* Figma text 6:665 */
    background-color: transparent;
    border: 1px dashed #d1d5db; /* Dashed border for add buttons usually */
    border-radius: 8px;
    padding: 10px 16px;
    cursor: pointer;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .icon-placeholder {
    /* Basic styling for the plus icon placeholder */
    display: inline-block;
    width: 14px; /* Figma frame 6:661 */
    height: 16px; /* Figma frame 6:661 */
    /* background-color: #4b5563; For actual icon or SVG */
    text-align: center;
    line-height: 16px;
  }

  .add-subject-btn {
    font-family: 'Inter', sans-serif;
    font-size: 16px; /* Figma text 6:584 */
    color: #4b5563; /* Figma text 6:584 */
    background-color: #ffffff; /* Figma button 6:567 background (assuming white if not specified transparent) */
    border: 1px solid #d1d5db; /* Figma button 6:567 stroke */
    border-radius: 12px; /* Figma button 6:567 cornerRadius */
    padding: 18px 0; /* Height 60px -> approx 18px padding if text is ~20px */
    cursor: pointer;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .create-plan-btn {
    font-family: 'Inter', sans-serif;
    font-size: 16px; /* Figma text 6:589 */
    color: #ffffff; /* Figma text 6:589 */
    background-color: #1f2937; /* Figma button 6:568 fill */
    border: 1px solid #1f2937; /* Figma button 6:568 stroke - assuming same as fill */
    border-radius: 8px; /* Figma button 6:568 cornerRadius */
    padding: 16px 0; /* Height 56px -> approx 16px padding */
    cursor: pointer;
    text-align: center;
    font-weight: 400;
  }

  .button-group {
    display: flex;
    gap: 16px;
  }

  .delete-btn,
  .confirm-btn {
    flex: 1;
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    padding: 12px;
    height: 50px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    background-color: #ffffff;
    color: #374151;
    cursor: pointer;
    box-sizing: border-box;
  }


</style> 