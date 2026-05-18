import {
  getDB,
  insertHabit,
  upsertLog,
  upsertStreak,
  addToSyncQueue,
  getSyncQueue,
  clearSyncQueue,
  removeSyncQueueItem,
} from "./sqlite";

export type LocalHabit = {
  _id: string;
  serverId?: string;
  userId: string;
  name: string;
  nameRu?: string;
  icon: string;
  color: string;
  type: string;
  targetType: string;
  targetValue?: number;
  frequencyType: string;
  timeOfDay: string;
  reminderEnabled: boolean;
  sortOrder: number;
  isArchived: boolean;
  log?: { status: string; value?: number } | null;
  streak?: {
    currentStreak: number;
    bestStreak: number;
    flexUsedThisMonth: number;
    lastCompletedDate?: string;
  } | null;
};

function rowToHabit(
  row: Record<string, unknown>,
  log?: Record<string, unknown> | null,
  streak?: Record<string, unknown> | null,
): LocalHabit {
  return {
    _id: (row.serverid as string) || (row.id as string),
    serverId: row.serverid as string | undefined,
    userId: row.userid as string,
    name: row.name as string,
    nameRu: row.nameru as string | undefined,
    icon: row.icon as string,
    color: row.color as string,
    type: row.type as string,
    targetType: row.targettype as string,
    targetValue: row.targetvalue as number | undefined,
    frequencyType: row.frequencytype as string,
    timeOfDay: row.timeofday as string,
    reminderEnabled: Boolean(row.reminderenabled),
    sortOrder: row.sortorder as number,
    isArchived: Boolean(row.isarchived),
    log: log
      ? { status: log.status as string, value: log.value as number | undefined }
      : null,
    streak: streak
      ? {
          currentStreak: streak.currentstreak as number,
          bestStreak: streak.beststreak as number,
          flexUsedThisMonth: streak.flexusedthismonth as number,
          lastCompletedDate: streak.lastcompleteddate as string | undefined,
        }
      : null,
  };
}

export async function getHabitsForDateLocal(
  userId: string,
  date: string,
): Promise<LocalHabit[]> {
  const db = await getDB();
  const habits = await db.getAllAsync<Record<string, unknown>>(
    `SELECT h.*, l.status as log_status, l.value as log_value,
            s.currentstreak, s.beststreak, s.flexusedthismonth, s.lastcompleteddate
     FROM habits h
     LEFT JOIN habit_logs l ON l.habitid = h.id AND l.logdate = ?
     LEFT JOIN streaks s ON s.habitid = h.id
     WHERE h.userid = ? AND h.isarchived = 0
     ORDER BY h.sortorder`,
    [date, userId],
  );

  return habits.map((row) => {
    const log =
      row.log_status != null
        ? {
            status: row.log_status as string,
            value: row.log_value as number | undefined,
          }
        : null;
    const streak =
      row.currentstreak != null
        ? {
            currentstreak: row.currentstreak,
            beststreak: row.beststreak,
            flexusedthismonth: row.flexusedthismonth,
            lastcompleteddate: row.lastcompleteddate,
          }
        : null;
    return rowToHabit(row, log, streak);
  });
}

export async function saveHabitsFromServer(
  userId: string,
  habits: Record<string, unknown>[],
  streaks: Record<string, unknown>[],
  logs: Record<string, unknown>[],
) {
  for (const h of habits) {
    const serverId = h._id as string;
    await insertHabit({
      id: serverId,
      serverId,
      userId,
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
    });
  }

  for (const s of streaks) {
    await upsertStreak({
      habitId: (s.habitId as string) || (s.habitid as string),
      userId,
      currentStreak: s.currentStreak as number,
      bestStreak: s.bestStreak as number,
      flexUsedThisMonth: s.flexUsedThisMonth as number,
      lastCompletedDate: s.lastCompletedDate as string | undefined,
    });
  }

  for (const l of logs) {
    await upsertLog({
      id: (l._id as string) || `${l.habitId}_${l.logDate}`,
      habitId: l.habitId as string,
      userId,
      logDate: l.logDate as string,
      status: l.status as string,
      value: l.value as number | undefined,
    });
  }
}

export async function applyLocalToggle(
  userId: string,
  habitId: string,
  logDate: string,
  currentLog?: { status: string } | null,
) {
  const wasCompleted = currentLog?.status === "completed";
  const newStatus = wasCompleted ? "missed" : "completed";
  const logId = `${habitId}_${logDate}`;

  await upsertLog({
    id: logId,
    habitId,
    userId,
    logDate,
    status: newStatus,
  });

  await addToSyncQueue("toggleHabit", { habitId, logDate, status: newStatus });

  return newStatus;
}

