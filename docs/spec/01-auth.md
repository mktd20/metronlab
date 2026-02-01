# 01. Authentication

## Landing Page (`/`)

**목적**: 비로그인 사용자에게 서비스를 소개하고 가입을 유도한다.

**구성요소**:
- Hero Section: 서비스 핵심 가치 ("AI가 분석하는 나만의 연습 매니저")
- Feature Highlights: 주요 기능 3~4개 카드 형태
- How It Works: 사용 흐름 3단계 시각화
- Instrument Showcase: 지원 악기 아이콘 나열
- CTA: "시작하기" 버튼 → 회원가입 / 로그인
- Footer: 링크, 저작권

## Login Methods

- Email + Password (기본)
- OAuth: Google, GitHub (선택)

## Features

- 회원가입 (email, password, display name)
- 로그인 / 로그아웃
- 세션 기반 인증 (Lucia Auth)
- 비밀번호 재설정 (이메일 링크)

## DB Schema

```
users
├── id: string (UUID)
├── email: string (unique)
├── hashed_password: string
├── display_name: string
├── avatar_url: string | null
├── created_at: timestamp
└── updated_at: timestamp

sessions
├── id: string
├── user_id: string (FK → users)
├── expires_at: timestamp
└── created_at: timestamp
```

## API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/reset-password
GET    /api/auth/me
```
