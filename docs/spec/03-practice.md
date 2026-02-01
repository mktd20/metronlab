# 03. Practice Session

**핵심 기능**: 메트로놈 + 악보(Note/Tab) + 기록 저장

## Practice Setup (`/practice`)

1. 악기 선택 (아이콘 그리드)
2. 연습 유형 선택:
   - 자유 연습 (빈 메트로놈)
   - **AI 생성 연습** (실시간 악보 생성 - [04-ai.md](./04-ai.md) 참조)
   - AI 추천 연습 (기존 컨텐츠 추천)
   - 곡 연습 (악보 선택)
   - 스케일/테크닉 연습
3. BPM 설정 (슬라이더 + 직접입력)
4. 악보 표시 모드 선택: **Note (오선보)** / **Tab (타브 악보)**
5. "연습 시작" → `/practice/[session_id]`

## Practice Player (`/practice/[id]`)

### Metronome

- Web Audio API 기반 정밀 메트로놈
- BPM 조절 (30~300)
- 박자 설정 (4/4, 3/4, 6/8 등)
- 강약 패턴 (첫 박 강조)
- 시각적 비트 인디케이터 (깜빡이는 원)
- 카운트인 옵션 (1마디 카운트 후 시작)

### Sheet Display

- **Note Mode**: 오선보 렌더링 (VexFlow 라이브러리)
  - 음표, 쉼표, 조표, 박자 표시
  - 현재 재생 위치 하이라이트
  - 자동 스크롤
- **Tab Mode**: 타브 악보 렌더링
  - 기타/베이스: 6선/4선 타브
  - 드럼: 드럼 타브 표기
  - 키보드: 코드 차트
  - 현재 재생 위치 하이라이트
- **전환 버튼**: Note ↔ Tab 실시간 전환 가능

### Playback Controls

- Play / Pause / Stop
- 구간 반복 (A-B loop)
- 속도 조절 (원본 BPM 대비 %)
- 진행률 바

### Auto Data Collection

- 연습 시작/종료 시각
- 총 연습 시간
- BPM 설정값 및 변경 이력
- 악보 모드 (Note/Tab)
- 구간 반복 횟수
- 일시정지 횟수/시간

**중요**: 연습 시간이 1분 미만인 경우 기록으로 저장하지 않음. 사용자에게 "연습 시간이 너무 짧습니다. 최소 1분 이상 연습해주세요." 메시지 표시 후 기록 저장 취소.

## Practice Data Schema (JSON)

```json
{
  "session_id": "uuid",
  "user_id": "uuid",
  "instrument_id": "uuid",
  "started_at": "2025-01-15T14:30:00Z",
  "ended_at": "2025-01-15T15:15:00Z",
  "duration_seconds": 2700,
  "content": {
    "type": "song | scale | technique | free | ai_generated",
    "title": "Hotel California - Intro Solo",
    "source": "ai_generated | ai_recommended | user_selected | custom",
    "ai_sheet_id": "uuid | null",
    "difficulty": "intermediate"
  },
  "metronome": {
    "initial_bpm": 80,
    "final_bpm": 100,
    "bpm_changes": [
      { "at": 300, "bpm": 90 },
      { "at": 600, "bpm": 100 }
    ],
    "time_signature": "4/4"
  },
  "notation_mode": "tab",
  "notation_switches": [
    { "at": 120, "from": "tab", "to": "note" },
    { "at": 450, "from": "note", "to": "tab" }
  ],
  "playback": {
    "play_count": 5,
    "pause_count": 3,
    "total_pause_seconds": 180,
    "loop_sections": [
      { "start_bar": 8, "end_bar": 12, "repeat_count": 4 }
    ]
  },
  "performance": {
    "completion_rate": 0.85,
    "sections_practiced": ["intro", "verse1", "chorus"],
    "struggle_points": [
      { "bar": 10, "repeat_count": 6, "note": "fast arpeggio section" }
    ]
  },
  "user_feedback": {
    "comment": "아르페지오 부분에서 약지가 잘 안 움직임. 느린 템포에서 더 연습해야 할 듯.",
    "quick_tags": ["어려웠음", "리듬불안정"],
    "satisfaction_rating": 3,
    "submitted_at": "2025-01-15T15:16:00Z"
  },
  "tags": ["solo", "arpeggio", "eagles"]
}
```

## Post-Practice Comment (연습 후 코멘트)

**핵심 개념**: 연습 세션 종료 시 사용자가 자연어로 코멘트를 작성하면, 이 코멘트가 AI 분석/추천/악보 생성의 핵심 컨텍스트로 활용된다.

### UX Flow

1. 사용자가 연습 Stop 클릭
2. **연습 완료 모달** 표시:
   - 세션 요약 (연습 시간, BPM, 완주율)
   - **코멘트 입력 영역** (textarea, placeholder: "오늘 연습 어땠나요? 어려웠던 부분, 느낀 점을 자유롭게 적어주세요")
   - 빠른 태그 선택 (선택적): `#어려웠음` `#잘됨` `#손가락아픔` `#리듬불안정` `#BPM올려야함` `#재미있었음`
   - 별점 (1~5, 선택적): 오늘 연습 만족도
   - "저장" / "건너뛰기" 버튼
3. 코멘트가 session_data에 저장됨

### Comment Data Structure

```json
{
  "user_feedback": {
    "comment": "아르페지오 부분에서 약지가 잘 안 움직임. 느린 템포에서 더 연습해야 할 듯. 8~12마디 전환이 특히 힘들었다.",
    "quick_tags": ["어려웠음", "리듬불안정"],
    "satisfaction_rating": 3,
    "submitted_at": "2025-01-15T15:16:00Z"
  }
}
```

### AI Utilization

- **즉시 분석**: 코멘트에서 키워드/의도 추출 → 세션 분석에 반영
  - "약지가 안 움직임" → `finger_independence` weakness 태깅
  - "느린 템포에서 더 연습" → 다음 AI 생성 시 BPM 낮춰서 생성
  - "8~12마디 전환" → 구간 반복 데이터와 교차 검증
- **누적 컨텍스트**: 최근 N개 코멘트를 AI 프롬프트에 포함
  - AI 악보 생성 시 사용자의 "체감 난이도" 반영
  - 주간/월간 리포트에서 사용자 감정/만족도 추세 분석
- **대화형 확장**: 코멘트 기반으로 AI가 후속 질문/조언 제공
  - "약지 운동이 어려우셨군요. 크로매틱 워밍업 루틴을 추가해볼까요?"

## Practice History Management

### 기록 삭제 기능

- 연습 기록 목록(`/history`) 및 상세 페이지(`/history/[id]`)에서 삭제 버튼 제공
- 삭제 확인 모달 표시: "이 연습 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
- 삭제 시 관련 데이터도 함께 삭제:
  - 연습 세션 데이터
  - AI 분석 결과 (해당 세션)
  - 사용자 코멘트 및 태그
- 삭제 후 기록 목록으로 리다이렉트

## API Endpoints

```
POST   /api/practice/start
PUT    /api/practice/:id/update
POST   /api/practice/:id/end
POST   /api/practice/:id/comment
DELETE /api/practice/:id
GET    /api/practice/:id
GET    /api/practice/history?page=1&limit=20&instrument=all
```
