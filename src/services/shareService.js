import { HapticService } from './hapticService';

/**
 * 📸 인스타그램 스토리 공유 및 갤러리 이미지 저장 서비스
 */
export const ShareService = {
  /**
   * 인스타그램 스토리 딥링크 공유 (instagram-stories://share)
   * 사용자가 명시적으로 공유 버튼을 눌렀을 때만 트리거됨
   */
  async shareToInstagramStories(dataUrl) {
    HapticService.success();
    try {
      // 1. Web Share API (모바일 브라우저 / PWA)
      if (navigator.share && navigator.canShare) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'ruti_workout_diary.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'RUTI 오운완 다이어리',
            text: '#RUTI #오운완 #운동일지'
          });
          return { success: true, method: 'web-share' };
        }
      }

      // 2. 인스타그램 스토리 딥링크 스킴 시도
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = 'instagram-stories://share';
        return { success: true, method: 'deeplink' };
      }

      // 3. Fallback: 파일 자동 다운로드
      this.downloadImage(dataUrl, `RUTI_Diary_${new Date().toISOString().slice(0, 10)}.png`);
      return { success: true, method: 'download' };
    } catch (error) {
      console.warn('Share Failed, fallback to download:', error);
      this.downloadImage(dataUrl, `RUTI_Diary_${new Date().toISOString().slice(0, 10)}.png`);
      return { success: false, error };
    }
  },

  /**
   * 브라우저 이미지 다운로드
   */
  downloadImage(dataUrl, filename = 'ruti_diary.png') {
    HapticService.medium();
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
