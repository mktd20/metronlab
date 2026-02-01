# 00. Project Overview

## MetronLab

모든 악기 연습자를 위한 통합 연습 관리 플랫폼.
메트로놈 기반 연습, 악보(Note/Tab) 재생, AI 분석, 연습 기록 누적을 통해 사용자의 실력 향상을 체계적으로 지원한다.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun |
| Framework | SvelteKit (SSR + SPA) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | SQLite (via Drizzle ORM) |
| Auth | Lucia Auth (session-based) |
| Chart | Chart.js (canvas 기반 그래프) |
| AI | OpenAI API (GPT-5-mini) |
| Metronome | Web Audio API |
| Deployment | Bun + Node adapter |

## Target Instruments

모든 악기를 지원하되, 초기 1차 지원 악기:

- Electric Guitar
- Acoustic Guitar
- Bass Guitar
- Drums / Percussion
- Keyboard / Piano
- Violin
- Ukulele
- Vocal (보컬 트레이닝)

사용자가 커스텀 악기를 추가 등록할 수 있다.

## User Roles

| Role | Description |
|------|------------|
| Guest | 서비스 소개 페이지만 접근 가능 |
| User | 로그인 후 모든 기능 사용 |
| Admin | 컨텐츠 관리, 사용자 관리 (추후) |

## Page Structure & Routes

### Public Pages (Guest)

```
/                  → Landing Page (서비스 소개)
/login             → 로그인
/register          → 회원가입
/about             → 서비스 상세 소개
```

### Authenticated Pages (User)

```
/dashboard         → 메인 대시보드
/practice          → 연습 세션 (악기 선택 → 연습 시작)
/practice/[id]     → 연습 진행 화면 (메트로놈 + 악보)
/history           → 연습 기록 목록
/history/[id]      → 연습 기록 상세 (삭제 기능 포함)
/analysis          → AI 분석 리포트
/instruments       → 내 악기 관리
/settings          → 설정
/profile           → 프로필
```

### Global Features (모든 페이지에서 접근 가능)

- **메트로놈 모달**: 사이드바 메뉴에서 "메트로놈" 클릭 시 모달로 표시
  - BPM 조절 (30~300)
  - 재생/정지
  - 박자 설정 (4/4, 3/4 등)
  - 시각적 비트 인디케이터
  - 연습 세션과 독립적으로 사용 가능
- **튜너 모달**: 사이드바 메뉴에서 "튜너" 클릭 시 모달로 표시
  - Web Audio API 기반 실시간 음표 감지
  - 악기별 표준 튜닝 프리셋 (기타, 베이스, 우쿨렐레, 바이올린)
  - 크로매틱 튜너 모드
  - 정확도 시각화 (바늘 게이지, cents 표시)
  - 마이크 접근 권한 필요
