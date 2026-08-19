import { useEffect, useRef } from 'react';

/**
 * 📱 Capacitor Native Bridge Hook
 * 안드로이드 물리 뒤로가기(Back Button) 우선순위 큐(Queue) 관리
 */
export function useNativeBridge({
  isModalOpen,
  closeModal,
  isBottomSheetOpen,
  closeBottomSheet,
  isDrawerOpen,
  closeDrawer,
  activeItemId,
  deselectItem
}) {
  const handlersRef = useRef({});

  useEffect(() => {
    handlersRef.current = {
      isModalOpen,
      closeModal,
      isBottomSheetOpen,
      closeBottomSheet,
      isDrawerOpen,
      closeDrawer,
      activeItemId,
      deselectItem
    };
  });

  useEffect(() => {
    // Capacitor App 플러그인 동적 감지 또는 브라우저 popstate 연동
    const handleBackButton = () => {
      const {
        isModalOpen,
        closeModal,
        isBottomSheetOpen,
        closeBottomSheet,
        isDrawerOpen,
        closeDrawer,
        activeItemId,
        deselectItem
      } = handlersRef.current;

      // 1순위: 모달 닫기
      if (isModalOpen && closeModal) {
        closeModal();
        return true;
      }
      // 2순위: 바텀시트 닫기
      if (isBottomSheetOpen && closeBottomSheet) {
        closeBottomSheet();
        return true;
      }
      // 3순위: 엣지 드로어 닫기
      if (isDrawerOpen && closeDrawer) {
        closeDrawer();
        return true;
      }
      // 4순위: 다꾸 아이템 선택 해제
      if (activeItemId && deselectItem) {
        deselectItem();
        return true;
      }
      return false;
    };

    window.addEventListener('ruti:backbutton', handleBackButton);
    return () => {
      window.removeEventListener('ruti:backbutton', handleBackButton);
    };
  }, []);
}
