import { useEffect, useRef } from "react";
import { useAppAuth } from "../providers/AuthProvider";
import { useOfflineStore } from "../stores/offlineStore";
import { useAuthStore } from "../stores/authStore";
// FIX: import removeSyncQueueItem so we can clear each entry after a
// successful push instead of letting the queue grow forever.
import { getSyncQueue, removeSyncQueueItem } from "../db/habitRepository";
import { getHabitsForDate, upsertLog, createHabit, updateHabit, deleteHabit } from "../services/firestoreService";
import { getToday } from "../utils/date";

export function useOfflineSync() {
  const { isAuthenticated, user } = useAppAuth();
  const isOnline = useOfflineStore((s) => s.isOnline);
  const userId = useAuthStore((s) => s.userId);
  const syncingRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !isOnline || !userId || !user?.uid) return;

    const fireUid = user.uid;

    async function sync() {
      if (syncingRef.current) return;
      syncingRef.current = true;
      try {
        const queue = await getSyncQueue();
        const { setSyncing, setLastSynced, setPendingCount } =
          useOfflineStore.getState();

        setSyncing(true);

        type QueueItem = { id: number; operation: string; payload: string };
        for (const item of queue as QueueItem[]) {
          const payload = JSON.parse(item.payload) as {
            habitId: string;
            logDate: string;
            status: "completed" | "missed";
            value?: number;
            increment?: number;
            // For createHabit / updateHabit
            name?: string;
            icon?: string;
            color?: string;
            type?: string;
            targetType?: string;
            targetValue?: number;
            frequencyType?: string;
            timeOfDay?: string;
            reminderEnabled?: boolean;
          };

          if (
            item.operation === "toggleHabit" ||
            item.operation === "incrementHabit"
          ) {
            try {
              await upsertLog({
                habitId: payload.habitId,
                userId: fireUid,
                logDate: payload.logDate,
                status: payload.status,
                value: payload.value ?? undefined,
              });
              await removeSyncQueueItem(item.id);
            } catch (e) {
              console.error("[sync] push error, will retry:", e);
            }
          } else if (item.operation === "createHabit") {
            try {
              await createHabit({
                id: payload.habitId,
                userId: fireUid,
                name: payload.name!,
                icon: payload.icon!,
                color: payload.color!,
                type: payload.type || "good",
                targetType: payload.targetType!,
                targetValue: payload.targetValue,
                frequencyType: payload.frequencyType!,
                timeOfDay: payload.timeOfDay!,
                reminderEnabled: payload.reminderEnabled ?? true,
                sortOrder: 0,
                isArchived: false,
              });
              await removeSyncQueueItem(item.id);
            } catch (e) {
              console.error("[sync] create sync error, will retry:", e);
            }
          } else if (item.operation === "updateHabit") {
            try {
              await updateHabit(payload.habitId, {
                name: payload.name,
                icon: payload.icon,
                color: payload.color,
                targetType: payload.targetType,
                targetValue: payload.targetValue,
                frequencyType: payload.frequencyType,
                timeOfDay: payload.timeOfDay,
              });
              await removeSyncQueueItem(item.id);
            } catch (e) {
              console.error("[sync] update sync error, will retry:", e);
            }
          } else if (item.operation === "deleteHabit") {
            try {
              await deleteHabit(payload.habitId);
              await removeSyncQueueItem(item.id);
            } catch (e) {
              console.error("[sync] delete sync error, will retry:", e);
            }
          }
        }

        // Pull latest from Firestore to keep local SQLite fresh.
        try {
          const today = getToday();
          await getHabitsForDate(fireUid, today);
        } catch (e) {
          console.error("[sync] pull error:", e);
        }

        // Count whatever items remain (failed pushes).
        const remaining = await getSyncQueue();
        setPendingCount(remaining.length);
        setLastSynced(new Date().toISOString());
        setSyncing(false);
      } catch (error) {
        console.error("[sync] failed:", error);
      } finally {
        syncingRef.current = false;
      }
    }

    void sync();
  }, [isAuthenticated, isOnline, userId, user?.uid]);
}
