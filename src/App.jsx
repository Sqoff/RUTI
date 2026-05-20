import { useState, useEffect, useRef } from 'react'
import localforage from 'localforage'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Home, Dumbbell, Camera, BarChart3, Settings, Plus, X, Check, ChevronLeft, Star } from 'lucide-react'
import './App.css'

function App() {
  const mainContentRef = useRef(null);
  const isDown = useRef(false);
  const startY = useRef(0);
  const scrollTop = useRef(0);

  const onMouseDown = (e) => {
    if (e.target.closest('[draggable="true"]') || e.target.closest('.edge-panel')) return;
    isDown.current = true;
    startY.current = e.pageY - mainContentRef.current.offsetTop;
    scrollTop.current = mainContentRef.current.scrollTop;
    mainContentRef.current.style.cursor = 'grabbing';
  };
  const onMouseLeave = () => {
    isDown.current = false;
    if (mainContentRef.current) mainContentRef.current.style.cursor = 'grab';
  };
  const onMouseUp = () => {
    isDown.current = false;
    if (mainContentRef.current) mainContentRef.current.style.cursor = 'grab';
  };
  const onMouseMove = (e) => {
    if (!isDown.current) return;
    e.preventDefault();
    const y = e.pageY - mainContentRef.current.offsetTop;
    const walk = (y - startY.current) * 1.5;
    mainContentRef.current.scrollTop = scrollTop.current - walk;
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        <main 
          className="main-content" 
          ref={mainContentRef}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
        >
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/workout" element={<WorkoutView />} />
            <Route path="/gallery" element={<GalleryView />} />
            <Route path="/stats" element={<StatsView />} />
          </Routes>
        </main>
        
        <nav className="bottom-nav">
          <Link to="/" className="nav-item">
            <Home size={24} />
            <span>홈</span>
          </Link>
          <Link to="/workout" className="nav-item">
            <Dumbbell size={24} />
            <span>운동</span>
          </Link>
          <Link to="/gallery" className="nav-item">
            <Camera size={24} />
            <span>눈바디</span>
          </Link>
          <Link to="/stats" className="nav-item">
            <BarChart3 size={24} />
            <span>통계</span>
          </Link>
        </nav>
      </div>
    </BrowserRouter>
  )
}

import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';

