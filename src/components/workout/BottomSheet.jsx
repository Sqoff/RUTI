import { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, Star, Plus, Check, Trash2 } from 'lucide-react';
import { HapticService } from '../../services/hapticService';

export function BottomSheet({
  isOpen,
  onClose,
  exerciseGroups = {},
  favoriteGroups = [],
  favoriteExercises = [],
  onToggleGroupFavorite,
  onToggleExerciseFavorite,
  onAddGroup,
  onAddExercise,
  onSaveWorkout,
  editingWorkout = null
}) {
  // Navigation: null (부위 선택) -> '상체' (종목 선택) -> { group: '상체', exercise: '벤치프레스' } (세트 입력)
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Set Inputs
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [isEmptyBar, setIsEmptyBar] = useState(false);
  const [sets, setSets] = useState([]);

  // Add Item Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addType, setAddType] = useState('group'); // 'group' | 'exercise'
  const [addName, setAddName] = useState('');

  // Long press timer for delete
  const pressTimer = useRef(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // 수정 모드 초기화
  useEffect(() => {
    if (editingWorkout) {
      setSelectedExercise(editingWorkout.exercise);
      setSets(editingWorkout.sets ? editingWorkout.sets.map((s) => ({ ...s })) : []);
    } else {
      setSelectedGroup(null);
      setSelectedExercise(null);
      setSets([]);
      setWeight('');
      setReps('');
      setIsEmptyBar(false);
    }
  }, [editingWorkout, isOpen]);

  // 세트 추가
  const handleAddSet = () => {
    if (!reps) return;
    HapticService.medium();

    if (isEmptyBar) {
      setSets([...sets, { weight: '빈봉', reps, isEmptyBar: true }]);
    } else if (weight) {
      setSets([...sets, { weight, reps, isEmptyBar: false }]);
    }
    setWeight('');
    setReps('');
  };

  const handleRemoveSet = (idx) => {
    HapticService.light();
    setSets(sets.filter((_, i) => i !== idx));
  };

  const handleComplete = () => {
    if (sets.length === 0) return;
    HapticService.heavy();
    onSaveWorkout({
      exercise: selectedExercise,
      sets
    });
    onClose();
  };

  const handleAddSubmit = async () => {
    const trimmed = addName.trim();
    if (!trimmed) return;

    if (addType === 'group') {
      await onAddGroup(trimmed);
    } else if (selectedGroup) {
      await onAddExercise(selectedGroup, trimmed);
    }
    setAddName('');
    setIsAddModalOpen(false);
  };

  // 정렬된 그룹 및 운동 목록 (즐겨찾기 우선)
  const sortedGroups = () => {
    const keys = Object.keys(exerciseGroups);
    const favs = keys.filter((k) => favoriteGroups.includes(k));
    const rest = keys.filter((k) => !favoriteGroups.includes(k));
    return [...favs, ...rest];
  };

  const sortedExercises = (g) => {
    const list = exerciseGroups[g] || [];
    const favs = list.filter((ex) => favoriteExercises.includes(`${g}:${ex}`));
    const rest = list.filter((ex) => !favoriteExercises.includes(`${g}:${ex}`));
    return [...favs, ...rest];
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="bottom-sheet-overlay show" onClick={onClose} />
      <div className="bottom-sheet-modal show">
        {/* Header */}
        <div className="sheet-header-bar">
          {selectedExercise ? (
            <button
              className="sheet-back-btn"
              onClick={() => setSelectedExercise(null)}
            >
              <ChevronLeft size={20} />
              <span>{selectedGroup || '종목 선택'}</span>
            </button>
          ) : selectedGroup ? (
            <button
              className="sheet-back-btn"
              onClick={() => setSelectedGroup(null)}
            >
              <ChevronLeft size={20} />
              <span>부위 선택</span>
            </button>
          ) : (
            <div className="sheet-spacer" />
          )}

          <h3 className="sheet-title-text">
            {selectedExercise
              ? `${selectedExercise}${editingWorkout ? ' (수정)' : ''}`
              : selectedGroup
              ? `${selectedGroup} 운동 선택`
              : '운동 부위 선택'}
          </h3>

          <button className="sheet-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Sheet Body */}
        <div className="sheet-body-content">
          {/* 1단계: 부위 선택 */}
          {!selectedGroup && !selectedExercise && (
            <div className="group-selection-grid">
              {sortedGroups().map((group) => {
                const isFav = favoriteGroups.includes(group);
                return (
                  <div
                    key={group}
                    className="selection-card-item"
                    onClick={() => {
                      HapticService.light();
                      setSelectedGroup(group);
                    }}
                  >
                    <span className="selection-item-name">{group}</span>
                    <button
                      className={`favorite-star-btn ${isFav ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleGroupFavorite(group);
                      }}
                    >
                      <Star size={18} fill={isFav ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                );
              })}

              <button
                className="add-new-category-btn"
                onClick={() => {
                  setAddType('group');
                  setAddName('');
                  setIsAddModalOpen(true);
                }}
              >
                <Plus size={18} />
                <span>새 부위 추가</span>
              </button>
            </div>
          )}

          {/* 2단계: 운동 종목 선택 */}
          {selectedGroup && !selectedExercise && (
            <div className="exercise-selection-list">
              {sortedExercises(selectedGroup).map((ex) => {
                const isFav = favoriteExercises.includes(`${selectedGroup}:${ex}`);
                return (
                  <div
                    key={ex}
                    className="selection-card-item"
                    onClick={() => {
                      HapticService.light();
                      setSelectedExercise(ex);
                    }}
                  >
                    <span className="selection-item-name">{ex}</span>
                    <button
                      className={`favorite-star-btn ${isFav ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleExerciseFavorite(selectedGroup, ex);
                      }}
                    >
                      <Star size={18} fill={isFav ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                );
              })}

              <button
                className="add-new-category-btn"
                onClick={() => {
                  setAddType('exercise');
                  setAddName('');
                  setIsAddModalOpen(true);
                }}
              >
                <Plus size={18} />
                <span>'{selectedGroup}'에 운동 추가</span>
              </button>
            </div>
          )}

          {/* 3단계: 세트 입력 및 빌더 */}
          {selectedExercise && (
            <div className="set-builder-view">
              {/* Accumulated Sets List */}
              <div className="recorded-sets-container">
                {sets.length === 0 ? (
                  <p className="no-sets-placeholder">아직 기록된 세트가 없습니다</p>
                ) : (
                  sets.map((st, idx) => (
                    <div key={idx} className="builder-set-row">
                      <span className="builder-set-num">{idx + 1}세트</span>
                      <span className="builder-set-val">
                        {st.isEmptyBar ? `빈봉 × ${st.reps}회` : `${st.weight}kg × ${st.reps}회`}
                      </span>
                      <button
                        className="builder-remove-set-btn"
                        onClick={() => handleRemoveSet(idx)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Input Inputs Bar */}
              <div className="builder-input-controls">
                <div className="inputs-row">
                  <div className={`athletic-input-field ${isEmptyBar ? 'disabled' : ''}`}>
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder="무게"
                      value={weight}
                      disabled={isEmptyBar}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                    <span className="input-unit">kg</span>
                  </div>

                  <div className="athletic-input-field">
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="횟수"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                    />
                    <span className="input-unit">회</span>
                  </div>
                </div>

                <div className="builder-actions-row">
                  <button
                    className={`empty-bar-toggle-btn ${isEmptyBar ? 'active' : ''}`}
                    onClick={() => {
                      HapticService.light();
                      setIsEmptyBar(!isEmptyBar);
                    }}
                  >
                    <Check size={16} />
                    <span>빈봉</span>
                  </button>

                  <button className="add-set-action-btn" onClick={handleAddSet}>
                    세트 추가
                  </button>
                </div>

                <button
                  className="complete-workout-btn"
                  onClick={handleComplete}
                  disabled={sets.length === 0}
                >
                  {editingWorkout ? '수정 완료' : '운동 일지 기록 완료'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="sub-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="sub-modal-card" onClick={(e) => e.stopPropagation()}>
            <h4>{addType === 'group' ? '새 운동 부위 추가' : `'${selectedGroup}'에 운동 추가`}</h4>
            <input
              type="text"
              className="sub-modal-input"
              placeholder={addType === 'group' ? '예: 어깨, 등' : '예: 덤벨 숄더프레스'}
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddSubmit();
              }}
              autoFocus
            />
            <div className="sub-modal-btn-group">
              <button
                className="sub-modal-btn secondary"
                onClick={() => setIsAddModalOpen(false)}
              >
                취소
              </button>
              <button className="sub-modal-btn primary" onClick={handleAddSubmit}>
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
