# AI Study Planner 📚

AI 기반 개인 맞춤형 학습 계획표 생성 서비스

## 🎯 프로젝트 개요

### 배경
- **문제점**: 학생들은 여러 과목을 공부해야 하지만, 어떤 과목을 먼저 해야 할지, 하루에 어느 정도 해야 하는지 고민이 많음
- **기존 서비스의 한계**: 사용자가 직접 입력해야 하는 번거로움으로 인해 결국 무계획으로 공부하는 경우가 많음
- **해결 방안**: AI를 활용한 자동화된 학습 계획표 생성으로 계획 수립의 부담을 줄임

### 목표
- 사용자의 개인 공부 성향과 학습 내용을 바탕으로 **AI가 자동으로 최적화된 학습 계획표 생성**
- 추천된 계획표의 **수정/삭제 기능** 제공으로 유연한 계획 관리
- **Notion Calendar 연동**을 통한 편리한 일정 관리
- **타겟층**: 효율적인 학습 계획이 필요한 학생들

## 🏗️ 시스템 아키텍처

### Frontend
```
Browser → Svelte → Netlify → Authentication Check
    ↓
[Auth Success] → Main Page
[Auth Failed] → Login Page
```

### Backend Pipeline
```
API Server ← → Swagger UI (Documentation)
    ↓
Auth Module (JWT) ← → User Info (Encrypted)
    ↓
Prisma ORM ← → PostgreSQL Database
    ↓
ChatGPT API → GPT Response Data → Notion API
```

## 🛠️ 기술 스택

### Frontend
- **Framework**: Svelte
- **Deployment**: Netlify
- **Features**: 반응형 웹 디자인, API 연동

### Backend
- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Documentation**: Swagger UI
- **Authentication**: JWT

### AI & External Services
- **AI**: meta-llama/Llama-3.3-70B-Instruct API
- **Calendar Integration**: Notion API

## 📋 주요 기능

### 사용자 관리
- 회원가입/로그인 (JWT 기반 인증)
- 개인 공부 성향 프로필 설정
  - 하루 학습 패턴 (한 과목 집중 vs. 여러 과목 병행)
  - 선호 학습 시간대
  - 집중력 지속 시간 등

### 학습 계획 생성
- 과목별 정보 입력
  - 과목명, 마감일, 중요도
  - 챕터별 세부 정보
- AI 기반 맞춤형 학습 스케줄 자동 생성 후, 이를 DB에 저장장

### 외부 연동
- Notion Calendar 연동
- 실시간 일정 동기화

## 👥 팀 구성 및 역할

### Frontend Team
- **임도향**: 로그인 페이지 구현
- **김수현**: 메인 화면 구현

### Backend Team
- **우지예**: AI 연동 및 스케줄 생성 담당
- **최보경**: 데이터베이스 및 CRUD 기능 담당
- **정유희**: 사용자 인증 및 외부 API 연동 담당

## 🗄️ 데이터베이스 설계

### 주요 테이블
- **User**: 사용자 기본 정보 및 인증 데이터
- StudyPreference: 개인 학습 성향 정보
- **Subject**: 과목 정보 (이름, 마감일, 중요도)
- **Chapter**: 챕터별 세부 정보
- Plan: 생성된 학습 계획 (✅ Plan 모델은 schema에 추가 필요)
- **NotionIntegration**: Notion 연동 정보

## 🚀 프로젝트 일정

### Phase 1 (~04/30)
- 프로젝트 정의 및 기능 목적 정리

### Phase 2 (~05/07)
- 아키텍처 구성 및 전반적인 구현 계획

### Phase 3 (~05/12)
- **Frontend**: 화면 디자인 및 구조 설계
- **Backend**: 데이터베이스, 서버, 통신 흐름 구현

### Phase 4 (~05/20)
- 기능 개발
  - **Frontend**: 웹 페이지 구현
  - **Backend**: 외부 API 연동

### Phase 5 (~05/27)
- Frontend-Backend 연동 및 통합 테스트

### Phase 6 (~06/04)
- 통합 테스트 및 최종 배포

## 🔧 설치 및 실행

### Prerequisites
Backend
  - Nest Js
  - PostgreSQL
  - Prisma
Frontend
  - Svelte
  - Netlify 

### Backend Setup
```bash
# Repository 클론
git clone [repository-url]
cd ai-study-planner/backend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일에서 DATABASE_URL, JWT_SECRET, OPENAI_API_KEY, NOTION_API_KEY 설정

# 데이터베이스 마이그레이션
npx prisma migrate dev

# 서버 실행
npm run start:dev
```

### Frontend Setup
```bash
cd ai-study-planner/frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 📖 API 문서

API 문서는 Swagger UI를 통해 확인할 수 있습니다.
- 개발 환경: `http://localhost:4523/api/docs`

### 📖 주요 API 엔드포인트
🔐 인증 (Auth)
POST /auth/login – 로그인 및 JWT 토큰 발급

GET /auth/notion/redirect – Notion OAuth 인증 리다이렉트

GET /auth/notion/callback – Notion OAuth 콜백 처리

👤 사용자 (User)
POST /user – 사용자 등록 (회원가입)

GET /user/{id} – 특정 사용자 조회

GET /user/all – 전체 사용자 목록 조회

⚙️ 사용자 학습 성향 (UserPreference)
POST /user-preference/{userId} – 사용자 학습 성향 등록

GET /user-preference/{userId} – 사용자 학습 성향 조회

📚 시험 정보 (Exam)
POST /exam – 시험 정보 등록

GET /exam/{userId} – 사용자 시험 정보 조회

DELETE /exam/{userId} – 사용자 시험 전체 삭제

DELETE /exam/{userId}/{subject} – 특정 과목 시험 정보 삭제

🤖 AI 학습 계획 생성 (AI Plan)
POST /ai-plan/generate – AI 기반 학습 계획 생성 (LLM 또는 rule 기반)

📝 계획 확인 및 연동 (Planner)
POST /planner/{id}/confirm – 생성된 학습 계획 Notion 연동 (mock)



## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 문의사항이나 버그 리포트는 이슈를 통해 남겨주세요.

---
**AI Study Planner** - 똑똑한 학습 계획으로 더 효율적인 공부를!