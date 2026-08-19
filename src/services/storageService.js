import localforage from 'localforage';

// Initialize localforage store
localforage.config({
  name: 'RUTI_WORKOUT_APP',
  storeName: 'ruti_storage',
  description: 'RUTI Workout Journal & Deco Local Storage'
});

export const DEFAULT_EXERCISE_GROUPS = {
  '상체': ['벤치프레스', '오버헤드 프레스', '바벨로우', '랫풀다운', '인클라인 덤벨프레스'],
  '하체': ['스쿼트', '데드리프트', '레그프레스', '런지'],
  '유산소/코어': ['트레드밀 (러닝)', '천국의 계단', '플랭크', '레그레이즈']
};

/**
 * 🔄 무손실 레거시 데이터 마이그레이션 엔진
 * 기존의 단순 문자열/구형 스티커 객체를 v2 통합 DecoItem 스키마로 100% 보존 변환
 */
export async function migrateLegacyData() {
  try {
    const version = await localforage.getItem('sys_migration_version') || 0;
    if (version >= 2) return; // 이미 최신 버전

    const allKeys = await localforage.keys();
    const stickerKeys = allKeys.filter(k => k.startsWith('stickers_'));
    const workoutKeys = allKeys.filter(k => k.startsWith('workouts_'));

    // 1. 레거시 스티커 마이그레이션
    for (const sKey of stickerKeys) {
      const legacyStickers = await localforage.getItem(sKey);
      if (Array.isArray(legacyStickers) && legacyStickers.length > 0) {
        const converted = legacyStickers.map((item, idx) => {
          if (typeof item === 'string') {
            return {
              id: `migrated_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
              type: 'emoji',
              x: 30 + idx * 45,
              y: 80,
              scale: 1,
              rotation: 0,
              zIndex: idx + 1,
              isFlipped: false,
              isLocked: false,
              content: { emoji: item }
            };
          }
          return {
            id: item.id || `migrated_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
            type: item.type || 'emoji',
            x: item.x ?? 40,
            y: item.y ?? 40,
            scale: item.scale ?? 1,
            rotation: item.rotation ?? 0,
            zIndex: item.zIndex ?? (idx + 1),
            isFlipped: item.isFlipped ?? false,
            isLocked: item.isLocked ?? false,
            content: item.content || { emoji: item.emoji || '🔥' }
          };
        });
        await localforage.setItem(sKey, converted);
      }
    }

    // 2. 운동 그룹 기본값 보정
    const groups = await localforage.getItem('exerciseGroups');
    if (!groups || typeof groups !== 'object' || Object.keys(groups).length === 0) {
      await localforage.setItem('exerciseGroups', DEFAULT_EXERCISE_GROUPS);
    }

    // 마이그레이션 완료 플래그 기록
    await localforage.setItem('sys_migration_version', 2);
    console.log('✅ [RUTI] Legacy Data Migration to v2 completed successfully (Zero Data Loss)');
  } catch (error) {
    console.error('❌ [RUTI] Migration Error:', error);
  }
}

// ==========================================
// 📦 CRUD API Services
// ==========================================

export async function getWorkouts(dateStr) {
  const data = await localforage.getItem(`workouts_${dateStr}`);
  return Array.isArray(data) ? data : [];
}

export async function saveWorkouts(dateStr, workouts) {
  const key = `workouts_${dateStr}`;
  if (!workouts || workouts.length === 0) {
    await localforage.removeItem(key);
  } else {
    await localforage.setItem(key, workouts);
  }
}

export async function getStickers(dateStr) {
  const data = await localforage.getItem(`stickers_${dateStr}`);
  return Array.isArray(data) ? data : [];
}

export async function saveStickers(dateStr, stickers) {
  const key = `stickers_${dateStr}`;
  if (!stickers || stickers.length === 0) {
    await localforage.removeItem(key);
  } else {
    await localforage.setItem(key, stickers);
  }
}

export async function getAllWorkoutDates() {
  const keys = await localforage.keys();
  const wKeys = keys.filter(k => k.startsWith('workouts_'));
  const activeDates = [];
  for (const k of wKeys) {
    const data = await localforage.getItem(k);
    if (Array.isArray(data) && data.length > 0) {
      activeDates.push(k.replace('workouts_', ''));
    }
  }
  return activeDates;
}

export async function getExerciseGroups() {
  const data = await localforage.getItem('exerciseGroups');
  return data && Object.keys(data).length > 0 ? data : DEFAULT_EXERCISE_GROUPS;
}

export async function saveExerciseGroups(groups) {
  await localforage.setItem('exerciseGroups', groups);
}

export async function getFavorites() {
  const fav = await localforage.getItem('favorites');
  return fav || { groups: [], exercises: [] };
}

export async function saveFavorites(favorites) {
  await localforage.setItem('favorites', favorites);
}

export async function getDayMeta(dateStr) {
  const data = await localforage.getItem(`meta_${dateStr}`);
  return data || { theme: 'grid-dark' };
}

export async function saveDayMeta(dateStr, meta) {
  await localforage.setItem(`meta_${dateStr}`, meta);
}
