# Popup Information

TypeScript 기반 풀스택 게시판 프로젝트입니다. Express + Prisma(MySQL) 백엔드와 Next.js(App Router) 프론트엔드로 구성되어 있으며, JWT 쿠키 인증·CRUD·페이징·CI/CD 배포를 지원합니다.

## 아키텍처

```
popup-information/
├── src/                    # Express 백엔드 (API :3000)
│   ├── modules/            # auth, users, posts, comments
│   ├── middlewares/        # auth, validate, error
│   └── lib/prisma.ts
├── prisma/                 # MySQL 스키마 & 마이그레이션
├── frontend/               # Next.js 프론트엔드 (:5173)
│   ├── src/app/            # 페이지 (/, /login, /register, /posts/write)
│   ├── src/store/          # Zustand useAuthStore
│   └── src/middleware.ts   # 라우트 가드
└── .github/workflows/      # GitHub Actions CI/CD
```

```mermaid
flowchart LR
    Browser --> NextJS[Next.js :5173]
    NextJS -->|withCredentials| API[Express API :3000]
    API --> MySQL[(MySQL)]
    NextJS --> Middleware[Next.js Middleware]
```

| 구분 | 기술 스택 |
|------|-----------|
| Backend | Node.js, Express, TypeScript, Prisma ORM, MySQL |
| Frontend | Next.js 16, TypeScript, Zustand, Axios |
| Auth | JWT + httpOnly Cookie |
| Deploy | GitHub Actions, PM2, Ubuntu |

## 보안 핵심 포인트

| 영역 | 구현 |
|------|------|
| 비밀번호 | `bcrypt.hash(password, 10)` — plain text 저장 금지 |
| 인증 토큰 | JWT를 **httpOnly + SameSite=Strict** 쿠키로 발급 (XSS로 토큰 탈취 방지) |
| HTTP 헤더 | `helmet` (CSP Swagger 호환 설정) |
| CORS | `credentials: true` + 명시적 origin |
| 입력 검증 | `class-validator` + `class-transformer` (whitelist) |
| 에러 처리 | production 환경에서 5xx 스택 숨김 (`Internal Server Error`만 반환) |
| 프론트 라우트 가드 | Next.js Middleware — 비로그인 시 `/posts/write` → `/login` |
| 권한 검증 | 게시글/댓글 수정·삭제 시 `authorId === req.user.id` 검증 → `403 Forbidden` |

## API 엔드포인트 요약

| Method | Endpoint | Auth | 설명 |
|--------|----------|------|------|
| POST | `/api/users` | X | 회원가입 |
| POST | `/api/auth/login` | X | 로그인 (쿠키 발급) |
| GET | `/api/auth/me` | O | 현재 유저 정보 |
| POST | `/api/auth/logout` | X | 로그아웃 (쿠키 삭제) |
| GET | `/api/posts?page&limit` | X | 게시글 목록 (페이징) |
| POST | `/api/posts` | O | 게시글 작성 |
| PATCH | `/api/posts/:id` | O | 본인 게시글 수정 |
| DELETE | `/api/posts/:id` | O | 본인 게시글 삭제 |
| PATCH | `/api/comments/:id` | O | 본인 댓글 수정 |
| DELETE | `/api/comments/:id` | O | 본인 댓글 삭제 |

Swagger 문서: `http://localhost:3000/api-docs`

---

## 로컬 개발 환경 설정

### 사전 요구사항

- Node.js 20+
- MySQL 8.0 (로컬 설치)

### 1. 백엔드 설정

```bash
# 의존성 설치
npm install

# 환경변수 설정
copy .env.example .env   # Windows
# DATABASE_URL, JWT_SECRET 등 수정

# DB 마이그레이션
npx prisma migrate deploy
npx prisma generate

# 개발 서버 실행 (:3000)
npm run dev
```

### 2. 프론트엔드 설정

```bash
cd frontend
npm install

# 환경변수 설정
copy .env.example .env.local

# 개발 서버 실행 (:5173)
npm run dev
```

### 접속 URL

- 프론트: http://localhost:5173
- API: http://localhost:3000
- Swagger: http://localhost:3000/api-docs

---

## 프로덕션 빌드

```bash
# 백엔드
npm run build          # prisma generate + tsc
npm run start:prod     # NODE_ENV=production

# 프론트엔드
cd frontend
npm run build
npm run start:prod     # :5173
```

### PM2로 한 번에 실행

```bash
pm2 start ecosystem.config.js
pm2 status
pm2 logs
```

---

## 클라우드 서버(Ubuntu) 최초 배포

### 1. 서버 준비

```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# MySQL, PM2, Git
sudo apt install -y mysql-server git
sudo npm install -g pm2
```

### 2. 프로젝트 클론 및 환경변수

```bash
cd /var/www
git clone <YOUR_REPO_URL> popup-information
cd popup-information

# 백엔드 환경변수
cp .env.example .env
nano .env
# NODE_ENV=production
# DATABASE_URL=mysql://user:pass@localhost:3306/popup_db
# CORS_ORIGIN=http://YOUR_SERVER_IP:5173
# JWT_SECRET=강력한-랜덤-시크릿

# 프론트엔드 환경변수
cp frontend/.env.production.example frontend/.env.production
nano frontend/.env.production
# NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:3000
```

### 3. DB 초기화 및 빌드

```bash
# MySQL에서 DB 생성 (scripts/init-db.sql 참고)
mysql -u root -p < scripts/init-db.sql

npm ci
npx prisma migrate deploy
npm run build

cd frontend && npm ci && npm run build && cd ..
```

### 4. PM2 실행

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. 방화벽 (필요 시)

```bash
sudo ufw allow 3000
sudo ufw allow 5173
sudo ufw allow OpenSSH
```

---

## GitHub Actions CI/CD

`main` 브랜치에 push하면 자동으로 CI 빌드 검증 후 Ubuntu 서버에 SSH 배포합니다.

### 워크플로우 단계

1. 코드 체크아웃
2. Node.js 20 환경 세팅
3. 백엔드/프론트 의존성 설치 및 빌드 검증 (Lint 포함)
4. SSH로 서버 접속 → `git pull` → migrate → build → PM2 reload

### GitHub Secrets 설정

Repository → Settings → Secrets and variables → Actions:

| Secret | 설명 | 예시 |
|--------|------|------|
| `SSH_HOST` | 서버 IP/도메인 | `123.45.67.89` |
| `SSH_USERNAME` | SSH 사용자 | `ubuntu` |
| `SSH_KEY` | Private Key (PEM 전체) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SSH_PORT` | SSH 포트 (선택) | `22` |
| `DEPLOY_PATH` | 프로젝트 경로 | `/var/www/popup-information` |

> 민감한 DB/JWT 값은 서버의 `.env` 파일에만 저장하고, GitHub Secrets에는 SSH 접속 정보만 넣습니다.

### 중첩 Git 저장소 주의

`frontend/.git`이 존재하면 제거 후 루트 repo에 통합하세요:

```bash
rm -rf frontend/.git
```

---

## 환경 변수 참고

### 백엔드 (`.env`)

| 변수 | 설명 |
|------|------|
| `PORT` | API 포트 (기본 3000) |
| `NODE_ENV` | `development` / `production` |
| `DATABASE_URL` | MySQL 연결 URL |
| `CORS_ORIGIN` | 프론트엔드 origin |
| `JWT_SECRET` | JWT 서명 키 |
| `JWT_EXPIRES_IN` | 토큰 만료 (기본 7d) |

### 프론트엔드 (`frontend/.env.local` / `.env.production`)

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_API_URL` | 백엔드 API URL |

---

## 라이선스

ISC
