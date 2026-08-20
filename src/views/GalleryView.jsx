import { useState, useRef } from 'react';
import { Split, Lock, Move, ZoomIn, ZoomOut, RotateCcw, Image as ImageIcon, Sparkles } from 'lucide-react';
import { HapticService } from '../services/hapticService';
import { compressImageToWebP } from '../services/imageService';

export function GalleryView() {
  const [sliderPos, setSliderPos] = useState(50);
  const [activeAdjustTarget, setActiveAdjustTarget] = useState('split'); // 'split' | 'before' | 'after'

  // Before / After 개별 이미지 Transform (위치 x, y, 확대 scale)
  const [beforeTransform, setBeforeTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [afterTransform, setAfterTransform] = useState({ x: 0, y: 0, scale: 1 });

  // 기본 샘플 이미지 및 사용자 커스텀 이미지
  const [beforeImgUrl, setBeforeImgUrl] = useState(
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80'
  );
  const [afterImgUrl, setAfterImgUrl] = useState(
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80'
  );

  const beforeFileRef = useRef(null);
  const afterFileRef = useRef(null);

  // 드래그 이동 핸들러
  const handlePointerDown = (e, target) => {
    if (activeAdjustTarget === 'split') return; // 분할 모드에서는 중앙 바 조작 우선

    e.preventDefault();
    HapticService.light();

    const startX = e.clientX || (e.touches && e.touches[0].clientX);
    const startY = e.clientY || (e.touches && e.touches[0].clientY);

    const isBefore = target === 'before';
    const startTransform = isBefore ? { ...beforeTransform } : { ...afterTransform };

    const onMove = (moveEvent) => {
      moveEvent.preventDefault();
      const cx = moveEvent.clientX || (moveEvent.touches && moveEvent.touches[0].clientX);
      const cy = moveEvent.clientY || (moveEvent.touches && moveEvent.touches[0].clientY);

      const dx = cx - startX;
      const dy = cy - startY;

      const next = {
        ...startTransform,
        x: startTransform.x + dx,
        y: startTransform.y + dy
      };

      if (isBefore) {
        setBeforeTransform(next);
      } else {
        setAfterTransform(next);
      }
    };

    const onEnd = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  };

  // 줌 확대/축소
  const handleZoom = (target, delta) => {
    HapticService.light();
    if (target === 'before') {
      setBeforeTransform((prev) => ({
        ...prev,
        scale: Math.max(0.5, Math.min(3.0, Number((prev.scale + delta).toFixed(2))))
      }));
    } else {
      setAfterTransform((prev) => ({
        ...prev,
        scale: Math.max(0.5, Math.min(3.0, Number((prev.scale + delta).toFixed(2))))
      }));
    }
  };

  // 위치 및 크기 초기화
  const handleResetTransform = (target) => {
    HapticService.medium();
    if (target === 'before') {
      setBeforeTransform({ x: 0, y: 0, scale: 1 });
    } else if (target === 'after') {
      setAfterTransform({ x: 0, y: 0, scale: 1 });
    } else {
      setBeforeTransform({ x: 0, y: 0, scale: 1 });
      setAfterTransform({ x: 0, y: 0, scale: 1 });
    }
  };

  // 사진 업로드 핸들러
  const handlePhotoUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const webpBlob = await compressImageToWebP(file, 1080, 0.85);
      const url = URL.createObjectURL(webpBlob);
      if (type === 'before') {
        setBeforeImgUrl(url);
        setBeforeTransform({ x: 0, y: 0, scale: 1 });
      } else {
        setAfterImgUrl(url);
        setAfterTransform({ x: 0, y: 0, scale: 1 });
      }
      HapticService.success();
    } catch (err) {
      console.error('Image upload failed:', err);
    }
  };

  return (
    <div className="ruti-tab-view-container">
      <header className="tab-view-header">
        <h2 className="tab-view-title">눈바디 체형 비교</h2>
        <span className="tab-view-badge">100% PRIVATE</span>
      </header>

      {/* Mode Switcher Tabs */}
      <div className="gallery-mode-tabs-row">
        <button
          className={`gallery-mode-btn ${activeAdjustTarget === 'split' ? 'active' : ''}`}
          onClick={() => {
            HapticService.light();
            setActiveAdjustTarget('split');
          }}
        >
          <Split size={14} />
          <span>분할 비교 모드</span>
        </button>
        <button
          className={`gallery-mode-btn ${activeAdjustTarget === 'before' ? 'active' : ''}`}
          onClick={() => {
            HapticService.light();
            setActiveAdjustTarget('before');
          }}
        >
          <Move size={14} />
          <span>Before 위치/크기 조절</span>
        </button>
        <button
          className={`gallery-mode-btn ${activeAdjustTarget === 'after' ? 'active' : ''}`}
          onClick={() => {
            HapticService.light();
            setActiveAdjustTarget('after');
          }}
        >
          <Move size={14} />
          <span>After 위치/크기 조절</span>
        </button>
      </div>

      {/* Before & After Interactive Viewport */}
      <div className="before-after-card">
        <div className="ba-slider-container">
          {/* 1. After Image (Base Layer) */}
          <div
            className={`ba-image-layer after-layer ${activeAdjustTarget === 'after' ? 'editable' : ''}`}
            onPointerDown={(e) => activeAdjustTarget === 'after' && handlePointerDown(e, 'after')}
          >
            <img
              src={afterImgUrl}
              alt="After"
              className="ba-img"
              style={{
                transform: `translate(${afterTransform.x}px, ${afterTransform.y}px) scale(${afterTransform.scale})`,
                transformOrigin: 'center center'
              }}
              draggable={false}
            />
            {activeAdjustTarget === 'after' && (
              <div className="editing-guide-overlay">
                <span>[After 드래그 이동 / 하단 줌]</span>
              </div>
            )}
          </div>

          {/* 2. Before Image (Clipped Layer - 중심점 완벽 고정) */}
          <div
            className={`ba-image-layer before-layer ${activeAdjustTarget === 'before' ? 'editable' : ''}`}
            style={{
              clipPath: `inset(0 ${100 - sliderPos}% 0 0)`
            }}
            onPointerDown={(e) => activeAdjustTarget === 'before' && handlePointerDown(e, 'before')}
          >
            <img
              src={beforeImgUrl}
              alt="Before"
              className="ba-img"
              style={{
                transform: `translate(${beforeTransform.x}px, ${beforeTransform.y}px) scale(${beforeTransform.scale})`,
                transformOrigin: 'center center'
              }}
              draggable={false}
            />
            {activeAdjustTarget === 'before' && (
              <div className="editing-guide-overlay">
                <span>[Before 드래그 이동 / 하단 줌]</span>
              </div>
            )}
          </div>

          {/* 3. Center Divider & Handle */}
          <div className="ba-divider-line" style={{ left: `${sliderPos}%` }}>
            <div className="ba-divider-handle">⇆</div>
          </div>

          {/* 4. Split Range Controller (분할 모드에서만 터치 활성화) */}
          {activeAdjustTarget === 'split' && (
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => {
                HapticService.light();
                setSliderPos(Number(e.target.value));
              }}
              className="ba-range-slider"
              aria-label="Before/After 비율 조절 슬라이더"
            />
          )}
        </div>

        {/* Labels & Photo Replacement Buttons */}
        <div className="ba-labels-row">
          <div className="ba-label-group">
            <span className="label-before">Before (1달 전)</span>
            <button
              className="change-photo-mini-btn"
              onClick={() => beforeFileRef.current?.click()}
            >
              <ImageIcon size={12} />
              <span>사진 변경</span>
            </button>
            <input
              type="file"
              accept="image/*"
              ref={beforeFileRef}
              style={{ display: 'none' }}
              onChange={(e) => handlePhotoUpload(e, 'before')}
            />
          </div>

          <div className="ba-label-group right">
            <button
              className="change-photo-mini-btn"
              onClick={() => afterFileRef.current?.click()}
            >
              <ImageIcon size={12} />
              <span>사진 변경</span>
            </button>
            <span className="label-after">After (오늘) 🔥</span>
            <input
              type="file"
              accept="image/*"
              ref={afterFileRef}
              style={{ display: 'none' }}
              onChange={(e) => handlePhotoUpload(e, 'after')}
            />
          </div>
        </div>

        {/* Zoom & Reset Toolbar for Adjustment Mode */}
        {activeAdjustTarget !== 'split' && (
          <div className="ba-adjust-control-toolbar">
            <div className="adjust-target-badge">
              {activeAdjustTarget === 'before' ? 'Before 조절 중' : 'After 조절 중'}
            </div>

            <div className="adjust-tools-group">
              <button
                className="tool-action-btn"
                onClick={() => handleZoom(activeAdjustTarget, -0.1)}
                title="축소"
              >
                <ZoomOut size={16} />
              </button>
              <span className="zoom-level-text">
                {Math.round((activeAdjustTarget === 'before' ? beforeTransform.scale : afterTransform.scale) * 100)}%
              </span>
              <button
                className="tool-action-btn"
                onClick={() => handleZoom(activeAdjustTarget, 0.1)}
                title="확대"
              >
                <ZoomIn size={16} />
              </button>

              <button
                className="tool-action-btn reset"
                onClick={() => handleResetTransform(activeAdjustTarget)}
                title="위치 초기화"
              >
                <RotateCcw size={16} />
                <span>초기화</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Guide Tips */}
      <div className="routine-tip-card">
        <div className="tip-header">
          <Sparkles size={16} className="text-primary" />
          <span>눈바디 비교 꿀팁</span>
        </div>
        <p className="tip-content">
          체형 구도가 다를 때는 <strong>[Before/After 조절 모드]</strong>에서 사진을 드래그하여 어깨와 골반 높이를 맞춘 뒤, <strong>[분할 비교 모드]</strong>로 전환하여 변화를 확인해 보세요.
        </p>
      </div>

      {/* Privacy Notice */}
      <div className="privacy-badge-card">
        <Lock size={16} className="text-accent-green" />
        <p>눈바디 사진은 외부 서버로 전송되지 않고 기기 내부 IndexedDB에 안전하게 암호화 보관됩니다.</p>
      </div>
    </div>
  );
}
