import { DecoItem } from './DecoItem';

export function DecoCanvas({
  theme = 'grid-dark',
  workouts = [],
  decoItems = [],
  activeItemId,
  onSelectItem,
  onUpdateItem,
  onDeleteItem,
  onDuplicateItem,
  onFlipItem,
  onEditWorkout,
  onDeleteWorkout,
  workoutToDelete,
  setWorkoutToDelete,
  onDropSticker
}) {
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const stickerData = e.dataTransfer.getData('text/plain');
    if (!stickerData) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const dropX = e.clientX - rect.left - 25;
    const dropY = e.clientY - rect.top - 25;

    onDropSticker({ emoji: stickerData }, { x: dropX, y: dropY });
  };

  return (
    <div
      className={`deco-canvas-container theme-${theme}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => onSelectItem(null)}
    >
      {/* 1. 운동 일지 세트 카드 목록 */}
      <div className="canvas-workout-cards-layer">
        {workouts.length === 0 ? (
          <div className="empty-workout-placeholder">
            <p className="empty-title">등록된 운동 일지가 없습니다</p>
            <p className="empty-sub">우측 하단 (+) 버튼을 눌러 운동을 추가해 보세요</p>
          </div>
        ) : (
          workouts.map((w, idx) => (
            <div
              key={idx}
              className="athletic-workout-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="card-header-bar">
                <div className="card-title-group">
                  <h4 className="card-exercise-name">{w.exercise}</h4>
                  {w.sets.some((s) => s.isEmptyBar) && (
                    <span className="athletic-empty-bar-tag">빈봉</span>
                  )}
                </div>
                <div className="card-action-group">
                  <button
                    className="card-mini-btn"
                    onClick={() => onEditWorkout(idx)}
                  >
                    수정
                  </button>
                  <button
                    className="card-mini-btn danger"
                    onClick={() => onDeleteWorkout(idx)}
                  >
                    삭제
                  </button>
                </div>
              </div>

              <div className="card-sets-grid">
                {w.sets.map((s, sIdx) => (
                  <div key={sIdx} className="card-set-item-row">
                    <span className="set-index-label">{sIdx + 1}세트</span>
                    <span className="set-value-label">
                      {s.isEmptyBar ? `빈봉 × ${s.reps}회` : `${s.weight}kg × ${s.reps}회`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 2. 인터랙티브 다꾸 아이템 레이어 */}
      <div className="canvas-deco-items-layer">
        {decoItems.map((item) => (
          <DecoItem
            key={item.id}
            item={item}
            isActive={activeItemId === item.id}
            onSelect={onSelectItem}
            onUpdate={onUpdateItem}
            onDelete={onDeleteItem}
            onDuplicate={onDuplicateItem}
            onFlip={onFlipItem}
          />
        ))}
      </div>
    </div>
  );
}
