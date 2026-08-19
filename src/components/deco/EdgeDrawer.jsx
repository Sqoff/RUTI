import { useState, useRef } from 'react';
import { X, Image as ImageIcon, Sparkles } from 'lucide-react';
import { compressImageToWebP, savePhotoBlob } from '../../services/imageService';
import { HapticService } from '../../services/hapticService';

const CREATOR_STICKERS = [
  { label: '불꽃 버닝', emoji: '🔥' },
  { label: '득근 완료', emoji: '💪' },
  { label: '땀방울 뚝뚝', emoji: '💦' },
  { label: '황금 왕관', emoji: '👑' },
  { label: '에너지 번개', emoji: '⚡' },
  { label: '근육통 뿜뿜', emoji: '💀' },
  { label: '타깃 명중', emoji: '🎯' },
  { label: '트로피 달성', emoji: '🏆' },
  { label: '달콤한 휴식', emoji: '💤' },
  { label: '헬스 냥이', emoji: '🐱' },
  { label: '벌크 댕댕', emoji: '🐶' },
  { label: '단백질 쉐이크', emoji: '🥤' }
];

const TEXT_STAMPS = [
  { text: '★ NEW PR ★', class: 'stamp-orange' },
  { text: '100% PUMPED', class: 'stamp-cyan' },
  { text: 'NO DAYS OFF', class: 'stamp-dark' },
  { text: 'HEAVY WEIGHT', class: 'stamp-orange' },
  { text: '★ 오.운.완 ★', class: 'stamp-cyan' },
  { text: 'CHEST DESTROY', class: 'stamp-dark' }
];

const MASKING_TAPES = [
  { class: 'tape-orange', label: '오렌지 스트라이프' },
  { class: 'tape-cyan', label: '시안 체크' },
  { class: 'tape-dark', label: '카본 다크' }
];

const STICKY_NOTES = [
  { color: 'note-dark', text: '오늘 벤치프레스 최고기록 달성! 자극 미쳤다 🔥' },
  { color: 'note-orange', text: '가슴 상부 위주로 집중 훈련. 단백질 꼭 챙겨먹기!' },
  { color: 'note-cyan', text: '내일은 푹 쉬고 등/이두 조지러 가자 💪' }
];

export function EdgeDrawer({ isOpen, onClose, onAddItem }) {
  const [activeTab, setActiveTab] = useState('creator');
  const fileInputRef = useRef(null);

  // 사진 업로드 및 1080px WebP 압축 파이프라인
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    HapticService.medium();
    try {
      // 1. 1080px WebP 실시간 압축
      const webpBlob = await compressImageToWebP(file, 1080, 0.8);
      // 2. IndexedDB 저장
      const photoId = await savePhotoBlob(webpBlob);
      const photoUrl = URL.createObjectURL(webpBlob);

      // 3. 캔버스에 폴라로이드 DecoItem 추가
      onAddItem('photo', {
        photoId,
        photoUrl,
        photoCaption: `${new Date().getMonth() + 1}/${new Date().getDate()} 오운완 인증 📸`
      });
      onClose();
    } catch (err) {
      console.error('Photo compress error:', err);
      alert('사진을 불러오는데 실패했습니다.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <aside className={`edge-drawer-container ${isOpen ? 'open' : ''}`}>
      {/* Drawer Header */}
      <div className="drawer-header-bar">
        <div className="drawer-title-group">
          <Sparkles size={16} className="text-primary" />
          <span className="drawer-title-text">다꾸 소품 보관함</span>
        </div>
        <button className="drawer-close-btn" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="drawer-tab-scroll-bar">
        <button
          className={`drawer-tab-item ${activeTab === 'creator' ? 'active' : ''}`}
          onClick={() => setActiveTab('creator')}
        >
          크리에이터
        </button>
        <button
          className={`drawer-tab-item ${activeTab === 'stamp' ? 'active' : ''}`}
          onClick={() => setActiveTab('stamp')}
        >
          스탬프
        </button>
        <button
          className={`drawer-tab-item ${activeTab === 'tape' ? 'active' : ''}`}
          onClick={() => setActiveTab('tape')}
        >
          마스킹테이프
        </button>
        <button
          className={`drawer-tab-item ${activeTab === 'note' ? 'active' : ''}`}
          onClick={() => setActiveTab('note')}
        >
          메모지
        </button>
        <button
          className={`drawer-tab-item ${activeTab === 'photo' ? 'active' : ''}`}
          onClick={() => setActiveTab('photo')}
        >
          사진인증
        </button>
      </div>

      {/* Content by Tab */}
      <div className="drawer-content-scroll">
        {activeTab === 'creator' && (
          <div className="palette-grid-3col">
            {CREATOR_STICKERS.map((st, idx) => (
              <div
                key={idx}
                className="palette-sticker-box"
                onClick={() => {
                  onAddItem('emoji', { emoji: st.emoji });
                  onClose();
                }}
              >
                <span className="emoji-display">{st.emoji}</span>
                <span className="emoji-label">{st.label}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'stamp' && (
          <div className="palette-grid-stack">
            {TEXT_STAMPS.map((st, idx) => (
              <div
                key={idx}
                className={`palette-stamp-box ${st.class}`}
                onClick={() => {
                  onAddItem('stamp', { stampText: st.text, stampClass: st.class });
                  onClose();
                }}
              >
                {st.text}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'tape' && (
          <div className="palette-grid-stack">
            {MASKING_TAPES.map((tp, idx) => (
              <div
                key={idx}
                className="palette-tape-card"
                onClick={() => {
                  onAddItem('tape', { tapeClass: tp.class });
                  onClose();
                }}
              >
                <div className={`tape-preview-bar ${tp.class}`} />
                <span className="tape-name-label">{tp.label}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'note' && (
          <div className="palette-grid-stack">
            {STICKY_NOTES.map((nt, idx) => (
              <div
                key={idx}
                className={`palette-note-card ${nt.color}`}
                onClick={() => {
                  onAddItem('note', { noteText: nt.text, noteColor: nt.color });
                  onClose();
                }}
              >
                <div className="note-pin" />
                <p>{nt.text}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'photo' && (
          <div className="palette-photo-upload-area">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handlePhotoUpload}
            />
            <button
              className="photo-upload-action-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon size={28} />
              <span>갤러리 사진 불러오기</span>
              <small>1080px WebP 자동 압축 ➔ 0초 렉 프리</small>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
