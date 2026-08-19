import { BarChart3, Trophy, TrendingUp } from 'lucide-react';

export function StatsView() {
  const WEEKLY_DATA = [
    { day: '월', vol: 2400 },
    { day: '화', vol: 3450 },
    { day: '수', vol: 0 },
    { day: '목', vol: 2800 },
    { day: '금', vol: 3100 },
    { day: '토', vol: 4200 },
    { day: '일', vol: 0 }
  ];

  const maxVol = 4500;

  return (
    <div className="ruti-tab-view-container">
      <header className="tab-view-header">
        <h2 className="tab-view-title">성장 볼륨 & PR 통계</h2>
        <span className="tab-view-badge">WEEKLY STATS</span>
      </header>

      {/* PR Highlights */}
      <div className="pr-highlight-grid">
        <div className="pr-item-card">
          <div className="pr-icon-wrap trophy">
            <Trophy size={20} />
          </div>
          <div className="pr-info-wrap">
            <span className="pr-ex-name">벤치프레스</span>
            <span className="pr-val">70 kg <small>(NEW PR)</small></span>
          </div>
        </div>

        <div className="pr-item-card">
          <div className="pr-icon-wrap streak">
            <TrendingUp size={20} />
          </div>
          <div className="pr-info-wrap">
            <span className="pr-ex-name">스쿼트</span>
            <span className="pr-val">100 kg</span>
          </div>
        </div>
      </div>

      {/* Weekly Volume Chart Card */}
      <div className="weekly-volume-card">
        <div className="volume-card-header">
          <BarChart3 size={16} className="text-primary" />
          <span>주간 총 훈련 볼륨 (kg)</span>
        </div>

        <div className="chart-bars-wrap">
          {WEEKLY_DATA.map((item, idx) => {
            const heightPercent = item.vol > 0 ? Math.round((item.vol / maxVol) * 100) : 4;
            const isToday = item.day === '화';
            return (
              <div key={idx} className="chart-col">
                <span className="chart-val-num">{item.vol > 0 ? `${(item.vol / 1000).toFixed(1)}k` : ''}</span>
                <div
                  className={`chart-bar-fill ${isToday ? 'today-highlight' : ''}`}
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="chart-day-label">{item.day}</span>
              </div>
            );
          })}
        </div>

        <div className="volume-total-footer">
          <span>이번 주 누적 볼륨</span>
          <strong>15,950 kg 🔥</strong>
        </div>
      </div>
    </div>
  );
}
