import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Flame, CheckCircle2 } from 'lucide-react';
import { HapticService } from '../services/hapticService';

export function WorkoutView() {
  const [seconds, setSeconds] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [initialSeconds, setInitialSeconds] = useState(60);

  useEffect(() => {
    let interval = null;
    if (isRunning && seconds > 0) {
      interval = setInterval(() => setSeconds((s) => s - 1), 1000);
    } else if (seconds === 0 && isRunning) {
      setIsRunning(false);
      HapticService.success();
    }
    return () => clearInterval(interval);
  }, [isRunning, seconds]);

  const handleStart = () => {
    HapticService.medium();
    setIsRunning(!isRunning);
  };

  const handleReset = (s = initialSeconds) => {
    HapticService.light();
    setIsRunning(false);
    setSeconds(s);
    setInitialSeconds(s);
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="ruti-tab-view-container">
      <header className="tab-view-header">
        <h2 className="tab-view-title">실시간 세트 타이머</h2>
        <span className="tab-view-badge">LIVE REST</span>
      </header>

      {/* Timer Display Card */}
      <div className="athletic-timer-card">
        <div className="timer-circle-wrap">
          <div className="timer-digits-display">{formatTime(seconds)}</div>
          <span className="timer-sub-label">REST TIME</span>
        </div>

        {/* Quick Presets */}
        <div className="timer-preset-btns">
          {[30, 60, 90, 120].map((t) => (
            <button
              key={t}
              className={`preset-btn ${initialSeconds === t ? 'active' : ''}`}
              onClick={() => handleReset(t)}
            >
              {t}초
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="timer-action-controls">
          <button className="timer-ctrl-btn secondary" onClick={() => handleReset(initialSeconds)}>
            <RotateCcw size={20} />
            <span>초기화</span>
          </button>
          <button
            className={`timer-ctrl-btn primary ${isRunning ? 'running' : ''}`}
            onClick={handleStart}
          >
            {isRunning ? <Pause size={22} /> : <Play size={22} />}
            <span>{isRunning ? '일시정지' : '휴식 시작'}</span>
          </button>
        </div>
      </div>

      {/* Routine Quick Tips */}
      <div className="routine-tip-card">
        <div className="tip-header">
          <Flame size={16} className="text-primary" />
          <span>점진적 과부하 꿀팁</span>
        </div>
        <p className="tip-content">
          세트 간 60~90초의 일정한 휴식을 유지하면 근비대 효율이 25% 이상 향상됩니다.
        </p>
      </div>
    </div>
  );
}
