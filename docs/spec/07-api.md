# 07. API Endpoints

## Auth
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/reset-password
GET    /api/auth/me
```

## Dashboard
```
GET    /api/dashboard/summary
GET    /api/dashboard/trends?period=30d&instrument=all
GET    /api/dashboard/achievements
GET    /api/dashboard/recent-sessions?limit=5
GET    /api/dashboard/ai-insights
```

## Practice
```
POST   /api/practice/start
PUT    /api/practice/:id/update
POST   /api/practice/:id/end
POST   /api/practice/:id/comment
DELETE /api/practice/:id
GET    /api/practice/:id
GET    /api/practice/history?page=1&limit=20&instrument=all
```

**참고**: 
- `POST /api/practice/:id/end` - 연습 시간이 1분 미만(60초 미만)인 경우 기록 저장 실패, 에러 응답 반환
- `DELETE /api/practice/:id` - 연습 기록 삭제 (관련 AI 분석, 코멘트 등도 함께 삭제)

## Instruments
```
GET    /api/instruments
POST   /api/instruments
PUT    /api/instruments/:id
DELETE /api/instruments/:id
```

## AI
```
POST   /api/ai/analyze-session/:id
GET    /api/ai/report?type=weekly
GET    /api/ai/recommendations
POST   /api/ai/generate-sheet
POST   /api/ai/regenerate-sheet/:id
POST   /api/ai/save-sheet/:id
GET    /api/ai/generated-sheets?instrument=guitar&saved=true
```

## Content
```
GET    /api/sheets?instrument=guitar&difficulty=intermediate
GET    /api/sheets/:id
POST   /api/sheets/upload
GET    /api/tools/chords?root=C&type=major&instrument=guitar
GET    /api/tools/scales?key=A&type=minor&instrument=guitar
GET    /api/tools/drum-patterns?id=8-beat
```

## Tools (클라이언트 사이드)

- **튜너**: Web Audio API 기반 실시간 음표 감지 (마이크 입력)
  - 악기별 표준 튜닝 프리셋
  - 크로매틱 모드
  - 정확도 시각화 (cents)

## Goals & Routines
```
GET    /api/goals
POST   /api/goals
PUT    /api/goals/:id
DELETE /api/goals/:id
GET    /api/routines
POST   /api/routines
PUT    /api/routines/:id
DELETE /api/routines/:id
```
