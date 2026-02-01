# 10. Development Roadmap & Non-Functional Requirements

## Development Phases

### Phase 1 - Foundation (MVP)
- [x] Project setup (Bun + SvelteKit + Tailwind)
- [x] Auth (회원가입/로그인/로그아웃)
- [x] Landing page
- [x] Dashboard (기본 레이아웃 + Summary cards)
- [x] Practice session (메트로놈 + Note/Tab 전환)
- [x] Practice data JSON 저장
- [x] **연습 후 코멘트 시스템** (자연어 입력 + 빠른 태그 + 만족도)
- [x] Basic charts (연습 트렌드)

### Phase 2 - AI & Analysis
- [x] AI 세션 분석 (GPT-5-mini integration)
- [x] **AI 실시간 악보 생성** (사용자 데이터 기반 맞춤 악보)
- [x] **코멘트 NLP 분석** (코멘트 → 약점 추출 → AI 컨텍스트 반영)
- [x] AI 주간/월간 리포트
- [x] AI 연습 추천 + 생성 악보 라이브러리
- [x] 성취 시스템
- [x] 이메일 리포트 발송

### Phase 3 - Content & Tools
- [x] Sheet music library
- [x] Custom sheet upload (MusicXML/MIDI)
- [x] Tuner (사이드바 모달로 통합)
- [x] Chord dictionary
- [x] Scale reference
- [x] Drum pattern library

### Phase 4 - Social & Advanced
- [x] Practice goals & routines
- [x] Audio recording
- [x] Backing tracks
- [x] Practice Room (WebRTC) - 기본 구조 및 방 생성/참여
- [x] Social feed
- [x] PWA support (기본 manifest.json 추가)

### Phase 5 - Security & Quality
- [x] Input validation (Zod) - API 엔드포인트에 적용
- [x] Rate limiting - API 요청 제한
- [x] CSRF 보호 - 토큰 기반 검증 및 자동 헤더 추가
- [x] Performance 최적화 - Vite 빌드 최적화, DB 쿼리 병렬화
- [x] Accessibility 개선 (WCAG 2.1 AA) - aria-label, 키보드 네비게이션, 포커스 스타일, 스킵 링크
- [x] PWA 기능 강화 - Service Worker, 오프라인 지원, 푸시 알림 기본 구조
- [x] Practice Room WebRTC 기본 구조 - WebRTCAudioManager 클래스 및 플레이스홀더 구현

## Non-Functional Requirements

### Performance
- 메트로놈 정확도: 1ms 이내 오차
- 페이지 로딩: < 2초 (FCP)
- API 응답: < 500ms (일반), < 3초 (AI 분석)
- 동시 접속: 초기 100명 지원

### Security
- 비밀번호: bcrypt/argon2 해싱
- CSRF 보호
- Rate limiting
- Input validation (Zod)
- HTTPS only

### Accessibility
- WCAG 2.1 AA 준수
- 키보드 네비게이션 지원
- Screen reader 호환

### Browser Support
- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+
