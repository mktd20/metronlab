# 02. Dashboard

**목적**: 로그인 후 첫 화면. 연습 현황을 한눈에 파악하고 바로 연습을 시작할 수 있다.

## Quick Actions Bar

- **"연습 시작" 버튼** (Primary CTA, 항상 상단 고정)
  - 클릭 시 악기 선택 모달 → 악기 선택 → `/practice` 이동
- "기록 보기" 바로가기
- "AI 분석" 바로가기
- **"메트로놈" 버튼** (사이드바 메뉴에도 포함)
  - 클릭 시 메트로놈 모달 표시 (전체 페이지가 아닌 모달 오버레이)
  - 모달 내에서 BPM 조절, 재생/정지 가능
  - 다른 페이지에서도 빠르게 접근 가능

## Summary Cards

- 오늘 연습 시간
- 이번 주 총 연습 시간
- 연속 연습 일수 (streak)
- 총 연습 세션 수

## Practice Trend Chart (Line Chart)

- X축: 날짜 (최근 30일)
- Y축: 연습 시간 (분)
- 악기별 필터링 가능

## Instrument Progress Cards

사용자가 등록한 각 악기별:
- 총 연습 시간
- 최근 7일 연습 시간
- 레벨/등급 (연습량 기반)
- 진행률 바

## Achievement Section

- 최근 획득한 성취 배지
- 성취 진행 상황 (예: "10시간 연습까지 2시간 남음")

## AI Insights Panel

- 최근 AI 분석 요약
- "이번 주 기타 연습에서 BPM 정확도가 12% 향상되었습니다" 등
- 추천 연습 컨텐츠 미리보기

## Recent Sessions List

- 최근 5개 연습 세션
- 날짜, 악기, 곡/연습명, 소요시간, 평가점수

## API Endpoints

```
GET    /api/dashboard/summary
GET    /api/dashboard/trends?period=30d&instrument=all
GET    /api/dashboard/achievements
GET    /api/dashboard/recent-sessions?limit=5
GET    /api/dashboard/ai-insights
```