export async function applyLocalShield(
  userId: string,
  habitId: string,
  logDate: string,
  currentLog?: { status: string } | null,
) {
  const wasShielded = currentLog?.status === "shielded";
  const newStatus = wasShielded ? "missed" : "shielded";
  const logId = `${habitId}_${logDate}`;

  await upsertLog({
    id: logId,
    habitId,
    userId,
    logDate,
    status: newStatus,
  });

  await addToSyncQueue("toggleHabit", { habitId, logDate, status: newStatus });

  return newStatus;
}

export async function applyLocalIncrement(
  userId: string,
  habitId: string,
  logDate: string,
  increment: number,
  currentValue: number,
  targetValue: number,
) {
  const newValue = Math.max(0, currentValue + increment);
  const newStatus = newValue >= targetValue ? "completed" : "missed";
  const logId = `${habitId}_${logDate}`;

  await upsertLog({
    id: logId,
    habitId,
    userId,
    logDate,
    status: newStatus,
    value: newValue,
  });

  // FIX: include resolved value and status so the sync layer can push
  // them verbatim without guessing.
  await addToSyncQueue("incrementHabit", {
    habitId,
    logDate,
    increment,
    value: newValue,
    status: newStatus,
  });

  return { value: newValue, status: newStatus };
}

export async function createLocalHabit(
  userId: string,
  habit: {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: string;
    targetType: string;
    targetValue?: number;
    frequencyType: string;
    timeOfDay: string;
    reminderEnabled: boolean;
  },
) {
  await insertHabit({
    id: habit.id,
    serverId: habit.id,
    userId,
    name: habit.name,
    icon: habit.icon,
    color: habit.color,
    type: habit.type,
    targetType: habit.targetType,
    targetValue: habit.targetValue,
    frequencyType: habit.frequencyType,
    timeOfDay: habit.timeOfDay,
    reminderEnabled: habit.reminderEnabled,
    sortOrder: 0,
    isArchived: false,
  });

  await addToSyncQueue("createHabit", {
    habitId: habit.id,
    name: habit.name,
    icon: habit.icon,
    color: habit.color,
    type: habit.type,
    targetType: habit.targetType,
    targetValue: habit.targetValue,
    frequencyType: habit.frequencyType,
    timeOfDay: habit.timeOfDay,
    reminderEnabled: habit.reminderEnabled,
  });
}

export async function updateLocalHabit(
  userId: string,
  habitId: string,
  habit: {
    name: string;
    icon: string;
    color: string;
    targetType: string;
    targetValue?: number;
    frequencyType: string;
    timeOfDay: string;
  },
) {
  const db = await getDB();
  const existing = await db.getFirstAsync<Record<string, unknown>>(
    "SELECT * FROM habits WHERE id = ?",
    [habitId],
  );

  await insertHabit({
    id: habitId,
    serverId: habitId,
    userId,
    name: habit.name,
    icon: habit.icon,
    color: habit.color,
    type: (existing?.type as string) || "good",
    targetType: habit.targetType,
    targetValue: habit.targetValue,
    frequencyType: habit.frequencyType,
    timeOfDay: habit.timeOfDay,
    reminderEnabled: existing ? Boolean(existing.reminderenabled) : true,
    sortOrder: existing ? (existing.sortorder as number) : 0,
    isArchived: existing ? Boolean(existing.isarchived) : false,
  });

  await addToSyncQueue("updateHabit", {
    habitId,
    name: habit.name,
    icon: habit.icon,
    color: habit.color,
    targetType: habit.targetType,
    targetValue: habit.targetValue,
    frequencyType: habit.frequencyType,
    timeOfDay: habit.timeOfDay,
  });
}

export async function deleteLocalHabit(userId: string, habitId: string) {
  const db = await getDB();
  await db.runAsync("DELETE FROM habit_logs WHERE habitid = ?", [habitId]);
  await db.runAsync("DELETE FROM streaks WHERE habitid = ?", [habitId]);
  await db.runAsync("DELETE FROM habits WHERE id = ?", [habitId]);

  await addToSyncQueue("deleteHabit", { habitId });
}

export { getSyncQueue, clearSyncQueue, removeSyncQueueItem, addToSyncQueue };
