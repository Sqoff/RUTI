import { useState } from 'react';
import { Camera, Split, Lock } from 'lucide-react';
import { HapticService } from '../services/hapticService';

export function GalleryView() {
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <div className="ruti-tab-view-container">
      <header className="tab-view-header">
        <h2 className="tab-view-title">눈바디 체형 변화</h2>
        <span className="tab-view-badge">100% PRIVATE</span>
      </header>

      {/* Before & After Interactive Slider */}
      <div className="before-after-card">
        <div className="ba-header">
          <Split size={16} className="text-secondary" />
          <span>Before & After 분할 비교</span>
        </div>

        <div className="ba-slider-container">
          <img
            src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80"
            alt="After"
            className="ba-img after-img"
          />
          <div
            className="ba-clip-wrapper"
            style={{ width: `${sliderPos}%` }}
          >
            <img
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80"
              alt="Before"
              className="ba-img before-img"
            />
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => {
              HapticService.light();
              setSliderPos(e.target.value);
            }}
            className="ba-range-slider"
          />
          <div className="ba-divider-line" style={{ left: `${sliderPos}%` }}>
            <div className="ba-divider-handle">⇆</div>
          </div>
        </div>

        <div className="ba-labels-row">
          <span className="label-before">D-30 (1달 전)</span>
          <span className="label-after">오늘 (D-Day) 🔥</span>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="privacy-badge-card">
        <Lock size={16} className="text-accent-green" />
        <p>눈바디 사진은 외부 서버로 전송되지 않고 기기 내부 IndexedDB에 안전하게 암호화 보관됩니다.</p>
      </div>
    </div>
  );
}
