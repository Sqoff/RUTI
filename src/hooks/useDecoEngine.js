import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { getStickers, saveStickers, getDayMeta, saveDayMeta } from '../services/storageService';
import { supabaseService } from '../services/supabaseService';
import { HapticService } from '../services/hapticService';

export function useDecoEngine(selectedDate) {
  const [decoItems, setDecoItems] = useState([]);
  const [activeItemId, setActiveItemId] = useState(null);
  const [dayMeta, setDayMeta] = useState({ theme: 'grid-dark' });
  const [maxZIndex, setMaxZIndex] = useState(10);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  // 데이터 로드
  const loadDecoData = useCallback(async () => {
    try {
      const [items, meta] = await Promise.all([
        getStickers(dateStr),
        getDayMeta(dateStr)
      ]);
      setDecoItems(items);
      setDayMeta(meta);

      const highestZ = items.reduce((max, it) => Math.max(max, it.zIndex || 1), 10);
      setMaxZIndex(highestZ);
    } catch (e) {
      console.error('loadDecoData error:', e);
    }
  }, [dateStr]);

  useEffect(() => {
    loadDecoData();
    setActiveItemId(null);
  }, [loadDecoData]);

  // DB 및 State 저장 헬퍼
  const commitItems = async (nextItems) => {
    setDecoItems(nextItems);
    await saveStickers(dateStr, nextItems);
    supabaseService.syncDailyStickers(dateStr, nextItems);
  };

  // 새 다꾸 아이템 추가
  const addDecoItem = async (type, content, initialPos = { x: 60, y: 120 }) => {
    HapticService.medium();
    const nextZ = maxZIndex + 1;
    setMaxZIndex(nextZ);

    const newItem = {
      id: `deco_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      x: initialPos.x,
      y: initialPos.y,
      scale: 1,
      rotation: Math.floor(Math.random() * 16) - 8,
      zIndex: nextZ,
      isFlipped: false,
      isLocked: false,
      content
    };

    const nextItems = [...decoItems, newItem];
    await commitItems(nextItems);
    setActiveItemId(newItem.id);
    return newItem;
  };

  // 아이템 업데이트 (드래그/회전/스케일)
  const updateDecoItem = async (updatedItem) => {
    const nextItems = decoItems.map(it => (it.id === updatedItem.id ? updatedItem : it));
    await commitItems(nextItems);
  };

  // 아이템 삭제
  const deleteDecoItem = async (id) => {
    HapticService.heavy();
    const nextItems = decoItems.filter(it => it.id !== id);
    if (activeItemId === id) setActiveItemId(null);
    await commitItems(nextItems);
  };

  // 아이템 복제
  const duplicateDecoItem = async (id) => {
    HapticService.medium();
    const target = decoItems.find(it => it.id === id);
    if (!target) return;

    const nextZ = maxZIndex + 1;
    setMaxZIndex(nextZ);

    const clone = {
      ...target,
      id: `deco_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      x: target.x + 20,
      y: target.y + 20,
      zIndex: nextZ
    };

    const nextItems = [...decoItems, clone];
    await commitItems(nextItems);
    setActiveItemId(clone.id);
  };

  // 좌우 반전
  const flipDecoItem = async (id) => {
    HapticService.light();
    const nextItems = decoItems.map(it => {
      if (it.id === id) {
        return { ...it, isFlipped: !it.isFlipped };
      }
      return it;
    });
    await commitItems(nextItems);
  };

  // 맨 앞으로 가져오기
  const bringToFront = async (id) => {
    HapticService.light();
    const nextZ = maxZIndex + 1;
    setMaxZIndex(nextZ);
    const nextItems = decoItems.map(it => (it.id === id ? { ...it, zIndex: nextZ } : it));
    await commitItems(nextItems);
  };

  // 맨 뒤로 보내기
  const sendToBack = async (id) => {
    HapticService.light();
    const nextItems = decoItems.map(it => (it.id === id ? { ...it, zIndex: 1 } : it));
    await commitItems(nextItems);
  };

  // 속지 테마 변경
  const changeCanvasTheme = async (themeName) => {
    HapticService.light();
    const nextMeta = { ...dayMeta, theme: themeName };
    setDayMeta(nextMeta);
    await saveDayMeta(dateStr, nextMeta);
  };

  return {
    decoItems,
    activeItemId,
    setActiveItemId,
    dayMeta,
    addDecoItem,
    updateDecoItem,
    deleteDecoItem,
    duplicateDecoItem,
    flipDecoItem,
    bringToFront,
    sendToBack,
    changeCanvasTheme,
    refresh: loadDecoData
  };
}
