# 스마트 운동 일지 앱 (PWA) 개발 가이드

이 문서는 현재까지 개발된 **스마트 운동 일지(Progressive Web App)**의 완벽한 복원 및 추후 확장을 위한 가이드라인입니다. 새로운 AI 세션에서 본 문서를 제공하면 현재 상태의 완벽한 구현을 지시할 수 있습니다.

---

## 1. 프로젝트 개요
- **목표:** 모바일 최적화 웹앱(PWA) 형태로 서버 없이 개인정보를 보호하며 운동, 다이어리 꾸미기, 눈바디를 기록할 수 있는 애플리케이션.
- **주요 스택:** React (Vite 기반), `react-router-dom`, `localforage` (IndexedDB), `date-fns`, `lucide-react`
- **핵심 철학:** 서버 구축 불필요(비용 절감), 완전한 로컬 데이터 저장, 높은 수준의 모바일/터치/PC 조작감 제공(앱스러운 UI/UX).

---

## 2. 주요 기능 명세

### 1) PWA 기반 캘린더 홈 화면 (`HomeView`)
- `date-fns`를 활용하여 모바일 구글 캘린더 형태의 월간 달력을 렌더링.
- 날짜를 클릭하면 하단에 해당 날짜의 기록 리스트가 렌더링됨.
- 운동 기록이 있는 날짜의 달력 숫자 밑에는 **초록색 점(`event-dot`)**이 표시됨.
- PC 웹 브라우저에서도 모바일처럼 드래그하여 위아래로 스크롤할 수 있는 **마우스 스와이프(drag-to-scroll) 로직**이 `<main className="main-content">` 래퍼에 적용됨. 전역 스크롤바는 CSS로 숨김 처리(`::-webkit-scrollbar { display: none; }`).

### 2) 바텀 시트(Bottom Sheet) 운동 기록 기능
- 우측 하단 플로팅 액션 버튼(FAB, `+`) 클릭 시 바텀 시트가 올라옴.
- **1단계 (종목 선택):** 벤치프레스, 스쿼트 등 운동 종목 리스트 렌더링.
- **2단계 (기록 입력):**
  - 종목 선택 시 무게, 횟수를 입력할 수 있는 폼으로 전환됨.
  - **빈봉 체크 기능:** `[✔️ 빈봉]` 버튼은 토글 방식으로 동작. 활성화 시 무게 입력창이 비활성화되며, 세트 추가 시 `weight: '빈봉', isEmptyBar: true` 속성으로 리스트에 저장.
  - **[세트 추가]:** 입력된 데이터를 상단 세트 리스트에 시각적으로 누적.
  - **[기록 완료]:** `localforage`를 통해 해당 날짜(`workouts_YYYY-MM-DD`)를 키(Key) 값으로 IndexedDB에 배열 데이터 영구 저장.

### 3) 엣지 패널과 다이어리 꾸미기(다꾸) 스티커 기능
- 화면 우측에 숨겨진 패널(`edge-panel`)이 존재하며, 작은 손잡이를 누르면 열림.
- HTML5 Drag and Drop API(`draggable={true}`)를 사용해 이모지 스티커(🔥, 💪 등)를 드래그 가능.
- 사용자가 스티커를 운동 기록 카드(`.workout-log-card`) 위에 드롭하면 해당 카드의 `stickers` 배열에 새로운 스티커 객체(ID, 좌표, 크기, 회전값 포함)가 추가되어 DB에 저장됨.

### 4) 인터랙티브 스티커 컴포넌트 (`InteractiveSticker`)
- 기록 카드에 붙은 스티커는 단순한 텍스트가 아닌, 독립적인 조작이 가능한 컴포넌트로 렌더링됨.
- **이동 (Drag):** 스티커 몸체를 드래그하면 자유롭게 x, y 좌표 변경.
- **회전 및 크기 조절 (Scale & Rotate):** 스티커 클릭 시 활성화(점선 테두리)되며, 우측 하단 조절기(`⤡`)를 드래그해 각도(`Math.atan2`)와 크기(`Math.hypot`)를 동시에 변경 가능.
- **동기성 저장:** 마우스를 뗄 때(`onEnd`) `useRef`를 통해 최신 좌표/상태값을 즉시 DB에 덮어씌우고 부모 컴포넌트(`HomeView`)를 업데이트하여 상태 일관성 유지. (기존 레거시 단순 문자열 스티커도 호환/마이그레이션 처리 포함)

---

## 3. 핵심 데이터 구조 (DB Schema)

데이터는 `localforage`를 사용하여 IndexedDB에 저장됩니다.

**Key Format:** `workouts_YYYY-MM-DD` (예: `workouts_2026-05-18`)

**Value Format (Array of Workouts):**
```json
[
  {
    "exercise": "스쿼트",
    "sets": [
      {
        "weight": "60",
        "reps": "10",
        "isEmptyBar": false
      },
      {
        "weight": "빈봉",
        "reps": "15",
        "isEmptyBar": true
      }
    ],
    "stickers": [
      {
        "id": "17160000000001234",
        "emoji": "🔥",
        "x": 45,
        "y": 10,
        "scale": 1.2,
        "rotation": 15
      }
    ]
  }
]
```

---

## 4. 파일 구성 및 역할

1. **`index.html` & `vite.config.js`**
   - PWA 메타 태그(`apple-mobile-web-app-capable` 등), Google Fonts(Inter) 적용.
   - `vite-plugin-pwa`를 설정하여 오프라인 캐싱 및 모바일 홈 화면 설치(Manifest) 지원.
2. **`src/index.css` & `src/App.css`**
   - CSS 변수(Variables) 기반의 다크모드/다크테마 디자인 시스템.
   - 전역 스크롤바 숨김 처리 및 모바일 특화 레이아웃(Safe Area Inset 반영).
3. **`src/App.jsx`**
   - `react-router-dom`을 통한 하단 네비게이션(홈, 운동, 눈바디, 통계) 라우팅 뼈대.
   - `HomeView`: 달력 렌더링, 바텀시트 상태 관리, `localforage` 읽기/쓰기, 스크롤 스와이프 로직, 엣지 패널.
   - `InteractiveSticker`: 스티커 드래그, 회전, 스케일 계산 및 터치/마우스 이벤트 통합 관리 컴포넌트.

---

## 5. 다음 세션 개발 재개 시 안내 (Prompting Guide)

새로운 세션을 시작할 때 AI에게 다음 사항을 함께 전달하세요.

> **"첨부된 `workout_app_dev_guide.md` 파일을 읽고, 현재 진행된 앱의 아키텍처와 코딩 컨벤션을 파악해줘.
우리는 PWA 기반, localforage를 이용한 로컬 저장 방식, 다크 모드, 터치 최적화 UI, 그리고 InteractiveSticker(다꾸) 기능까지 구현했어.
이제 다음 스텝인 [눈바디 사진 갤러리 구현 / 과거 3일 전 중량 비교 기능] 을 개발할 거야."**