const InteractiveSticker = ({ sticker, updateSticker, deleteSticker }) => {
  const [data, setData] = useState(sticker);
  const dataRef = useRef(sticker);
  const [isActive, setIsActive] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const pressTimer = useRef(null);

  useEffect(() => { 
    setData(sticker); 
    dataRef.current = sticker;
  }, [sticker]);

  const handlePointerDown = (e, action) => {
    e.stopPropagation();
    setIsActive(true);
    
    const startX = e.clientX || (e.touches && e.touches[0].clientX);
    const startY = e.clientY || (e.touches && e.touches[0].clientY);
    const startData = { ...data };
    const rect = e.target.closest('.interactive-sticker').getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    if (action === 'move') {
      pressTimer.current = setTimeout(() => setShowDelete(true), 600);
    }

    const onMove = (moveEvent) => {
      const cx = moveEvent.clientX || (moveEvent.touches && moveEvent.touches[0].clientX);
      const cy = moveEvent.clientY || (moveEvent.touches && moveEvent.touches[0].clientY);
      
      if (Math.abs(cx - startX) > 5 || Math.abs(cy - startY) > 5) {
        clearTimeout(pressTimer.current);
      }

      let newData = { ...startData };
      if (action === 'move') {
        newData.x = startData.x + (cx - startX);
        newData.y = startData.y + (cy - startY);
      } else if (action === 'rotate-scale') {
        const angle = Math.atan2(cy - centerY, cx - centerX) * 180 / Math.PI;
        const startAngle = Math.atan2(startY - centerY, startX - centerX) * 180 / Math.PI;
        const rotationDiff = angle - startAngle;
        
        const startDist = Math.hypot(startX - centerX, startY - centerY);
        const currentDist = Math.hypot(cx - centerX, cy - centerY);
        const scaleDiff = currentDist / startDist;

        newData.rotation = startData.rotation + rotationDiff;
        newData.scale = Math.max(0.5, startData.scale * scaleDiff);
      }
      
      setData(newData);
      dataRef.current = newData; // onEnd를 위해 동기적으로 업데이트
    };

    const onEnd = () => {
      clearTimeout(pressTimer.current);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      
      // 항상 최신 상태의 data를 저장하도록 ref 사용
      updateSticker(dataRef.current);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  };

  useEffect(() => {
    const clickOutside = () => {
      setIsActive(false);
      setShowDelete(false);
    };
    if (isActive) window.addEventListener('click', clickOutside);
    return () => window.removeEventListener('click', clickOutside);
  }, [isActive]);

  return (
    <div 
      className={`interactive-sticker ${isActive ? 'active' : ''}`}
      style={{ transform: `translate(${data.x}px, ${data.y}px) rotate(${data.rotation}deg) scale(${data.scale})` }}
      onMouseDown={(e) => handlePointerDown(e, 'move')}
      onTouchStart={(e) => handlePointerDown(e, 'move')}
      onClick={(e) => { e.stopPropagation(); setIsActive(true); }}
    >
      <div className="sticker-content">{data.emoji}</div>
      {isActive && !showDelete && (
        <div 
          className="sticker-control"
          onMouseDown={(e) => handlePointerDown(e, 'rotate-scale')}
          onTouchStart={(e) => handlePointerDown(e, 'rotate-scale')}
        >
          ⤡
        </div>
      )}
      {showDelete && (
        <div 
          className="sticker-control delete-handle"
          onMouseDown={(e) => { e.stopPropagation(); deleteSticker(data.id); }}
          onTouchStart={(e) => { e.stopPropagation(); deleteSticker(data.id); }}
        >
          <X size={16} />
        </div>
      )}
    </div>
  );
};

function HomeView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  
  // DB & List States
  const [dailyWorkouts, setDailyWorkouts] = useState([]);
  const [workoutDates, setWorkoutDates] = useState([]); // format: 'workouts_yyyy-MM-dd'
  const [workoutToDelete, setWorkoutToDelete] = useState(null);
  const [editingWorkoutIdx, setEditingWorkoutIdx] = useState(null);
  const workoutPressTimer = useRef(null);

  // Edge Panel & Sticker States
  const [dailyStickers, setDailyStickers] = useState([]);
  const [isEdgePanelOpen, setIsEdgePanelOpen] = useState(false);
  const stickerList = ['🔥', '💪', '💦', '🌟', '💀', '🎯'];

  // Touch drag state (for iOS Safari which doesn't support HTML5 DnD)
  const [touchDragSticker, setTouchDragSticker] = useState(null);
  const [touchDragPos, setTouchDragPos] = useState({ x: 0, y: 0 });
  const selectedDateRef = useRef(selectedDate);
  useEffect(() => { selectedDateRef.current = selectedDate; }, [selectedDate]);

  // Exercise Input States
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState([]);
  const [isEmptyBarActive, setIsEmptyBarActive] = useState(false);

  const DEFAULT_EXERCISE_GROUPS = {
    '상체': ['벤치프레스', '오버헤드 프레스', '바벨로우', '랫풀다운'],
    '하체': ['스쿼트', '데드리프트', '레그프레스'],
  };
  const [exerciseGroups, setExerciseGroups] = useState(DEFAULT_EXERCISE_GROUPS);
  const [exerciseGroup, setExerciseGroup] = useState(null);

  // Add modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addType, setAddType] = useState('exercise'); // 'exercise' | 'group'
  const [addName, setAddName] = useState('');

  // Favorites
  const [favoriteGroups, setFavoriteGroups] = useState([]);
  const [favoriteExercises, setFavoriteExercises] = useState([]); // composite keys 'group:exercise'

  // Long-press timers
  const groupPressTimer = useRef(null);
  const exercisePressTimer = useRef(null);
  const groupLongPressedRef = useRef(false);
  const exerciseLongPressedRef = useRef(false);

  // Inline delete affordance: 'group:{name}' or 'exercise:{name}'
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (!deleteTarget) return;
    const handler = (e) => {
      if (!e.target.closest('.row-wrapper')) {
        setDeleteTarget(null);
      }
    };
    const id = setTimeout(() => window.addEventListener('click', handler), 0);
    return () => {
      clearTimeout(id);
      window.removeEventListener('click', handler);
    };
  }, [deleteTarget]);

  useEffect(() => {
    (async () => {
      const stored = await localforage.getItem('exerciseGroups');
      if (stored && typeof stored === 'object' && Object.keys(stored).length > 0) {
        setExerciseGroups(stored);
      } else {
        await localforage.setItem('exerciseGroups', DEFAULT_EXERCISE_GROUPS);
      }
      const fav = await localforage.getItem('favorites');
      if (fav && typeof fav === 'object') {
        setFavoriteGroups(Array.isArray(fav.groups) ? fav.groups : []);
        setFavoriteExercises(Array.isArray(fav.exercises) ? fav.exercises : []);
      }
    })();
  }, []);

  const saveFavorites = async (groups, exercises) => {
    setFavoriteGroups(groups);
    setFavoriteExercises(exercises);
    await localforage.setItem('favorites', { groups, exercises });
  };

  const toggleGroupFavorite = async (g) => {
    const next = favoriteGroups.includes(g)
      ? favoriteGroups.filter(x => x !== g)
      : [...favoriteGroups, g];
    await saveFavorites(next, favoriteExercises);
  };

  const toggleExerciseFavorite = async (ex) => {
    if (!exerciseGroup) return;
    const key = `${exerciseGroup}:${ex}`;
    const next = favoriteExercises.includes(key)
      ? favoriteExercises.filter(x => x !== key)
      : [...favoriteExercises, key];
    await saveFavorites(favoriteGroups, next);
  };

  const sortedGroupKeys = () => {
    const keys = Object.keys(exerciseGroups);
    const favs = keys.filter(k => favoriteGroups.includes(k));
    const rest = keys.filter(k => !favoriteGroups.includes(k));
    return [...favs, ...rest];
  };

  const sortedExercises = (g) => {
    const list = exerciseGroups[g] || [];
    const favs = list.filter(ex => favoriteExercises.includes(`${g}:${ex}`));
    const rest = list.filter(ex => !favoriteExercises.includes(`${g}:${ex}`));
    return [...favs, ...rest];
  };

  // Long-press handlers — reveal slide-in delete button
  const startGroupPress = (g) => {
    groupLongPressedRef.current = false;
    clearTimeout(groupPressTimer.current);
    groupPressTimer.current = setTimeout(() => {
      groupLongPressedRef.current = true;
      setDeleteTarget(`group:${g}`);
    }, 600);
  };
  const clearGroupPress = () => clearTimeout(groupPressTimer.current);

  const startExercisePress = (ex) => {
    exerciseLongPressedRef.current = false;
    clearTimeout(exercisePressTimer.current);
    exercisePressTimer.current = setTimeout(() => {
      exerciseLongPressedRef.current = true;
      setDeleteTarget(`exercise:${ex}`);
    }, 600);
  };
  const clearExercisePress = () => clearTimeout(exercisePressTimer.current);

  const saveExerciseGroups = async (next) => {
    setExerciseGroups(next);
    await localforage.setItem('exerciseGroups', next);
  };

  const openAddModal = (type) => {
    setAddType(type);
    setAddName('');
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async () => {
    const name = addName.trim();
    if (!name) return;
    if (addType === 'group') {
      if (exerciseGroups[name]) { alert('이미 존재하는 부위입니다.'); return; }
      await saveExerciseGroups({ ...exerciseGroups, [name]: [] });
    } else {
      if (!exerciseGroup) return;
      const list = exerciseGroups[exerciseGroup] || [];
      if (list.includes(name)) { alert('이미 존재하는 운동입니다.'); return; }
      await saveExerciseGroups({ ...exerciseGroups, [exerciseGroup]: [...list, name] });
    }
    setAddName('');
    setIsAddModalOpen(false);
  };

  const handleDeleteGroup = async (g) => {
    const next = { ...exerciseGroups };
    delete next[g];
    await saveExerciseGroups(next);
    const nextFavGroups = favoriteGroups.filter(x => x !== g);
    const nextFavEx = favoriteExercises.filter(x => !x.startsWith(`${g}:`));
    if (nextFavGroups.length !== favoriteGroups.length || nextFavEx.length !== favoriteExercises.length) {
      await saveFavorites(nextFavGroups, nextFavEx);
    }
    setDeleteTarget(null);
  };

  const handleDeleteExerciseFromGroup = async (ex) => {
    if (!exerciseGroup) return;
    const list = (exerciseGroups[exerciseGroup] || []).filter(x => x !== ex);
    await saveExerciseGroups({ ...exerciseGroups, [exerciseGroup]: list });
    const key = `${exerciseGroup}:${ex}`;
    if (favoriteExercises.includes(key)) {
      await saveFavorites(favoriteGroups, favoriteExercises.filter(x => x !== key));
    }
    setDeleteTarget(null);
  };

  useEffect(() => {
    fetchWorkoutDates();
  }, []);

  useEffect(() => {
    fetchDailyWorkouts();
  }, [selectedDate]);

  const fetchWorkoutDates = async () => {
    try {
      const keys = await localforage.keys();
      const wKeys = keys.filter(k => k.startsWith('workouts_'));
      const nonEmptyKeys = [];
      for (const k of wKeys) {
        const data = await localforage.getItem(k);
        if (Array.isArray(data) && data.length > 0) {
          nonEmptyKeys.push(k);
        } else {
          await localforage.removeItem(k);
        }
      }
      setWorkoutDates(nonEmptyKeys);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDailyWorkouts = async () => {
    const dateKey = `workouts_${format(selectedDate, 'yyyy-MM-dd')}`;
    const stickerKey = `stickers_${format(selectedDate, 'yyyy-MM-dd')}`;
    
    let data = await localforage.getItem(dateKey) || [];
    let stickersData = await localforage.getItem(stickerKey) || [];
    
    // 레거시 스티커 마이그레이션 (DB 구조 동기화)
    let needsWorkoutSave = false;
    let needsStickerSave = false;
    
    data.forEach((workout, wIdx) => {
      if (workout.stickers && workout.stickers.length > 0) {
        workout.stickers.forEach(st => {
          let stObj = typeof st === 'string' 
            ? { id: Date.now().toString() + Math.random().toString().substring(2,6), emoji: st, x: 20, y: 50 + wIdx * 100, scale: 1, rotation: 0 }
            : { ...st, y: (st.y || 0) + 50 + wIdx * 100 };
          stickersData.push(stObj);
        });
        delete workout.stickers;
        needsWorkoutSave = true;
        needsStickerSave = true;
      }
    });

    if (needsWorkoutSave) await localforage.setItem(dateKey, data);
    if (needsStickerSave) await localforage.setItem(stickerKey, stickersData);

    setDailyWorkouts(data);
    setDailyStickers(stickersData);
  };

  const saveWorkout = async () => {
    if (sets.length > 0) {
      const dateKey = `workouts_${format(selectedDate, 'yyyy-MM-dd')}`;
      let currentWorkouts = await localforage.getItem(dateKey) || [];

      const entry = { exercise: selectedExercise, sets: [...sets] };

      if (editingWorkoutIdx !== null && currentWorkouts[editingWorkoutIdx]) {
        currentWorkouts[editingWorkoutIdx] = entry;
      } else {
        currentWorkouts.push(entry);
      }

      await localforage.setItem(dateKey, currentWorkouts);

      if (!workoutDates.includes(dateKey)) {
        setWorkoutDates([...workoutDates, dateKey]);
      }
      fetchDailyWorkouts();
    }
    closeSheet();
  };

  const handleEditWorkout = (idx) => {
    const w = dailyWorkouts[idx];
    if (!w) return;
    setEditingWorkoutIdx(idx);
    setSelectedExercise(w.exercise);
    setSets(w.sets.map(s => ({ ...s })));
    setWeight('');
    setReps('');
    setIsEmptyBarActive(false);
    setWorkoutToDelete(null);
    setIsBottomSheetOpen(true);
  };

  const removeSetAt = (idx) => {
    setSets(prev => prev.filter((_, i) => i !== idx));
  };

  // Sticker Drag & Drop Handlers
  const handleDragStart = (e, sticker) => {
    e.dataTransfer.setData('text/plain', sticker);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Touch-based drag for iOS Safari
  const dropStickerAt = async (emoji, clientX, clientY) => {
    const el = document.elementFromPoint(clientX, clientY);
    const workoutArea = el?.closest('.workout-area');
    if (!workoutArea) return;
    const rect = workoutArea.getBoundingClientRect();
    const dropX = clientX - rect.left;
    const dropY = clientY - rect.top;

    const newSticker = {
      id: Date.now().toString() + Math.random().toString().substring(2, 6),
      emoji,
      x: dropX - 25,
      y: dropY - 25,
      scale: 1,
      rotation: Math.floor(Math.random() * 30) - 15
    };

    const dateKey = `stickers_${format(selectedDateRef.current, 'yyyy-MM-dd')}`;
    let currentStickers = await localforage.getItem(dateKey) || [];
    currentStickers.push(newSticker);
    await localforage.setItem(dateKey, currentStickers);
    fetchDailyWorkouts();
  };

  const handleStickerTouchStart = (e, sticker) => {
    const t = e.touches[0];
    setTouchDragSticker(sticker);
    setTouchDragPos({ x: t.clientX, y: t.clientY });
  };

  useEffect(() => {
    if (!touchDragSticker) return;

    const onMove = (e) => {
      if (e.cancelable) e.preventDefault();
      const t = e.touches[0];
      setTouchDragPos({ x: t.clientX, y: t.clientY });
    };
    const onEnd = (e) => {
      const t = e.changedTouches[0];
      const emoji = touchDragSticker;
      setTouchDragSticker(null);
      if (t) dropStickerAt(emoji, t.clientX, t.clientY);
    };
    const onCancel = () => setTouchDragSticker(null);

    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onCancel);
    return () => {
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onCancel);
    };
  }, [touchDragSticker]);

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDropSticker = async (e) => {
    e.preventDefault();
    const stickerEmoji = e.dataTransfer.getData('text/plain');
    if (!stickerEmoji) return;

    const containerRect = e.currentTarget.getBoundingClientRect();
    const dropX = e.clientX - containerRect.left;
    const dropY = e.clientY - containerRect.top;

    const newSticker = {
      id: Date.now().toString() + Math.random().toString().substring(2, 6),
      emoji: stickerEmoji,
      x: dropX - 25, // Center offset roughly
      y: dropY - 25,
      scale: 1,
      rotation: Math.floor(Math.random() * 30) - 15 // Slight random rotation
    };

    const dateKey = `stickers_${format(selectedDate, 'yyyy-MM-dd')}`;
    let currentStickers = await localforage.getItem(dateKey) || [];
    currentStickers.push(newSticker);
    await localforage.setItem(dateKey, currentStickers);
    fetchDailyWorkouts();
  };

  const updateStickerData = async (updatedSticker) => {
    const dateKey = `stickers_${format(selectedDate, 'yyyy-MM-dd')}`;
    let currentStickers = await localforage.getItem(dateKey) || [];
    const sIdx = currentStickers.findIndex(s => s.id === updatedSticker.id);
    if (sIdx > -1) {
      currentStickers[sIdx] = updatedSticker;
      await localforage.setItem(dateKey, currentStickers);
      fetchDailyWorkouts(); // 즉시 동기화하여 최신 상태 유지
    }
  };

  const handleDeleteSticker = async (stickerId) => {
    const dateKey = `stickers_${format(selectedDate, 'yyyy-MM-dd')}`;
    let currentStickers = await localforage.getItem(dateKey) || [];
    currentStickers = currentStickers.filter(s => s.id !== stickerId);
    await localforage.setItem(dateKey, currentStickers);
    fetchDailyWorkouts();
  };

  const handleWorkoutPointerDown = (idx) => {
    workoutPressTimer.current = setTimeout(() => {
      setWorkoutToDelete(idx);
    }, 600);
  };
  const clearWorkoutPress = () => clearTimeout(workoutPressTimer.current);

  const handleDeleteWorkout = async (idx) => {
    const dateKey = `workouts_${format(selectedDate, 'yyyy-MM-dd')}`;
    let currentWorkouts = await localforage.getItem(dateKey) || [];
    currentWorkouts.splice(idx, 1);
    if (currentWorkouts.length === 0) {
      await localforage.removeItem(dateKey);
      setWorkoutDates(prev => prev.filter(k => k !== dateKey));
    } else {
      await localforage.setItem(dateKey, currentWorkouts);
    }
    setWorkoutToDelete(null);
    fetchDailyWorkouts();
  };

  const closeSheet = () => {
    setIsBottomSheetOpen(false);
    setTimeout(() => {
      setSelectedExercise(null);
      setSets([]);
      setWeight('');
      setReps('');
      setIsEmptyBarActive(false);
      setEditingWorkoutIdx(null);
      setExerciseGroup(null);
    }, 300);
  };

  const addSet = () => {
    if (reps) {
      if (isEmptyBarActive) {
        setSets([...sets, { weight: '빈봉', reps: reps, isEmptyBar: true }]);
      } else if (weight) {
        setSets([...sets, { weight: weight, reps: reps, isEmptyBar: false }]);
      }
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const onDateClick = (day) => setSelectedDate(day);

  // Generate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStarts: 0 }); // Sunday start
  const endDate = endOfWeek(monthEnd, { weekStarts: 0 });

  const days = [];
  let day = startDate;
  let formattedDate = '';

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, 'd');
      const cloneDay = day;
      
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isToday = isSameDay(day, new Date());
      const isSelected = isSameDay(day, selectedDate);

      let className = 'calendar-cell';
      if (!isCurrentMonth) className += ' disabled';
      else if (isSelected) className += ' selected';
      else if (isToday) className += ' today';

      days.push(
        <div
          className={className}
          key={day.toString()}
          onClick={() => onDateClick(cloneDay)}
        >
          <span className="date-number">{formattedDate}</span>
          {workoutDates.includes(`workouts_${format(cloneDay, 'yyyy-MM-dd')}`) && <div className="event-dot"></div>}
        </div>
      );
      day = addDays(day, 1);
    }
  }

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="view-container">
      <header className="header">
        <div className="calendar-header">
          <h1>{format(currentDate, 'yyyy년 M월', { locale: ko })}</h1>
          <div className="calendar-nav">
            <button className="icon-btn" onClick={prevMonth}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button className="icon-btn" onClick={nextMonth}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
        <Settings size={24} className="icon-btn" />
      </header>

      <div className="calendar">
        <div className="calendar-weekdays">
          {weekDays.map((d, i) => (
            <div className="weekday" key={i}>{d}</div>
          ))}
        </div>
        <div className="calendar-grid">
          {days}
        </div>
      </div>

      <div className="selected-date-info">
        <h3>{format(selectedDate, 'M월 d일 (E)', { locale: ko })}</h3>
        <div
          className="workout-area"
          onDragOver={handleDragOver}
          onDrop={handleDropSticker}
        >
          {dailyStickers && dailyStickers.length > 0 && (
            <div className="attached-stickers-layer">
              {dailyStickers.map((st, i) => (
                <InteractiveSticker
                  key={st.id || i}
                  sticker={st}
                  updateSticker={updateStickerData}
                  deleteSticker={handleDeleteSticker}
                />
              ))}
            </div>
          )}
          {dailyWorkouts.length === 0 ? (
            <div className="card empty-card">
              <p>등록된 운동 일지가 없습니다.</p>
            </div>
          ) : (
            <div className="daily-workouts-list">
              {dailyWorkouts.map((workout, idx) => (
                <div
                  key={idx}
                  className="card workout-log-card"
                  onPointerDown={() => handleWorkoutPointerDown(idx)}
                  onPointerMove={clearWorkoutPress}
                  onPointerUp={clearWorkoutPress}
                  onPointerCancel={clearWorkoutPress}
                >
                  {workoutToDelete === idx && (
                    <div className="delete-overlay">
                      <button className="primary-btn edit-btn" onClick={() => handleEditWorkout(idx)}>수정</button>
                      <button className="primary-btn delete-btn" onClick={() => handleDeleteWorkout(idx)}>삭제</button>
                      <button className="secondary-btn" onClick={() => setWorkoutToDelete(null)}>취소</button>
                    </div>
                  )}
                  <h4 className="workout-log-title">
                    {workout.exercise}
                    {workout.sets.some(s => s.isEmptyBar) && <span className="empty-bar-badge">빈봉</span>}
                  </h4>
                  <div className="workout-log-sets">
                    {workout.sets.map((set, sIdx) => (
                      <div key={sIdx} className="workout-log-set-row">
                        <span className="log-set-num">{sIdx + 1}세트</span>
                        <span className="log-set-info">
                          {set.isEmptyBar ? `빈봉 x ${set.reps}회` : `${set.weight}kg x ${set.reps}회`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <button className="fab" onClick={() => setIsBottomSheetOpen(true)}>
        <Plus size={32} />
      </button>

      {/* Edge Panel for Stickers */}
      <div className={`edge-panel ${isEdgePanelOpen ? 'open' : ''}`}>
        <div className="edge-handle" onClick={() => setIsEdgePanelOpen(!isEdgePanelOpen)}>
          <span className="handle-bar"></span>
        </div>
        <div className="sticker-container">
          {stickerList.map((sticker, idx) => (
            <div
              key={idx}
              className="sticker-item"
              draggable
              onDragStart={(e) => handleDragStart(e, sticker)}
              onTouchStart={(e) => handleStickerTouchStart(e, sticker)}
            >
              {sticker}
            </div>
          ))}
        </div>
      </div>

      {touchDragSticker && (
        <div
          className="sticker-drag-ghost"
          style={{ left: touchDragPos.x, top: touchDragPos.y }}
        >
          {touchDragSticker}
        </div>
      )}

      {/* Bottom Sheet Overlay & Container */}
      <div className={`bottom-sheet-overlay ${isBottomSheetOpen ? 'open' : ''}`} onClick={closeSheet}></div>
      <div className={`bottom-sheet ${isBottomSheetOpen ? 'open' : ''}`}>
        <div className="sheet-header">
          {(!selectedExercise && exerciseGroup) ? (
            <button
              className="header-back-btn"
              onClick={() => setExerciseGroup(null)}
              aria-label="뒤로"
            >
              <ChevronLeft size={22} />
              <span>{exerciseGroup}</span>
            </button>
          ) : (
            <div className="sheet-header-spacer" />
          )}
          <h2
            className={!selectedExercise ? 'sheet-title-clickable' : ''}
            onClick={!selectedExercise ? () => openAddModal(exerciseGroup ? 'exercise' : 'group') : undefined}
          >
            {selectedExercise
              ? `${selectedExercise}${editingWorkoutIdx !== null ? ' 수정' : ''}`
              : (exerciseGroup ? '운동 선택' : '부위 선택')}
          </h2>
          <button className="icon-btn" onClick={closeSheet}><X size={24} /></button>
        </div>
        
        <div className="sheet-content">
          {!selectedExercise ? (
            !exerciseGroup ? (
              <>
                <div className="exercise-group-tabs">
                  {sortedGroupKeys().map(g => (
                    <div key={g} className="row-wrapper">
                      <button
                        className="group-tab"
                        onPointerDown={() => startGroupPress(g)}
                        onPointerUp={clearGroupPress}
                        onPointerMove={clearGroupPress}
                        onPointerLeave={clearGroupPress}
                        onPointerCancel={clearGroupPress}
                        onClick={() => {
                          if (groupLongPressedRef.current) { groupLongPressedRef.current = false; return; }
                          if (deleteTarget) { setDeleteTarget(null); return; }
                          setExerciseGroup(g);
                        }}
                      >
                        <span>{g}</span>
                        <span
                          className={`favorite-star ${favoriteGroups.includes(g) ? 'active' : ''}`}
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => { e.stopPropagation(); toggleGroupFavorite(g); }}
                        >
                          <Star size={20} fill={favoriteGroups.includes(g) ? 'currentColor' : 'none'} />
                        </span>
                      </button>
                      {deleteTarget === `group:${g}` && (
                        <button
                          className="row-delete-action"
                          onClick={(e) => { e.stopPropagation(); handleDeleteGroup(g); }}
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <ul className="exercise-list">
                  {sortedExercises(exerciseGroup).map((ex, idx) => (
                    <li key={idx} className="row-wrapper exercise-row-wrapper">
                      <div
                        className="exercise-item"
                        onPointerDown={() => startExercisePress(ex)}
                        onPointerUp={clearExercisePress}
                        onPointerMove={clearExercisePress}
                        onPointerLeave={clearExercisePress}
                        onPointerCancel={clearExercisePress}
                        onClick={() => {
                          if (exerciseLongPressedRef.current) { exerciseLongPressedRef.current = false; return; }
                          if (deleteTarget) { setDeleteTarget(null); return; }
                          setSelectedExercise(ex);
                        }}
                      >
                        <span>{ex}</span>
                        <span
                          className={`favorite-star ${favoriteExercises.includes(`${exerciseGroup}:${ex}`) ? 'active' : ''}`}
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => { e.stopPropagation(); toggleExerciseFavorite(ex); }}
                        >
                          <Star size={20} fill={favoriteExercises.includes(`${exerciseGroup}:${ex}`) ? 'currentColor' : 'none'} />
                        </span>
                      </div>
                      {deleteTarget === `exercise:${ex}` && (
                        <button
                          className="row-delete-action"
                          onClick={(e) => { e.stopPropagation(); handleDeleteExerciseFromGroup(ex); }}
                        >
                          삭제
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )
          ) : (
            <div className="exercise-input-view">
              <div className="recorded-sets">
                {sets.length === 0 ? (
                  <p className="no-sets">아직 기록된 세트가 없습니다.</p>
                ) : (
                  sets.map((set, idx) => (
                    <div key={idx} className="set-row">
                      <span className="set-num">{idx + 1}세트</span>
                      <span className="set-info">
                        {set.isEmptyBar ? `빈봉 x ${set.reps}회` : `${set.weight}kg x ${set.reps}회`}
                      </span>
                      <button className="set-remove-btn" onClick={() => removeSetAt(idx)} aria-label="세트 삭제">
                        <X size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="input-controls">
                <div className="input-group">
                  <div className={`input-field ${isEmptyBarActive ? 'disabled' : ''}`}>
                    <input type="number" placeholder="무게" value={weight} onChange={(e) => setWeight(e.target.value)} disabled={isEmptyBarActive} />
                    <span>kg</span>
                  </div>
                  <div className="input-field">
                    <input type="number" placeholder="횟수" value={reps} onChange={(e) => setReps(e.target.value)} />
                    <span>회</span>
                  </div>
                </div>
                
                <div className="action-buttons">
                  <button className={`secondary-btn ${isEmptyBarActive ? 'active' : ''}`} onClick={() => setIsEmptyBarActive(!isEmptyBarActive)}>
                    <Check size={18} className="check-icon" /> 빈봉
                  </button>
                  <button className="primary-btn add-set-btn" onClick={addSet}>세트 추가</button>
                </div>
              </div>
              
              <button className="primary-btn complete-btn" onClick={saveWorkout}>{editingWorkoutIdx !== null ? '수정 완료' : '기록 완료'}</button>
            </div>
          )}
        </div>
      </div>

      {isAddModalOpen && (
        <div className="add-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="add-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{addType === 'group' ? '새 부위 추가' : `'${exerciseGroup}'에 운동 추가`}</h3>
            <input
              className="add-input"
              type="text"
              placeholder={addType === 'group' ? '부위 이름' : '운동 이름'}
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubmit(); }}
              autoFocus
            />
            <div className="add-modal-actions">
              <button className="secondary-btn" onClick={() => setIsAddModalOpen(false)}>취소</button>
              <button className="primary-btn" onClick={handleAddSubmit}>추가</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function WorkoutView() {
  return <div className="view-container"><h2>운동 일지 작성 (준비중)</h2></div>
}

function GalleryView() {
  return <div className="view-container"><h2>눈바디 갤러리 (준비중)</h2></div>
}

function StatsView() {
  return <div className="view-container"><h2>성장 통계 (준비중)</h2></div>
}

export default App
