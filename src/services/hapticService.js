/**
 * 📳 Haptic Vibration Bridge
 * Capacitor @capacitor/haptics 및 Web navigator.vibrate 듀얼 지원
 */

export const HapticService = {
  // 가벼운 탭 (스티커 선택, 툴바 클릭)
  light() {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      navigator.vibrate(15);
    }
  },

  // 중간 탭 (세트 추가, 빈봉 토글, 회전 조작 시작)
  medium() {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      navigator.vibrate(30);
    }
  },

  // 묵직한 탭 (롱프레스 600ms 트리거, 기록 완료)
  heavy() {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      navigator.vibrate(50);
    }
  },

  // 성공 진동 (오운완 캡처 완료, 백업 복원)
  success() {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      navigator.vibrate([30, 50, 40]);
    }
  }
};
