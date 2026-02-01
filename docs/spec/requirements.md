# MetronLab - Requirements Specification

모든 악기 연습자를 위한 AI 기반 통합 연습 관리 플랫폼.

## Spec Documents

| # | Document | Description |
|---|----------|------------|
| 00 | [Overview](./00-overview.md) | 프로젝트 개요, Tech Stack, 악기 목록, User Roles, Routes |
| 01 | [Auth](./01-auth.md) | 랜딩 페이지, 회원가입/로그인, 세션 관리 |
| 02 | [Dashboard](./02-dashboard.md) | 대시보드 구성요소, 차트, AI Insights, 연습 시작 CTA |
| 03 | [Practice](./03-practice.md) | 연습 세션, 메트로놈, 재생 컨트롤, 데이터 JSON 스키마, 연습 후 코멘트 |
| 04 | [AI](./04-ai.md) | AI 세션 분석, 주간/월간 리포트, 추천, **실시간 악보 생성** |
| 05 | [Notation](./05-notation.md) | Note/Tab 전환, 악기별 타브, 악기 관리 |
| 06 | [Database](./06-database.md) | 전체 DB 스키마, ERD |
| 07 | [API](./07-api.md) | 전체 API 엔드포인트 목록 |
| 08 | [UI/UX](./08-ui.md) | 디자인 원칙, 컬러 팔레트, 차트 스타일 |
| 09 | [Additional](./09-additional.md) | 추가 제안 기능 (소셜, 도구, PWA 등) |
| 10 | [Roadmap](./10-roadmap.md) | 개발 Phase, 비기능 요구사항 |

## Key Highlights

- **Tech**: Bun + SvelteKit + TypeScript + Tailwind + SQLite(Drizzle) + Lucia Auth
- **AI**: OpenAI GPT-5-mini
- **Core Loop**: 연습 → JSON 기록 → AI 분석 → 맞춤 악보 생성 → 연습
- **User Comment**: 연습 후 자연어 코멘트 → AI 컨텍스트로 활용
- **Notation**: Note(오선보) ↔ Tab(타브) 실시간 전환
