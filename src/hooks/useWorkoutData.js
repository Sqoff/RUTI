import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import {
  getWorkouts,
  saveWorkouts,
  getAllWorkoutDates,
  getExerciseGroups,
  saveExerciseGroups,
  getFavorites,
  saveFavorites,
  DEFAULT_EXERCISE_GROUPS
} from '../services/storageService';
import { supabaseService } from '../services/supabaseService';
import { HapticService } from '../services/hapticService';

export function useWorkoutData(selectedDate) {
  const [dailyWorkouts, setDailyWorkouts] = useState([]);
  const [workoutDates, setWorkoutDates] = useState([]);
  const [exerciseGroups, setExerciseGroups] = useState(DEFAULT_EXERCISE_GROUPS);
  const [favoriteGroups, setFavoriteGroups] = useState([]);
  const [favoriteExercises, setFavoriteExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  // 운동 날짜 목록 및 그룹/즐겨찾기 초기 로드
  const loadMeta = useCallback(async () => {
    try {
      const [dates, groups, favs] = await Promise.all([
        getAllWorkoutDates(),
        getExerciseGroups(),
        getFavorites()
      ]);
      setWorkoutDates(dates);
      setExerciseGroups(groups);
      setFavoriteGroups(favs.groups || []);
      setFavoriteExercises(favs.exercises || []);
    } catch (e) {
      console.error('loadMeta error:', e);
    }
  }, []);

  // 선택 날짜의 운동 기록 로드
  const loadDailyWorkouts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getWorkouts(dateStr);
      setDailyWorkouts(data);
    } catch (e) {
      console.error('loadDailyWorkouts error:', e);
    } finally {
      setIsLoading(false);
    }
  }, [dateStr]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    loadDailyWorkouts();
  }, [loadDailyWorkouts]);

  // 운동 저장 (추가 또는 수정)
  const saveWorkoutEntry = async (entry, editIndex = null) => {
    HapticService.heavy();
    const updated = [...dailyWorkouts];
    if (editIndex !== null && updated[editIndex]) {
      updated[editIndex] = entry;
    } else {
      updated.push(entry);
    }
    setDailyWorkouts(updated);
    await saveWorkouts(dateStr, updated);

    if (!workoutDates.includes(dateStr)) {
      setWorkoutDates(prev => [...prev, dateStr]);
    }

    // 백그라운드 클라우드 동기화
    supabaseService.syncDailyWorkouts(dateStr, updated);
  };

  // 운동 삭제
  const deleteWorkoutEntry = async (index) => {
    HapticService.medium();
    const updated = dailyWorkouts.filter((_, i) => i !== index);
    setDailyWorkouts(updated);
    await saveWorkouts(dateStr, updated);

    if (updated.length === 0) {
      setWorkoutDates(prev => prev.filter(d => d !== dateStr));
    }

    supabaseService.syncDailyWorkouts(dateStr, updated);
  };

  // 즐겨찾기 토글
  const toggleGroupFavorite = async (group) => {
    HapticService.light();
    const nextGroups = favoriteGroups.includes(group)
      ? favoriteGroups.filter(g => g !== group)
      : [...favoriteGroups, group];
    setFavoriteGroups(nextGroups);
    await saveFavorites({ groups: nextGroups, exercises: favoriteExercises });
  };

  const toggleExerciseFavorite = async (group, exercise) => {
    HapticService.light();
    const key = `${group}:${exercise}`;
    const nextEx = favoriteExercises.includes(key)
      ? favoriteExercises.filter(k => k !== key)
      : [...favoriteExercises, key];
    setFavoriteExercises(nextEx);
    await saveFavorites({ groups: favoriteGroups, exercises: nextEx });
  };

  // 새 부위/종목 추가
  const addCustomGroup = async (groupName) => {
    if (exerciseGroups[groupName]) return false;
    const next = { ...exerciseGroups, [groupName]: [] };
    setExerciseGroups(next);
    await saveExerciseGroups(next);
    return true;
  };

  const addCustomExercise = async (group, exerciseName) => {
    const list = exerciseGroups[group] || [];
    if (list.includes(exerciseName)) return false;
    const next = { ...exerciseGroups, [group]: [...list, exerciseName] };
    setExerciseGroups(next);
    await saveExerciseGroups(next);
    return true;
  };

  return {
    dailyWorkouts,
    workoutDates,
    exerciseGroups,
    favoriteGroups,
    favoriteExercises,
    isLoading,
    saveWorkoutEntry,
    deleteWorkoutEntry,
    toggleGroupFavorite,
    toggleExerciseFavorite,
    addCustomGroup,
    addCustomExercise,
    refresh: loadDailyWorkouts
  };
}
