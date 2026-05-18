import { useCallback, useEffect, useRef, useState } from "react";
import { useAppAuth } from "../providers/AuthProvider";
import { useAuthStore } from "../stores/authStore";
import { useOfflineStore } from "../stores/offlineStore";
import {
  getHabitsForDate,
  upsertLog as upsertLogRemote,
  type FireHabit,
  type FireHabitLog,
  type FireStreak,
} from "../services/firestoreService";
import {
  applyLocalToggle,
  applyLocalIncrement,
  getHabitsForDateLocal,
  saveHabitsFromServer,
  type LocalHabit,
} from "../db/habitRepository";

import { useHabitStore } from "../stores/habitStore";

export function useHabitsForDate(date: string) {
  const { isAuthenticated, user } = useAppAuth();
  const userId = useAuthStore((s) => s.userId);
  const isOnline = useOfflineStore((s) => s.isOnline);
  const needsRefetch = useHabitStore((s) => s.needsRefetch);

  const [localHabits, setLocalHabits] = useState<LocalHabit[]>([]);
  const [localReady, setLocalReady] = useState(false);
  const [remoteHabits, setRemoteHabits] = useState<
    | (FireHabit & {
        log?: FireHabitLog | null;
        streak?: FireStreak | null;
      })[]
    | null
  >(null);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const fetchIdRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadLocal = useCallback(async () => {
    if (!userId) {
      if (mountedRef.current) {
        setLocalHabits([]);
        setLocalReady(true);
      }
      return;
    }
    try {
      const rows = await getHabitsForDateLocal(userId, date);
      if (mountedRef.current) {
        setLocalHabits(rows);
        setLocalReady(true);
      }
    } catch (e) {
      console.error("[useHabitsForDate] local load error:", e);
      if (mountedRef.current) setLocalReady(true);
    }
  }, [userId, date]);

  const loadRemote = useCallback(async () => {
    if (!isAuthenticated || !user?.uid || !isOnline) return;

    const currentFetchId = ++fetchIdRef.current;

    try {
      const data = await getHabitsForDate(user.uid, date);

      // Only apply if this is still the latest fetch
      if (currentFetchId !== fetchIdRef.current || !mountedRef.current) return;

      setRemoteHabits(data);
      setRemoteError(null);

      // Also save remote data to local SQLite for offline access
      if (userId && data.length > 0) {
        const habits = data.map((h) => ({
          _id: h.id!,
          name: h.name,
          nameRu: h.nameRu,
          icon: h.icon,
          color: h.color,
          type: h.type,
          targetType: h.targetType,
          targetValue: h.targetValue,
          frequencyType: h.frequencyType,
          timeOfDay: h.timeOfDay,
          reminderEnabled: h.reminderEnabled,
          sortOrder: h.sortOrder,
          isArchived: h.isArchived,
        }));

        const streaks = data
          .filter((h) => h.streak)
          .map((h) => ({
            habitId: h.id!,
            currentStreak: h.streak!.currentStreak,
            bestStreak: h.streak!.bestStreak,
            flexUsedThisMonth: h.streak!.flexUsedThisMonth,
            lastCompletedDate: h.streak!.lastCompletedDate,
          }));

        const logs = data
          .filter((h) => h.log)
          .map((h) => ({
            _id: `${h.id!}_${date}`,
            habitId: h.id!,
            logDate: date,
            status: h.log!.status,
            value: h.log!.value,
          }));

        try {
          await saveHabitsFromServer(userId, habits, streaks, logs);
          await loadLocal();
        } catch (e) {
          console.warn("[useHabitsForDate] local save error:", e);
          // Non-critical: remote data is still in memory
        }
      }
    } catch (e) {
      console.error("[useHabitsForDate] remote fetch error:", e);
      if (mountedRef.current) setRemoteError("Failed to fetch remote habits");
    }
  }, [isAuthenticated, user?.uid, userId, isOnline, date]);

  useEffect(() => {
    setRemoteHabits(null);
    setLocalReady(false);
    void loadLocal();
  }, [loadLocal, needsRefetch]);

  useEffect(() => {
    void loadRemote();
  }, [loadRemote, needsRefetch]);

  // Merge: remote data takes precedence when online, local is fallback
  const habits: LocalHabit[] =
    isOnline && remoteHabits !== null
      ? remoteHabits.map((h) => ({
          _id: h.id!,
          userId: userId!,
          name: h.name,
          nameRu: h.nameRu,
          icon: h.icon,
          color: h.color,
          type: h.type,
          targetType: h.targetType,
          targetValue: h.targetValue,
          frequencyType: h.frequencyType,
          timeOfDay: h.timeOfDay,
          reminderEnabled: h.reminderEnabled,
          sortOrder: h.sortOrder,
          isArchived: h.isArchived,
          log: h.log ? { status: h.log.status, value: h.log.value } : null,
          streak: h.streak
            ? {
                currentStreak: h.streak.currentStreak,
                bestStreak: h.streak.bestStreak,
                flexUsedThisMonth: h.streak.flexUsedThisMonth,
                lastCompletedDate: h.streak.lastCompletedDate,
              }
            : null,
        }))
      : localHabits;

  const isLoading = !localReady;

  const toggleHabit = useCallback(
    async (habitId: string) => {
      if (!userId) return;
      const habit = habits.find((h) => h._id === habitId);
      const wasCompleted = habit?.log?.status === "completed";
      const newStatus = wasCompleted ? "missed" : "completed";

      // Apply locally first (optimistic UI)
      await applyLocalToggle(userId, habitId, date, habit?.log ?? null);

      // Sync to Firestore if online
      if (isOnline && user?.uid) {
        try {
          await upsertLogRemote({
            habitId,
            userId: user.uid,
            logDate: date,
            status: newStatus as "completed" | "missed",
          });
        } catch (e) {
          console.error("[useHabitsForDate] toggle sync error:", e);
          // Queue will retry
        }
      }

      await loadLocal();
      setRemoteHabits(null); // Force re-fetch remote data next render
    },
    [habits, userId, date, loadLocal, isOnline, user?.uid],
  );

  const incrementHabit = useCallback(
    async (habitId: string, delta: number) => {
      if (!userId) return;
      const habit = habits.find((h) => h._id === habitId);
      if (!habit) return;
      const newValue = Math.max(0, (habit.log?.value ?? 0) + delta);
      const newStatus =
        newValue >= (habit.targetValue ?? 1) ? "completed" : "missed";

      await applyLocalIncrement(
        userId,
        habitId,
        date,
        delta,
        habit.log?.value ?? 0,
        habit.targetValue ?? 1,
      );

      if (isOnline && user?.uid) {
        try {
          await upsertLogRemote({
            habitId,
            userId: user.uid,
            logDate: date,
            status: newStatus as "completed" | "missed",
            value: newValue,
          });
        } catch (e) {
          console.error("[useHabitsForDate] increment sync error:", e);
        }
      }

      await loadLocal();
      setRemoteHabits(null);
    },
    [habits, userId, date, loadLocal, isOnline, user?.uid],
  );

  return {
    habits,
    isLoading,
    toggleHabit,
    incrementHabit,
    refresh: loadLocal,
    remoteError,
  };
}
