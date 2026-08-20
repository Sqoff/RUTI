import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Home, Dumbbell, Camera, BarChart3, Settings, Baby, Heart } from 'lucide-react';
import { HomeView } from './views/HomeView';
import { WorkoutView } from './views/WorkoutView';
import { GalleryView } from './views/GalleryView';
import { StatsView } from './views/StatsView';
import { MaternityView } from './views/MaternityView';
import { SettingsModal } from './components/common/SettingsModal';
import { HapticService } from './services/hapticService';
import { getAppMode } from './services/storageService';
import './App.css';

function App() {
  const [appMode, setAppMode] = useState('workout'); // 'workout' | 'maternity'
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    getAppMode().then(setAppMode);
  }, []);

  const handleModeChange = (newMode) => {
    setAppMode(newMode);
  };

  return (
    <HashRouter>
      <div className={`app-container ${appMode === 'maternity' ? 'maternity-theme' : ''}`}>
        {/* Global App Header with Settings Button */}
        <header className="ruti-global-header">
          <div className="header-brand-group">
            <h1 className="header-logo">
              {appMode === 'maternity' ? (
                <>
                  <span className="logo-icon">🤰</span>
                  <span className="logo-text">RUTI <small className="mode-sub-tag">Maternity</small></span>
                </>
              ) : (
                <>
                  <span className="logo-icon">⚡</span>
                  <span className="logo-text">RUTI</span>
                </>
              )}
            </h1>
          </div>

          <div className="header-actions-group">
            <button
              className="header-icon-btn"
              onClick={() => {
                HapticService.light();
                setIsSettingsOpen(true);
              }}
              aria-label="설정 및 모드 변경"
              title="설정 및 모드 변경"
            >
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Main Content Views */}
        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={appMode === 'maternity' ? <MaternityView onOpenSettings={() => setIsSettingsOpen(true)} /> : <HomeView />}
            />
            <Route
              path="/maternity"
              element={<MaternityView onOpenSettings={() => setIsSettingsOpen(true)} />}
            />
            <Route
              path="/journal"
              element={<HomeView />}
            />
            <Route path="/workout" element={<WorkoutView />} />
            <Route path="/gallery" element={<GalleryView />} />
            <Route path="/stats" element={<StatsView />} />
          </Routes>
        </main>

        {/* 🧭 Dynamic Bottom Navigation */}
        <nav className="ruti-bottom-nav-bar">
          {appMode === 'maternity' ? (
            <>
              <NavLink
                to="/"
                className={({ isActive }) => `ruti-nav-link-item ${isActive ? 'active' : ''}`}
                onClick={() => HapticService.light()}
              >
                <Baby size={22} />
                <span>주수·케어</span>
              </NavLink>

              <NavLink
                to="/journal"
                className={({ isActive }) => `ruti-nav-link-item ${isActive ? 'active' : ''}`}
                onClick={() => HapticService.light()}
              >
                <Home size={22} />
                <span>태교다꾸</span>
              </NavLink>

              <NavLink
                to="/gallery"
                className={({ isActive }) => `ruti-nav-link-item ${isActive ? 'active' : ''}`}
                onClick={() => HapticService.light()}
              >
                <Camera size={22} />
                <span>D라인기록</span>
              </NavLink>

              <NavLink
                to="/workout"
                className={({ isActive }) => `ruti-nav-link-item ${isActive ? 'active' : ''}`}
                onClick={() => HapticService.light()}
              >
                <Heart size={22} />
                <span>스트레칭</span>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/"
                className={({ isActive }) => `ruti-nav-link-item ${isActive ? 'active' : ''}`}
                onClick={() => HapticService.light()}
              >
                <Home size={22} />
                <span>홈·다꾸</span>
              </NavLink>

              <NavLink
                to="/workout"
                className={({ isActive }) => `ruti-nav-link-item ${isActive ? 'active' : ''}`}
                onClick={() => HapticService.light()}
              >
                <Dumbbell size={22} />
                <span>타이머</span>
              </NavLink>

              <NavLink
                to="/gallery"
                className={({ isActive }) => `ruti-nav-link-item ${isActive ? 'active' : ''}`}
                onClick={() => HapticService.light()}
              >
                <Camera size={22} />
                <span>눈바디</span>
              </NavLink>

              <NavLink
                to="/stats"
                className={({ isActive }) => `ruti-nav-link-item ${isActive ? 'active' : ''}`}
                onClick={() => HapticService.light()}
              >
                <BarChart3 size={22} />
                <span>성장통계</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Global Settings & Mode Switcher Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onModeChange={handleModeChange}
        />
      </div>
    </HashRouter>
  );
}

export default App;
