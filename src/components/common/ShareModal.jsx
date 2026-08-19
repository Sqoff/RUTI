import { X, Download, Sparkles, Send } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ShareService } from '../../services/shareService';
import { HapticService } from '../../services/hapticService';

export function ShareModal({
  isOpen,
  onClose,
  selectedDate,
  workouts = [],
  decoItems = []
}) {
  if (!isOpen) return null;

  const dateStr = format(selectedDate, 'yyyy.MM.dd EEEE', { locale: ko });

  // 총 운동 세트 수 및 총 볼륨 계산
  let totalSets = 0;
  let totalVolume = 0;
  workouts.forEach((w) => {
    w.sets?.forEach((s) => {
      totalSets++;
      const wKg = parseFloat(s.weight) || 0;
      const r = parseInt(s.reps, 10) || 0;
      totalVolume += wKg * r;
    });
  });

  const handleShareInstagram = () => {
    HapticService.success();
    // 모의 캔버스 데이터 URL 생성
    const mockDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    ShareService.shareToInstagramStories(mockDataUrl);
    onClose();
  };

  const handleDownload = () => {
    HapticService.medium();
    const mockDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    ShareService.downloadImage(mockDataUrl, `RUTI_${format(selectedDate, 'yyyyMMdd')}.png`);
    onClose();
  };

  return (
    <div className="share-modal-overlay show" onClick={onClose}>
      <div className="share-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <div className="share-title-group">
            <Sparkles size={18} className="text-primary" />
            <h3 className="share-modal-title">오운완 다이어리 공유</h3>
          </div>
          <button className="share-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* 9:16 Insta Story Card Preview */}
        <div className="insta-story-preview-card">
          <div className="preview-top-badge">RUTI ATHLETIC • {dateStr}</div>

          <div className="preview-workout-summary">
            <h4 className="preview-heading">오늘의 오운완 달성</h4>
            <div className="preview-stats-row">
              <div className="preview-stat-item">
                <span className="stat-label">종목 수</span>
                <span className="stat-value">{workouts.length}개</span>
              </div>
              <div className="preview-stat-item">
                <span className="stat-label">총 세트</span>
                <span className="stat-value">{totalSets}세트</span>
              </div>
              <div className="preview-stat-item">
                <span className="stat-label">총 볼륨</span>
                <span className="stat-value highlight">{totalVolume.toLocaleString()}kg</span>
              </div>
            </div>

            <div className="preview-exercises-list">
              {workouts.slice(0, 3).map((w, idx) => (
                <div key={idx} className="preview-ex-pill">
                  {w.exercise} ({w.sets?.length}세트)
                </div>
              ))}
              {workouts.length > 3 && (
                <div className="preview-ex-pill more">+{workouts.length - 3}개 더보기</div>
              )}
            </div>
          </div>

          <div className="preview-stickers-row">
            {decoItems.slice(0, 5).map((it, idx) => (
              <span key={idx} className="preview-sticker-emoji">
                {it.content?.emoji || '🔥'}
              </span>
            ))}
          </div>

          <div className="preview-watermark">#Made_with_RUTI • 100%_SWEAT</div>
        </div>

        {/* Action Buttons */}
        <div className="share-modal-actions-row">
          <button className="share-action-btn secondary" onClick={handleDownload}>
            <Download size={18} />
            <span>갤러리 저장</span>
          </button>
          <button className="share-action-btn instagram" onClick={handleShareInstagram}>
            <Send size={18} />
            <span>인스타 스토리 공유</span>
          </button>
        </div>
      </div>
    </div>
  );
}
