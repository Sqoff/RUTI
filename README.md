# 운동일지 (Workout Journal)

캘린더 기반의 모바일 친화 운동 기록 PWA. 날짜를 선택하고, 해당 날짜의 운동 영역에 운동 세트와 스티커를 자유롭게 붙여 기록한다.

## 🚀 라이브 데모

👉 **[https://sqoff.github.io/RUTI/](https://sqoff.github.io/RUTI/)**

GitHub Pages에 배포되어 있으며, 모바일 브라우저에서 바로 사용 가능하다. PWA로 설치하면 홈 화면에서 네이티브 앱처럼 실행된다.

## 기술 스택

- **React 19** + **Vite 8** (HMR, Oxc 기반 `@vitejs/plugin-react`)
- **react-router-dom 7** — 홈/운동/눈바디/통계 라우팅
- **date-fns 4** (`ko` locale) — 캘린더 날짜 계산
- **localforage** — IndexedDB 기반 클라이언트 영속화
- **lucide-react** — 아이콘
- **vite-plugin-pwa** — PWA 매니페스트/서비스워커
- **ESLint 10** + `react-hooks`, `react-refresh`

## 스크립트

| 명령              | 동작                                |
| ----------------- | ----------------------------------- |
| `npm run dev`     | 개발 서버 (`http://localhost:5173`) |
| `npm run build`   | 프로덕션 빌드 (`dist/`)             |
| `npm run preview` | 빌드 결과 미리보기                  |
| `npm run lint`    | ESLint 검사                         |

## 디렉토리 구조

```
src/
  main.jsx       엔트리, BrowserRouter 마운트
  App.jsx        라우팅 + 모든 뷰 (HomeView / WorkoutView / GalleryView / StatsView)
  App.css        앱 전반 스타일
  index.css      전역 토큰 (--bg-color, --primary-color 등)
public/          PWA 아이콘 등 정적 자원
vite.config.js   Vite + PWA 설정
```

> 현재 모든 화면이 `App.jsx` 한 파일에 들어있다. 화면이 커지면 `src/views/`, `src/components/`로 분리하는 것을 권장한다.

## 홈 화면 레이아웃

```
┌─────────────────────────────┐
│ 헤더 (월 네비게이션 + 설정) │
├─────────────────────────────┤
│ 캘린더 (월간 그리드)        │
├─────────────────────────────┤
│ 선택 날짜 헤더 (M월 d일 E)  │
│ ┌─ workout-area ──────────┐ │  ← 그룹 영역
│ │ • 운동 카드들           │ │
│ │ • 스티커 (드롭 대상)    │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ FAB (+) → 바텀시트          │
│ 우측 엣지 패널 (스티커 팔레트) │
│ 하단 네비게이션             │
└─────────────────────────────┘
```

### 운동 영역 (`workout-area`)

- 날짜 헤더 바로 아래의 점선 박스 컨테이너.
- 운동 카드 목록(있을 때) 또는 빈 상태 카드(없을 때)를 감싼다.
- **스티커 드롭 타겟**: `onDragOver` / `onDrop` 핸들러가 이 영역에 바인딩되어 있다.
- 부착된 스티커는 `attached-stickers-layer`(absolute, `pointer-events: none`)에 렌더링되며, 각 `InteractiveSticker`는 `pointer-events: auto`로 개별 드래그/회전/스케일/삭제 가능.

스티커를 다른 영역(헤더, 캘린더 등)에 붙이려 하지 말 것. 드롭 핸들러는 `workout-area`에만 있다.

## 데이터 모델 (localforage)

키 패턴은 날짜별로 분리되어 있다.

| 키                    | 값                                                                       | 비고                  |
| --------------------- | ------------------------------------------------------------------------ | --------------------- |
| `workouts_yyyy-MM-dd` | `Array<{ exercise: string, sets: Array<{ weight, reps, isEmptyBar }> }>` | 해당 날짜의 운동 기록 |
| `stickers_yyyy-MM-dd` | `Array<{ id, emoji, x, y, scale, rotation }>`                            | 해당 날짜의 스티커    |

- 스티커의 `x`, `y`는 `workout-area` 기준 좌표.
- 레거시 마이그레이션: `workout.stickers`(예전 구조)는 `fetchDailyWorkouts`에서 `stickers_*` 키로 이관되며 원본에서 제거된다.

## 주요 상호작용

- **운동 카드 길게 누름(600ms)** → 삭제 오버레이 노출 (`workoutPressTimer`).
- **스티커 길게 누름(600ms)** → 삭제 핸들(✕) 노출 (`InteractiveSticker.pressTimer`).
- **스티커 단일 탭** → active 상태 (외곽 점선) + 회전·스케일 컨트롤(⤡) 노출.
- **스티커 회전+스케일**: 컨트롤 핸들 드래그 시 중심점 기준 각도와 거리로 동시 계산 (`Math.atan2`, `Math.hypot`).
- **메인 컨텐츠 마우스 드래그 스크롤**: 빈 영역을 마우스로 잡고 위/아래로 드래그하면 스크롤 (`draggable` 요소·`.edge-panel` 위에서는 비활성).
- **엣지 패널**: 우측 핸들 클릭으로 토글, 스티커를 드래그해서 `workout-area`에 드롭.

## 개발 시 주의사항

1. **포트 충돌**: dev 서버는 `5173`. 접속이 안 되면 먼저 서버가 실행 중인지(`netstat -ano | findstr :5173`) 확인.
2. **PowerShell 환경**: 셸 명령은 PowerShell 문법(`$env:VAR`, `;`, 백틱 줄바꿈)을 사용. `&&` 체이닝은 사용 불가, `; if ($?) { ... }`로 대체.
3. **단일 파일 비대화**: `App.jsx`가 600+ 라인. 새 뷰/컴포넌트 추가 시 분리 리팩토링을 함께 고려.
4. **localforage 동시 쓰기**: `fetchDailyWorkouts`가 read-modify-write 패턴이라 빠른 연속 입력에서 레이스 가능. 새 기능 추가 시 단일 트랜잭션 헬퍼화 검토.
5. **스티커 좌표계**: 부착 시 `getBoundingClientRect()` 기준으로 계산하므로 `workout-area`에는 `position: relative` 유지가 필수.
6. **빈봉 모드**: `isEmptyBar` 플래그가 true면 weight 입력 비활성, 저장 값은 `'빈봉'` 문자열.

## 진행 상태

- ✅ 홈: 캘린더 + 운동 기록 + 스티커
- 🚧 운동 일지 작성 (`/workout`)
- 🚧 눈바디 갤러리 (`/gallery`)
- 🚧 성장 통계 (`/stats`)

---

## 참고: Vite + React 템플릿 안내

이 프로젝트는 Vite + React 템플릿(HMR + ESLint 기본 설정)을 기반으로 시작되었다. 템플릿의 기본 안내 사항은 다음과 같다.

현재 두 가지 공식 React 플러그인을 사용할 수 있다.

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) — [Oxc](https://oxc.rs) 기반 (이 프로젝트에서 사용 중)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) — [SWC](https://swc.rs/) 기반

### React Compiler

React Compiler는 개발/빌드 성능에 영향을 주기 때문에 템플릿에서 기본적으로 활성화되어 있지 않다. 도입하려면 [공식 설치 가이드](https://react.dev/learn/react-compiler/installation)를 참고한다.

### ESLint 설정 확장

프로덕션 애플리케이션을 개발할 경우, 타입 인지(type-aware) lint 규칙이 활성화된 TypeScript 사용이 권장된다. [TS 템플릿](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts)과 [`typescript-eslint`](https://typescript-eslint.io)를 통합하는 방법을 참고할 수 있다.
