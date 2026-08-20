import { useState, useEffect } from 'react';
import { X, Settings, Dumbbell, Heart, Baby, Check, Sparkles } from 'lucide-react';
import { HapticService } from '../../services/hapticService';
import { getAppMode, saveAppMode, getMaternityProfile, saveMaternityProfile } from '../../services/storageService';

export function SettingsModal({ isOpen, onClose, onModeChange }) {
  const [currentMode, setCurrentMode] = useState('workout');
  const [profile, setProfile] = useState({
    dueDate: '2026-11-20',
    preWeight: 52.0,
    heightCm: 164,
    currentWeight: 56.4,
    babyNickname: '튼튼이'
  });

  useEffect(() => {
    if (isOpen) {
      getAppMode().then(setCurrentMode);
      getMaternityProfile().then(setProfile);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectMode = async (mode) => {
    HapticService.medium();
    setCurrentMode(mode);
    await saveAppMode(mode);
    if (onModeChange) onModeChange(mode);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    HapticService.success();
    await saveMaternityProfile(profile);
    if (onModeChange) onModeChange(currentMode);
    onClose();
  };

  return (
    <div className="settings-modal-overlay show" onClick={onClose}>
      <div className="settings-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="settings-modal-header">
          <div className="settings-title-group">
            <Settings size={18} className="text-primary" />
            <h3 className="settings-modal-title">앱 설정 & 모드 변경</h3>
          </div>
          <button className="settings-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="settings-section">
          <label className="settings-section-label">사용 모드 선택</label>
          <div className="mode-selector-grid">
            <div
              className={`mode-option-card ${currentMode === 'workout' ? 'active' : ''}`}
              onClick={() => handleSelectMode('workout')}
            >
              <div className="mode-card-header">
                <Dumbbell size={20} className="mode-icon workout" />
                {currentMode === 'workout' && <Check size={16} className="check-icon" />}
              </div>
              <h4 className="mode-name">웨이트 트레이닝 모드</h4>
              <p className="mode-desc">세트 빌더, 운동 일지, 볼륨 통계, Before/After</p>
            </div>

            <div
              className={`mode-option-card ${currentMode === 'maternity' ? 'active' : ''}`}
              onClick={() => handleSelectMode('maternity')}
            >
              <div className="mode-card-header">
                <Baby size={20} className="mode-icon maternity" />
                {currentMode === 'maternity' && <Check size={16} className="check-icon" />}
              </div>
              <h4 className="mode-name">임산부 건강 케어 모드</h4>
              <p className="mode-desc">주수 D-Day, ACOG 체중 분석, 3대 증상 케어, 태교 다꾸</p>
            </div>
          </div>
        </div>

        {/* Maternity Profile Form (임산부 모드일 때 노출) */}
        {currentMode === 'maternity' && (
          <form onSubmit={handleSaveProfile} className="settings-section maternity-form">
            <div className="maternity-form-header">
              <Sparkles size={14} className="text-primary" />
              <span>임산부 건강 프로필</span>
            </div>

            <div className="form-input-grid">
              <div className="form-group">
                <label className="input-label">아기 태명</label>
                <input
                  type="text"
                  className="settings-input"
                  value={profile.babyNickname || ''}
                  onChange={(e) => setProfile({ ...profile, babyNickname: e.target.value })}
                  placeholder="예: 튼튼이"
                />
              </div>

              <div className="form-group">
                <label className="input-label">출산 예정일 (Due Date)</label>
                <input
                  type="date"
                  className="settings-input"
                  value={profile.dueDate || ''}
                  onChange={(e) => setProfile({ ...profile, dueDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="input-label">임신 전 체중 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="settings-input"
                  value={profile.preWeight || ''}
                  onChange={(e) => setProfile({ ...profile, preWeight: parseFloat(e.target.value) || 0 })}
                  placeholder="52.0"
                  required
                />
              </div>

              <div className="form-group">
                <label className="input-label">키 (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  className="settings-input"
                  value={profile.heightCm || ''}
                  onChange={(e) => setProfile({ ...profile, heightCm: parseFloat(e.target.value) || 0 })}
                  placeholder="164"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label className="input-label">현재 체중 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="settings-input highlight"
                  value={profile.currentWeight || ''}
                  onChange={(e) => setProfile({ ...profile, currentWeight: parseFloat(e.target.value) || 0 })}
                  placeholder="56.4"
                  required
                />
              </div>
            </div>

            <button type="submit" className="save-profile-btn">
              임신 프로필 저장 & 적용
            </button>
          </form>
        )}

        {currentMode === 'workout' && (
          <button className="save-profile-btn workout" onClick={onClose}>
            설정 완료
          </button>
        )}
      </div>
    </div>
  );
}
