import { ArrowUpToLine, ArrowDownToLine, Copy, Trash2, Check } from 'lucide-react';
import { HapticService } from '../../services/hapticService';

export function DecoToolbar({
  activeItemId,
  onBringToFront,
  onSendToBack,
  onDuplicate,
  onDelete,
  onDeselect
}) {
  if (!activeItemId) return null;

  return (
    <div className="deco-floating-toolbar show">
      <button
        className="toolbar-btn"
        onClick={() => {
          HapticService.light();
          onBringToFront(activeItemId);
        }}
        title="맨 앞으로 가져오기"
      >
        <ArrowUpToLine size={16} />
        <span>맨앞으로</span>
      </button>

      <button
        className="toolbar-btn"
        onClick={() => {
          HapticService.light();
          onSendToBack(activeItemId);
        }}
        title="맨 뒤로 보내기"
      >
        <ArrowDownToLine size={16} />
        <span>맨뒤로</span>
      </button>

      <button
        className="toolbar-btn"
        onClick={() => {
          HapticService.medium();
          onDuplicate(activeItemId);
        }}
        title="복제하기"
      >
        <Copy size={16} />
        <span>복제</span>
      </button>

      <button
        className="toolbar-btn danger"
        onClick={() => {
          HapticService.heavy();
          onDelete(activeItemId);
        }}
        title="삭제하기"
      >
        <Trash2 size={16} />
        <span>삭제</span>
      </button>

      <button
        className="toolbar-btn primary"
        onClick={() => {
          HapticService.light();
          onDeselect();
        }}
        title="선택 완료"
      >
        <Check size={16} />
        <span>완료</span>
      </button>
    </div>
  );
}
