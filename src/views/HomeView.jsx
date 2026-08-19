import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Plus, Camera, Sparkles } from 'lucide-react';

import { useWorkoutData } from '../hooks/useWorkoutData';
import { useDecoEngine } from '../hooks/useDecoEngine';
import { useNativeBridge } from '../hooks/useNativeBridge';
import { StoryCalendar } from '../components/calendar/StoryCalendar';
import { DecoCanvas } from '../components/deco/DecoCanvas';
import { DecoToolbar } from '../components/deco/DecoToolbar';
import { EdgeDrawer } from '../components/deco/EdgeDrawer';
import { BottomSheet } from '../components/workout/BottomSheet';
import { ShareModal } from '../components/common/ShareModal';
import { HapticService } from '../services/hapticService';
import { migrateLegacyData } from '../services/storageService';

export function HomeView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Modals & Drawers
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [editingWorkoutIdx, setEditingWorkoutIdx] = useState(null);
  const [workoutToDelete, setWorkoutToDelete] = useState(null);

  // App Initialization: Migrate Legacy Data
  useEffect(() => {
    migrateLegacyData();
  }, []);

  // Custom Hooks
  const workoutData = useWorkoutData(selectedDate);
  const decoEngine = useDecoEngine(selectedDate);

  // Capacitor Native Back Button 5단계 큐 제어
  useNativeBridge({
    isModalOpen: isShareModalOpen,
    closeModal: () => setIsShareModalOpen(false),
    isBottomSheetOpen,
    closeBottomSheet: () => setIsBottomSheetOpen(false),
    isDrawerOpen,
    closeDrawer: () => setIsDrawerOpen(false),
    activeItemId: decoEngine.activeItemId,
    deselectItem: () => decoEngine.setActiveItemId(null)
  });

  // 운동 편집 모드 진입
  const handleEditWorkout = (idx) => {
    setEditingWorkoutIdx(idx);
    setIsBottomSheetOpen(true);
  };

  // 운동 저장 핸들러
  const handleSaveWorkout = async (entry) => {
    await workoutData.saveWorkoutEntry(entry, editingWorkoutIdx);
    setEditingWorkoutIdx(null);
  };

  // 다이어리 속지 테마 목록
  const THEMES = [
    { key: 'grid-dark', label: '모눈' },
    { key: 'kraft', label: '크라프트' },
    { key: 'slate', label: '슬레이트' },
    { key: 'lined', label: '줄노트' }
  ];

  return (
    <div className="ruti-home-view">
      {/* 1. Top Brand Status Bar */}
      <header className="ruti-top-status-bar">
        <div className="top-brand-group">
          <h1 className="ruti-brand-title">RUTI</h1>
          <div className="streak-pill-badge">
            🔥 <span>14일</span> 연속
          </div>
        </div>

        <div className="top-actions-group">
          <button
            className="top-action-circle-btn"
            onClick={() => {
              HapticService.light();
              setIsShareModalOpen(true);
            }}
            title="오운완 인스타 캡처 공유"
          >
            <Camera size={18} />
          </button>
          <button
            className="top-action-circle-btn primary"
            onClick={() => {
              HapticService.light();
              setIsDrawerOpen(true);
            }}
            title="다꾸 소품 보관함"
          >
            <Sparkles size={18} />
          </button>
        </div>
      </header>

      {/* 2. Scrollable Body Content */}
      <div className="ruti-scroll-body">
        {/* 월간 캘린더 */}
        <StoryCalendar
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          workoutDates={workoutData.workoutDates}
        />

        {/* Date Heading & Theme Selector Bar */}
        <div className="date-action-meta-bar">
          <div className="selected-date-title-group">
            <h3 className="selected-date-text">
              {format(selectedDate, 'M월 d일 (E)', { locale: ko })}
            </h3>
            <span className="selected-date-tag">#오운완</span>
          </div>

          <div className="theme-pills-selector">
            {THEMES.map((th) => (
              <button
                key={th.key}
                className={`theme-pill-btn ${decoEngine.dayMeta.theme === th.key ? 'active' : ''}`}
                onClick={() => decoEngine.changeCanvasTheme(th.key)}
              >
                {th.label}
              </button>
            ))}
          </div>
        </div>

        {/* 🎨 DECO CANVAS (운동 카드 + 다꾸 스티커/사진/메모 작업 영역) */}
        <DecoCanvas
          theme={decoEngine.dayMeta.theme}
          workouts={workoutData.dailyWorkouts}
          decoItems={decoEngine.decoItems}
          activeItemId={decoEngine.activeItemId}
          onSelectItem={decoEngine.setActiveItemId}
          onUpdateItem={decoEngine.updateDecoItem}
          onDeleteItem={decoEngine.deleteDecoItem}
          onDuplicateItem={decoEngine.duplicateDecoItem}
          onFlipItem={decoEngine.flipDecoItem}
          onEditWorkout={handleEditWorkout}
          onDeleteWorkout={workoutData.deleteWorkoutEntry}
          workoutToDelete={workoutToDelete}
          setWorkoutToDelete={setWorkoutToDelete}
          onDropSticker={(content, pos) => decoEngine.addDecoItem('emoji', content, pos)}
        />
      </div>

      {/* 3. Floating Deco Toolbar (스티커 선택 시 노출) */}
      <DecoToolbar
        activeItemId={decoEngine.activeItemId}
        onBringToFront={decoEngine.bringToFront}
        onSendToBack={decoEngine.sendToBack}
        onDuplicate={decoEngine.duplicateDecoItem}
        onDelete={decoEngine.deleteDecoItem}
        onDeselect={() => decoEngine.setActiveItemId(null)}
      />

      {/* 4. FAB Button (운동 기록 추가) */}
      <button
        className="ruti-main-fab-btn"
        onClick={() => {
          HapticService.medium();
          setEditingWorkoutIdx(null);
          setIsBottomSheetOpen(true);
        }}
        aria-label="운동 기록 추가"
      >
        <Plus size={28} />
      </button>

      {/* 5. Edge Drawer (다꾸 소품 보관함) */}
      <EdgeDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onAddItem={(type, content) => decoEngine.addDecoItem(type, content)}
      />

      {/* 6. Bottom Sheet (운동 세트 빌더) */}
      <BottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => {
          setIsBottomSheetOpen(false);
          setEditingWorkoutIdx(null);
        }}
        exerciseGroups={workoutData.exerciseGroups}
        favoriteGroups={workoutData.favoriteGroups}
        favoriteExercises={workoutData.favoriteExercises}
        onToggleGroupFavorite={workoutData.toggleGroupFavorite}
        onToggleExerciseFavorite={workoutData.toggleExerciseFavorite}
        onAddGroup={workoutData.addCustomGroup}
        onAddExercise={workoutData.addCustomExercise}
        onSaveWorkout={handleSaveWorkout}
        editingWorkout={
          editingWorkoutIdx !== null ? workoutData.dailyWorkouts[editingWorkoutIdx] : null
        }
      />

      {/* 7. Share Modal (인스타 스토리 딥링크 공유) */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        selectedDate={selectedDate}
        workouts={workoutData.dailyWorkouts}
        decoItems={decoEngine.decoItems}
      />
    </div>
  );
}
