import { useState, useEffect, useRef } from 'react';
import { X, Copy, RotateCw, RefreshCw } from 'lucide-react';
import { HapticService } from '../../services/hapticService';

export function DecoItem({
  item,
  isActive,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onFlip
}) {
  const [data, setData] = useState(item);
  const dataRef = useRef(item);

  useEffect(() => {
    setData(item);
    dataRef.current = item;
  }, [item]);

  // 터치 & 마우스 드래그 / 회전 / 스케일 포인터 이벤트 핸들러
  const handlePointerDown = (e, action) => {
    e.stopPropagation();
    onSelect(data.id);
    HapticService.light();

    const startX = e.clientX || (e.touches && e.touches[0].clientX);
    const startY = e.clientY || (e.touches && e.touches[0].clientY);
    const startData = { ...data };

    const rect = e.currentTarget.closest('.deco-item-wrapper').getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const startDist = Math.hypot(startX - centerX, startY - centerY);
    const startAngle = (Math.atan2(startY - centerY, startX - centerX) * 180) / Math.PI;

    const onMove = (moveEvent) => {
      moveEvent.preventDefault();
      const cx = moveEvent.clientX || (moveEvent.touches && moveEvent.touches[0].clientX);
      const cy = moveEvent.clientY || (moveEvent.touches && moveEvent.touches[0].clientY);

      const newData = { ...startData };

      if (action === 'move') {
        newData.x = startData.x + (cx - startX);
        newData.y = startData.y + (cy - startY);
      } else if (action === 'transform') {
        const currentDist = Math.hypot(cx - centerX, cy - centerY);
        const currentAngle = (Math.atan2(cy - centerY, cx - centerX) * 180) / Math.PI;
        const angleDiff = currentAngle - startAngle;
        const scaleRatio = currentDist / startDist;

        newData.rotation = startData.rotation + angleDiff;
        newData.scale = Math.max(0.4, Math.min(3.0, startData.scale * scaleRatio));
      }

      setData(newData);
      dataRef.current = newData;
    };

    const onEnd = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      onUpdate(dataRef.current);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  };

  // 아이템 타입별 내부 렌더링
  const renderItemContent = () => {
    const { type, content, isFlipped } = data;
    const flipStyle = isFlipped ? { transform: 'scaleX(-1)' } : {};

    switch (type) {
      case 'emoji':
        return <div className="deco-content-emoji" style={flipStyle}>{content.emoji || '🔥'}</div>;
      case 'stamp':
        return (
          <div className={`deco-content-stamp ${content.stampClass || 'stamp-orange'}`} style={flipStyle}>
            {content.stampText || '★ NEW PR ★'}
          </div>
        );
      case 'tape':
        return <div className={`deco-content-tape ${content.tapeClass || 'tape-orange'}`} style={flipStyle} />;
      case 'note':
        return (
          <div className={`deco-content-note ${content.noteColor || 'note-dark'}`} style={flipStyle}>
            <div className="note-pin" />
            <p>{content.noteText || '오늘 운동 완료!'}</p>
          </div>
        );
      case 'photo':
        return (
          <div className="deco-content-polaroid" style={flipStyle}>
            <img src={content.photoUrl} alt="Workout Photo" className="polaroid-img" />
            <div className="polaroid-caption">{content.photoCaption || '오운완 인증 📸'}</div>
          </div>
        );
      default:
        return <div className="deco-content-emoji">{content.emoji || '💪'}</div>;
    }
  };

  return (
    <div
      className={`deco-item-wrapper ${isActive ? 'active' : ''}`}
      style={{
        transform: `translate3d(${data.x}px, ${data.y}px, 0) rotate(${data.rotation}deg) scale(${data.scale})`,
        zIndex: data.zIndex || 5
      }}
      onPointerDown={(e) => handlePointerDown(e, 'move')}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(data.id);
      }}
    >
      {renderItemContent()}

      {isActive && (
        <div className="deco-bounding-box">
          {/* 삭제 */}
          <button
            className="box-ctrl-btn ctrl-delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(data.id);
            }}
            aria-label="삭제"
          >
            <X size={12} />
          </button>

          {/* 좌우 반전 */}
          <button
            className="box-ctrl-btn ctrl-flip"
            onClick={(e) => {
              e.stopPropagation();
              onFlip(data.id);
            }}
            aria-label="반전"
          >
            <RefreshCw size={12} />
          </button>

          {/* 복제 */}
          <button
            className="box-ctrl-btn ctrl-clone"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(data.id);
            }}
            aria-label="복제"
          >
            <Copy size={12} />
          </button>

          {/* 회전 & 스케일 핸들 */}
          <div
            className="box-ctrl-btn ctrl-transform"
            onPointerDown={(e) => handlePointerDown(e, 'transform')}
            aria-label="크기 및 각도 조절"
          >
            <RotateCw size={12} />
          </div>
        </div>
      )}
    </div>
  );
}
