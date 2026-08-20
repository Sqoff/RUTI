import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Home, Dumbbell, Camera, BarChart3 } from 'lucide-react';
import { HomeView } from './views/HomeView';
import { WorkoutView } from './views/WorkoutView';
import { GalleryView } from './views/GalleryView';
import { StatsView } from './views/StatsView';
import { HapticService } from './services/hapticService';
import './App.css';

function App() {
  return (
    <HashRouter>
      <div className="app-container">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/workout" element={<WorkoutView />} />
            <Route path="/gallery" element={<GalleryView />} />
            <Route path="/stats" element={<StatsView />} />
          </Routes>
        </main>

        {/* 🧭 Clean Athletic Bottom Navigation */}
        <nav className="ruti-bottom-nav-bar">
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
        </nav>
      </div>
    </HashRouter>
  );
}

export default App;
