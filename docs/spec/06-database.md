# 06. Database Schema

## ERD Overview

```
users ──────────────── sessions (auth)
  │
  ├── instruments
  │
  ├── practice_sessions
  │     ├── practice_tags
  │     ├── ai_analyses (session-level)
  │     └── ai_generated_sheets (AI가 생성한 악보)
  │
  ├── ai_generated_sheets (사용자별 AI 생성 악보 라이브러리)
  │
  ├── ai_analyses (weekly/monthly)
  │
  ├── user_achievements
  │     └── achievements
  │
  ├── practice_goals
  │
  ├── practice_routines
  │     └── routine_items
  │
  └── recordings
```

## Core Tables

### users
```
├── id: string (UUID)
├── email: string (unique)
├── hashed_password: string
├── display_name: string
├── avatar_url: string | null
├── created_at: timestamp
└── updated_at: timestamp
```

### sessions (auth)
```
├── id: string
├── user_id: string (FK → users)
├── expires_at: timestamp
└── created_at: timestamp
```

### instruments
```
├── id: string (UUID)
├── user_id: string (FK → users)
├── type: string (guitar, bass, drums, keyboard, violin, etc.)
├── name: string
├── is_custom: boolean
├── settings: json
├── created_at: timestamp
└── updated_at: timestamp
```

## Practice Tables

### practice_sessions
```
├── id: string (UUID)
├── user_id: string (FK → users)
├── instrument_id: string (FK → instruments)
├── started_at: timestamp
├── ended_at: timestamp | null
├── duration_seconds: integer (최소 60초 이상만 저장)
├── content_type: enum (song, scale, technique, free, ai_generated)
├── content_title: string | null
├── content_source: enum (ai_generated, ai_recommended, user_selected, custom)
├── ai_sheet_id: string | null (FK → ai_generated_sheets)
├── difficulty: enum (beginner, intermediate, advanced, expert)
├── initial_bpm: integer
├── final_bpm: integer
├── time_signature: string
├── notation_mode: enum (note, tab)
├── completion_rate: float
├── session_data: json (전체 JSON 구조)
├── user_comment: text | null (연습 후 자연어 코멘트)
├── quick_tags: json | null (빠른 태그 배열)
├── satisfaction_rating: integer | null (1~5)
├── comment_submitted_at: timestamp | null
├── created_at: timestamp
└── updated_at: timestamp
```

### practice_tags
```
├── id: string
├── session_id: string (FK → practice_sessions)
└── tag: string
```

## AI Tables

### ai_generated_sheets
```
├── id: string (UUID)
├── user_id: string (FK → users)
├── instrument_type: string
├── title: string
├── description: text
├── difficulty: enum (beginner, intermediate, advanced, expert)
├── suggested_bpm: integer
├── target_bpm: integer
├── time_signature: string
├── key_signature: string
├── bars: integer
├── focus_areas: json
├── note_data: json
├── tab_data: json
├── practice_tips: json
├── progression_plan: json
├── generation_context: json (생성 시 사용된 사용자 데이터 스냅샷)
├── is_saved: boolean
├── times_practiced: integer
├── created_at: timestamp
└── updated_at: timestamp
```

### ai_analyses
```
├── id: string (UUID)
├── user_id: string (FK → users)
├── session_id: string | null (FK → practice_sessions)
├── type: enum (session, weekly, monthly)
├── analysis_data: json
├── summary: text
├── recommendations: json
├── created_at: timestamp
└── updated_at: timestamp
```

## Achievement Tables

### achievements
```
├── id: string (UUID)
├── code: string (unique, e.g. "practice_10h")
├── title: string
├── description: string
├── icon: string
├── category: string
└── threshold: integer
```

### user_achievements
```
├── id: string (UUID)
├── user_id: string (FK → users)
├── achievement_id: string (FK → achievements)
├── unlocked_at: timestamp
└── progress: integer
```

**배지 카테고리**:
- **연습량**: 1시간, 10시간, 50시간, 100시간, 500시간
- **연속일수**: 3일, 7일, 14일, 30일, 100일
- **악기 다양성**: 2개, 3개, 5개 악기 연습
- **BPM 달성**: 100, 150, 200, 250 BPM 달성
- **완주**: 첫 완주, 10곡 완주, 50곡 완주
- **AI 추천 수행**: AI 추천 연습 5회, 20회, 50회 완료

## Content Tables

### sheet_music
```
├── id: string (UUID)
├── title: string
├── artist: string | null
├── instrument_type: string
├── difficulty: enum (beginner, intermediate, advanced, expert)
├── genre: string | null
├── note_data: json
├── tab_data: json
├── midi_data: blob | null
├── source: enum (builtin, user_upload, community)
├── uploaded_by: string | null (FK → users)
├── is_public: boolean
├── created_at: timestamp
└── updated_at: timestamp
```

## Goal & Routine Tables

### practice_goals
```
├── id: string (UUID)
├── user_id: string (FK → users)
├── type: enum (daily, weekly, monthly)
├── target_type: enum (time, sessions, bpm)
├── target_value: integer
├── instrument_id: string | null (FK → instruments)
├── description: string | null
├── is_active: boolean
├── created_at: timestamp
└── updated_at: timestamp
```

### practice_routines
```
├── id: string (UUID)
├── user_id: string (FK → users)
├── name: string
├── description: string | null
├── is_active: boolean
├── created_at: timestamp
└── updated_at: timestamp
```

### routine_items
```
├── id: string (UUID)
├── routine_id: string (FK → practice_routines)
├── order: integer
├── title: string
├── type: enum (warmup, scale, technique, song, cooldown, free)
├── duration_seconds: integer
├── instrument_id: string | null
├── settings: json
└── created_at: timestamp
```

## Media Tables

### recordings
```
├── id: string (UUID)
├── user_id: string (FK → users)
├── session_id: string (FK → practice_sessions)
├── file_url: string
├── duration_seconds: integer
├── file_size: integer
├── created_at: timestamp
└── updated_at: timestamp
```
