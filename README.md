# 🏋️ RUTI (루티) — 스마트 운동 일지 & 다꾸 웹앱

> **"프로페셔널 웨이트 트레이닝 기록과 감성 다이어리 꾸미기(다꾸)의 결합"**  
> 차가운 엑셀식 운동 기록을 넘어, 내 손으로 직접 꾸미고 1초 만에 인스타 스토리에 공유하는 클린 애슬레틱 스마트 피트니스 저널입니다.

---

## 🚀 라이브 데모 & 다운로드

* 🌐 **라이브 데모 웹앱**: **[https://sqoff.github.io/RUTI/](https://sqoff.github.io/RUTI/)**
* 📱 **Android APK 다운로드**: [GitHub Releases](https://github.com/Sqoff/RUTI/releases) 또는 [Actions Artifacts](https://github.com/Sqoff/RUTI/actions)

---

## ✨ 핵심 기능 (Key Features)

1. **⚡ 클린 애슬레틱 디자인 시스템 (Clean Athletic UI)**
   - 나이키 & 애플 피트니스 무드의 매트 다크 차콜(`#0b0f17`) + 일렉트릭 티타늄 오렌지(`#ff5e36`) 감성.
   - 4종 다이어리 속지 테마 (모눈종이, 빈티지 크라프트, 슬레이트 다크, 줄노트) 원클릭 변경.

2. **🎨 60fps 인터랙티브 다꾸 엔진 (Deco Engine)**
   - 캔버스 위에서 자유로운 **터치 드래그, `⤡` 회전 & 스케일, 복제, 좌우 반전, 레이어 순서(Z-Index)** 조절.
   - 크리에이터 스티커, 볼드 텍스트 스탬프, 마스킹 테이프, 감성 메모지, 폴라로이드 사진 소품함 제공.

3. **🏋️ 스마트 운동 세트 빌더 (Set Builder)**
   - 부위별(상체, 하체, 유산소 등) 종목 선택 및 **즐겨찾기(⭐)** 우선 정렬.
   - 원터치 **[빈봉] 모드**, 무게(kg)/횟수(reps) 세트 빌더 및 누적 운동 카드 렌더링.

4. **📸 1080px WebP 무손실 압축 & 100% 로컬 보안**
   - 10MB 원본 카메라 사진을 **1080px WebP 150KB(98% 압축)**로 자동 변환하여 IndexedDB에 저장 (용량 걱정 & 렉 제로).
   - 모든 운동 일지와 눈바디 사진은 외부 서버로 무단 전송되지 않고 기기 내부에만 100% 안전하게 비공개 보관.

5. **🔥 오운완 인스타 스토리 딥링크 공유 (`#Made_with_RUTI`)**
   - 운동 완료 후 상단 카메라 버튼 클릭 시 9:16 인스타 스토리 맞춤형 카드 생성.
   - `instagram-stories://share` 딥링크를 통해 로그인 없이 1초 만에 인스타 스토리 편집기로 다이렉트 전송.

6. **⏱️ 실시간 세트 타이머 & 눈바디 Before/After 슬라이더 & 성장 통계**
   - 세트 간 30s/60s/90s/120s 프리셋 휴식 타이머 (햅틱 진동 피드백).
   - 체형 변화를 직관적으로 비교하는 Before/After 분할 슬라이더.
   - 주간 총 훈련 볼륨(kg) 차트 및 NEW PR 하이라이트.

---

## 🛠️ 기술 스택 (Tech Stack)

- **Frontend**: React 19, Vite 8, React Router v7, Lucide React, Date-fns 4 (ko)
- **Local Storage**: IndexedDB (`localforage`) — 0초 즉시 로딩 및 무손실 마이그레이션 엔진
- **Cloud Sync**: Supabase Serverless Cloud (Local-First Sync Architecture)
- **Mobile Packaging**: Capacitor Android (구글 플레이스토어 모바일 앱 패키징)
- **CI/CD**: GitHub Actions (GitHub Pages 자동 배포 & Android APK 빌드)

---

## 💻 로컬 개발 및 빌드

```bash
# 의존성 설치
npm install

# 로컬 개발 서버 실행 (http://localhost:5173/RUTI/)
npm run dev

# 프로덕션 번들 빌드 (dist/)
npm run build

# Capacitor 안드로이드 동기화
npx cap sync android
```
