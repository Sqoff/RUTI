import { useState, useEffect } from 'react';
import { 
  Baby, 
  Scale, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight,
  ShieldAlert,
  Heart,
  Edit3
} from 'lucide-react';
import { HapticService } from '../services/hapticService';
import { getMaternityProfile, saveMaternityProfile } from '../services/storageService';
import { 
  calculatePregnancyProgress, 
  analyzeWeightGain, 
  MATERNITY_SYMPTOMS_GUIDE,
  FETUS_WEEKLY_INFO 
} from '../services/maternityService';

export function MaternityView({ onOpenSettings }) {
  const [profile, setProfile] = useState({
    dueDate: '2026-11-20',
    preWeight: 52.0,
    heightCm: 164,
    currentWeight: 56.4,
    babyNickname: '튼튼이'
  });

  const [selectedSymptomId, setSelectedSymptomId] = useState('sciatica');
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [tempWeight, setTempWeight] = useState('');

  // 릴랙스 스트레칭 타이머 상태
  const [timerSeconds, setTimerSeconds] = useState(40);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentExerciseName, setCurrentExerciseName] = useState('의자 4자 이상근 스트레칭');

  useEffect(() => {
    getMaternityProfile().then((p) => {
      setProfile(p);
      setTempWeight(p.currentWeight.toString());
    });
  }, []);

  // 타이머 인터벌
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      HapticService.success();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const progress = calculatePregnancyProgress(profile.dueDate);
  const weightAnalysis = analyzeWeightGain(
    profile.preWeight,
    profile.heightCm,
    profile.currentWeight,
    progress.weeks
  );

  const selectedSymptom = MATERNITY_SYMPTOMS_GUIDE.find((s) => s.id === selectedSymptomId) || MATERNITY_SYMPTOMS_GUIDE[0];

  // 주수별 태아 크기 비유
  const nearestWeek = Object.keys(FETUS_WEEKLY_INFO)
    .map(Number)
    .reduce((prev, curr) => (Math.abs(curr - progress.weeks) < Math.abs(prev - progress.weeks) ? curr : prev), 20);
  const fetusInfo = FETUS_WEEKLY_INFO[nearestWeek] || FETUS_WEEKLY_INFO[20];

  const handleSaveCurrentWeight = async () => {
    const w = parseFloat(tempWeight);
    if (!w || isNaN(w)) return;
    HapticService.success();
    const updated = { ...profile, currentWeight: w };
    setProfile(updated);
    await saveMaternityProfile(updated);
    setIsEditingWeight(false);
  };

  const startExerciseTimer = (exercise) => {
    HapticService.medium();
    setCurrentExerciseName(exercise.name);
    setTimerSeconds(40);
    setIsTimerRunning(true);
  };

  return (
    <div className="ruti-tab-view-container maternity-theme-container">
      {/* 1. D-Day & Baby Banner */}
      <div className="maternity-hero-card">
        <div className="maternity-hero-top">
          <div className="baby-badge">
            <Baby size={16} />
            <span>{profile.babyNickname} 만나는 날</span>
          </div>
          <span className="dday-pill">D-{progress.dDay}</span>
        </div>

        <div className="maternity-week-display">
          <div className="week-number-group">
            <h2 className="week-title">{progress.weeks}주 {progress.days}일차</h2>
            <span className="trimester-badge">
              {progress.trimester === 1 && '임신 초기 (1~13주)'}
              {progress.trimester === 2 && '임신 중기 (14~27주)'}
              {progress.trimester === 3 && '임신 후기 (28~40주)'}
            </span>
          </div>

          <div className="fetus-size-box">
            <span className="fetus-icon-label">지금 아기 크기는?</span>
            <div className="fetus-item-badge">
              <strong>{fetusInfo.item}</strong> 크기
            </div>
          </div>
        </div>

        <p className="fetus-desc-text">{fetusInfo.desc}</p>
      </div>

      {/* 2. Weight Analysis Card (ACOG Guideline) */}
      <div className="maternity-card weight-analysis-card">
        <div className="card-header-row">
          <div className="card-title-group">
            <Scale size={18} className="text-primary" />
            <h3 className="card-title">주수별 체중 건강 분석 (ACOG)</h3>
          </div>
          <button className="edit-mini-btn" onClick={() => setIsEditingWeight(!isEditingWeight)}>
            <Edit3 size={13} />
            <span>{isEditingWeight ? '닫기' : '체중 기록'}</span>
          </button>
        </div>

        {isEditingWeight ? (
          <div className="weight-quick-edit-box">
            <label>오늘 측정한 체중 입력 (kg)</label>
            <div className="quick-edit-row">
              <input
                type="number"
                step="0.1"
                value={tempWeight}
                onChange={(e) => setTempWeight(e.target.value)}
                placeholder="56.4"
                className="quick-weight-input"
              />
              <button className="quick-save-btn" onClick={handleSaveCurrentWeight}>
                저장
              </button>
            </div>
          </div>
        ) : (
          <div className="weight-stats-summary-grid">
            <div className="weight-stat-box">
              <span className="stat-sub">임신 전 체중</span>
              <span className="stat-main">{profile.preWeight} kg</span>
              <span className="stat-tag">BMI {weightAnalysis.bmi} ({weightAnalysis.categoryName})</span>
            </div>

            <div className="weight-stat-box highlight">
              <span className="stat-sub">현재 체중</span>
              <span className="stat-main">{profile.currentWeight} kg</span>
              <span className={`stat-gain ${weightAnalysis.actualGain >= 0 ? 'plus' : 'minus'}`}>
                {weightAnalysis.actualGain >= 0 ? `+${weightAnalysis.actualGain}` : weightAnalysis.actualGain} kg
              </span>
            </div>

            <div className="weight-stat-box">
              <span className="stat-sub">{progress.weeks}주차 권장 범위</span>
              <span className="stat-main range">{weightAnalysis.idealMinWeight} ~ {weightAnalysis.idealMaxWeight} kg</span>
              <span className="stat-tag">IOM 의학 기준</span>
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className={`weight-status-banner ${weightAnalysis.status}`}>
          {weightAnalysis.status === 'optimal' && <CheckCircle2 size={18} />}
          {weightAnalysis.status !== 'optimal' && <AlertCircle size={18} />}
          <div className="status-text-wrap">
            <span className="status-label">{weightAnalysis.statusText}</span>
            <span className="status-desc">{weightAnalysis.statusDesc}</span>
          </div>
        </div>
      </div>

      {/* 3. Symptoms & Pain Relief Interactive Care Center */}
      <div className="maternity-card symptoms-care-card">
        <div className="card-header-row">
          <div className="card-title-group">
            <Heart size={18} className="text-accent-pink" />
            <h3 className="card-title">임산부 3대 증상별 맞춤 완화 케어</h3>
          </div>
        </div>

        {/* Symptom Tabs */}
        <div className="symptom-tabs-nav">
          {MATERNITY_SYMPTOMS_GUIDE.map((symptom) => (
            <button
              key={symptom.id}
              className={`symptom-tab-btn ${selectedSymptomId === symptom.id ? 'active' : ''}`}
              onClick={() => {
                HapticService.light();
                setSelectedSymptomId(symptom.id);
                setIsTimerRunning(false);
              }}
            >
              <span className="tab-icon">{symptom.icon}</span>
              <span className="tab-text">{symptom.title.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Selected Symptom Detail View */}
        <div className="selected-symptom-detail">
          <div className="symptom-detail-header">
            <h4 className="detail-title">{selectedSymptom.title}</h4>
            <p className="detail-short-desc">{selectedSymptom.shortDesc}</p>
          </div>

          <div className="cause-info-box">
            <strong>의학적 원인:</strong> {selectedSymptom.cause}
          </div>

          {/* Exercise List */}
          <div className="exercises-list-section">
            <label className="section-subtitle">추천 완화 스트레칭 동작</label>
            <div className="exercises-cards-col">
              {selectedSymptom.exercises.map((ex, idx) => (
                <div key={idx} className="exercise-action-card">
                  <div className="ex-info">
                    <div className="ex-name-row">
                      <span className="ex-idx">{idx + 1}</span>
                      <strong className="ex-name">{ex.name}</strong>
                      <span className="ex-duration-badge">{ex.duration}</span>
                    </div>
                    <p className="ex-guide">{ex.guide}</p>
                  </div>
                  <button
                    className="start-timer-mini-btn"
                    onClick={() => startExerciseTimer(ex)}
                  >
                    <Play size={12} />
                    <span>타이머</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Live Stretching Timer Modal / Floating Box */}
          {isTimerRunning && (
            <div className="stretching-timer-box">
              <div className="timer-info">
                <span className="current-ex-title">{currentExerciseName}</span>
                <span className="timer-digits">{timerSeconds}초</span>
              </div>
              <div className="timer-btns">
                <button
                  className="timer-control-btn"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                >
                  {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button
                  className="timer-control-btn"
                  onClick={() => {
                    setTimerSeconds(40);
                    setIsTimerRunning(false);
                  }}
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Doctor & PT Advice */}
          <div className="doctor-tips-card">
            <div className="tips-title-row">
              <Sparkles size={14} className="text-accent-gold" />
              <span>전문의 & 물리치료사 생활 케어 팁</span>
            </div>
            <ul className="tips-list">
              {selectedSymptom.doctorTips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Safety Precautions Warning */}
      <div className="safety-warning-card">
        <ShieldAlert size={18} className="text-accent-danger" />
        <div className="safety-text">
          <strong>임산부 안전 주의사항</strong>
          <p>운동 중 하복부 통증, 출혈, 현기증 또는 양수 누수 증상이 발생하면 즉시 동작을 멈추고 안정을 취한 뒤 담당 산부인과에 문의하세요.</p>
        </div>
      </div>
    </div>
  );
}
