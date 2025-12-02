📌 Supabase Todo App

간단한 Todo 웹 애플리케이션으로, Supabase Auth + Claude Code + Database + RLS를 활용하여
회원가입/로그인 및 사용자별 Todo 관리 기능을 제공합니다.
Google OAuth 로그인까지 연동된 완성형 프로젝트입니다.

🚀 Demo

👉 Live Site: https://dbtpdud.github.io/supabase-todo/

👉 Repository: https://github.com/dbtpdud/supabase-todo

🖼️ Preview

<img width="713" height="882" alt="image" src="https://github.com/user-attachments/assets/6bfa0324-2a55-4f34-88da-39643ec58293" />

✨ 주요 기능
🔐 사용자 인증 기능

Email 로그인 / 회원가입

Google 소셜 로그인 (OAuth)

로그인 후 사용자별 Todo만 조회되는 RLS(Security) 적용

회원가입 시 자동으로 프로필 생성

📝 Todo 기능

할일 생성 / 삭제 / 완료 변경

사용자별 Todo를 Supabase DB에 저장

최신순 정렬

실시간 반영되는 UI 구성

📊 Supabase MCP 연동 (optional)

Claude Desktop과 연동해 데이터베이스를 자연어로 분석 가능

테이블 스키마 설명, 인덱스 추천, 데이터 통계 조회 가능

<br>
🛠️ 기술 스택
종류	기술
Frontend	HTML, CSS, JavaScript
Backend (Serverless)	Supabase Auth, Supabase Database
Deployment	GitHub Pages
Dev Tools	VS Code, Claude Desktop (MCP), Git
<br>
📁 프로젝트 구조
/

├── index.html        # 메인 페이지

├── login.html        # 로그인 페이지

├── app.js            # Todo 로직

├── auth.js           # 로그인/회원가입 로직

└── README.md         # 프로젝트 설명 문서

<br>
🚀 사용 방법

1️⃣ 웹사이트 방문
👉 https://dbtpdud.github.io/supabase-todo/

2️⃣ 로그인 또는 회원가입

이메일 / 비밀번호로 로그인

Google 계정으로 로그인 가능

3️⃣ Todo 추가

입력창에 할일을 작성하고 추가

체크박스를 통해 완료 처리 가능

삭제 버튼으로 제거 가능

<br>
🔒 보안 (RLS 적용)

Supabase의 Row Level Security 정책을 통해
사용자별로 자신의 Todo 데이터만 조회·수정할 수 있습니다.

SELECT: auth.uid() = user_id

INSERT: auth.uid() = user_id

UPDATE: auth.uid() = user_id

DELETE: auth.uid() = user_id

<br>

🗂️ 향후 개선 아이디어

Todo 카테고리 기능 추가 (업무/개인/공부 등)

Todo 우선순위 기능

리마인더 알림 기능

UI 디자인 개선 (Tailwind / Chakra UI 등)

<br>
📞 문의 또는 개발자 정보

프로젝트 제작: 유세영 (세영)
문의 또는 개선 제안은 GitHub Issues로 남겨주세요!
