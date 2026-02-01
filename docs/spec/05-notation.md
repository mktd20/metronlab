# 05. Notation System

## Note (Standard Notation)

- VexFlow 기반 오선보 렌더링
- 지원: 음자리표, 조표, 박자표, 음표/쉼표, 다이나믹, 아티큘레이션
- MIDI 기반 내부 데이터 → 렌더링

## Tab (Tablature)

악기별 맞춤 타브:
- Guitar: 6선, 프렛 번호
- Bass: 4선, 프렛 번호
- Drums: 표준 드럼 타브 (HH, SD, BD, etc.)
- Keyboard: 코드 다이어그램 + 음이름
- Violin: 4선 + 포지션 표기

커스텀 텍스트 기반 렌더링.

## Mode Switching

- 상단 토글 버튼: `[Note] [Tab]`
- 전환 시 현재 재생 위치 유지
- 전환 이벤트 session_data에 기록

## Instruments Management

사용자 소유 악기 등록/관리.

```
instruments
├── id: string (UUID)
├── user_id: string (FK → users)
├── type: string (guitar, bass, drums, keyboard, violin, etc.)
├── name: string ("My Fender Strat", "Practice Pad")
├── is_custom: boolean
├── settings: json (악기별 커스텀 설정)
├── created_at: timestamp
└── updated_at: timestamp
```

### API Endpoints

```
GET    /api/instruments
POST   /api/instruments
PUT    /api/instruments/:id
DELETE /api/instruments/:id
```
