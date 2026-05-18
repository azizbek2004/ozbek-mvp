import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch, // FIX: needed for atomic batch habit creation
  type Firestore,
  type DocumentReference,
} from "firebase/firestore";
import { getFirestoreDB } from "../lib/firebase";
import { getDayGap } from "../utils/date"; // FIX: used by the corrected streak algorithm

// ─── Types ──────────────────────────────────────────────────────

export interface FireUser {
  userId: string;
  email: string;
  name: string;
  image?: string;
  language: string;
  theme: string;
  reminderEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  createdAt: string;
  isOnboarded?: boolean;
}

export interface FireHabit {
  id?: string;
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
  createdAt: string;
}

export interface FireHabitLog {
  id?: string;
  habitId: string;
  userId: string;
  logDate: string;
  status: "completed" | "missed" | "shielded";
  value?: number;
  createdAt: string;
}

export interface FireStreak {
  id?: string;
  habitId: string;
  userId: string;
  currentStreak: number;
  bestStreak: number;
  flexUsedThisMonth: number;
  lastCompletedDate?: string;
}

export interface WeeklyStats {
  tartibScore: number;
  dailyRates: { dayName: string; rate: number }[];
  habitBreakdown: {
    habitId: string;
    name: string;
    icon: string;
    color: string;
    completionRate: number;
  }[];
}

export interface MonthlyStats {
  tartibScore: number;
  weeklyRates: { week: number; rate: number }[];
  habitBreakdown: {
    habitId: string;
    name: string;
    icon: string;
    color: string;
    completionRate: number;
  }[];
}

// ─── Collections ─────────────────────────────────────────────────

function getDb(): Firestore {
  return getFirestoreDB();
}

// ─── Users ───────────────────────────────────────────────────────

export async function syncUser(data: {
  userId: string;
  email: string;
  name: string;
  image?: string;
  language?: string;
}): Promise<void> {
  const db = getDb();
  const ref = doc(db, "users", data.userId);
  const snap = await getDoc(ref);

  const now = new Date().toISOString();

  if (snap.exists()) {
    await updateDoc(ref, {
      email: data.email,
      name: data.name,
      image: data.image ?? snap.data().image ?? "",
      language: data.language ?? snap.data().language ?? "uz",
      updatedAt: now,
    });
  } else {
    await setDoc(ref, {
      userId: data.userId,
      email: data.email,
      name: data.name,
      image: data.image ?? "",
      language: data.language ?? "uz",
      theme: "dark",
      reminderEnabled: true,
      quietHoursStart: "22:00",
      quietHoursEnd: "07:00",
      createdAt: now,
    });
  }
}

export async function getUser(userId: string): Promise<FireUser | null> {
  const db = getDb();
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as FireUser;
}

export async function checkIsUserOnboarded(userId: string): Promise<boolean> {
  const db = getDb();

  // 1. Check if user document has isOnboarded flag
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const data = userSnap.data() as FireUser;
    if (data.isOnboarded === true) {
      return true;
    }
  }

  // 2. Backward compatibility: Check if they have at least one habit
  const habitsQuery = query(
    collection(db, "habits"),
    where("userId", "==", userId),
    where("isArchived", "==", false),
  );
  const habitsSnap = await getDocs(habitsQuery);
  if (!habitsSnap.empty) {
    return true;
  }

  return false;
}

export async function updateUserProfile(
  userId: string,
  data: Partial<FireUser>,
): Promise<void> {
  const db = getDb();
  const ref = doc(db, "users", userId);
  await updateDoc(ref, { ...data, updatedAt: new Date().toISOString() });
}

// ─── Habits ──────────────────────────────────────────────────────

export async function createHabit(
  data: Omit<FireHabit, "id" | "createdAt"> & { id?: string },
): Promise<string> {
  const db = getDb();
  const docId = data.id || doc(collection(db, "habits")).id;
  const ref = doc(db, "habits", docId);
  await setDoc(ref, {
    ...data,
    id: docId,
    createdAt: new Date().toISOString(),
  });
  return docId;
}

// FIX: was a sequential addDoc loop — if any write failed, only some
// habits existed in Firestore. writeBatch makes it all-or-nothing.
export async function createBatchHabits(
  habits: Omit<FireHabit, "id" | "createdAt">[],
): Promise<string[]> {
  const db = getDb();
  const batch = writeBatch(db);
  const refs = habits.map(() => doc(collection(db, "habits")));

  const now = new Date().toISOString();
  refs.forEach((ref, i) => {
    batch.set(ref, { ...habits[i], createdAt: now });
  });

  await batch.commit();
  return refs.map((r) => r.id);
}

export async function getHabitsForDate(
  userId: string,
  date: string,
): Promise<
  (FireHabit & {
    log?: FireHabitLog | null;
    streak?: FireStreak | null;
  })[]
> {
  const db = getDb();

  const habitsQuery = query(
    collection(db, "habits"),
    where("userId", "==", userId),
    where("isArchived", "==", false),
    orderBy("sortOrder"),
  );
  const habitSnap = await getDocs(habitsQuery);
  const habits = habitSnap.docs.map((d) => ({
    ...(d.data() as FireHabit),
    id: d.id,
  }));

  const logsQuery = query(
    collection(db, "habitLogs"),
    where("userId", "==", userId),
    where("logDate", "==", date),
  );
  const logSnap = await getDocs(logsQuery);
  const logMap = new Map<string, FireHabitLog>();
  logSnap.docs.forEach((d) => {
    const log = d.data() as FireHabitLog;
    logMap.set(log.habitId, { ...log, id: d.id });
  });

  const streakQuery = query(
    collection(db, "streaks"),
    where("userId", "==", userId),
  );
  const streakSnap = await getDocs(streakQuery);
  const streakMap = new Map<string, FireStreak>();
  streakSnap.docs.forEach((d) => {
    const s = d.data() as FireStreak;
    streakMap.set(s.habitId, { ...s, id: d.id });
  });

  return habits.map((h) => ({
    ...h,
    log: logMap.get(h.id!) ?? null,
    streak: streakMap.get(h.id!) ?? null,
  }));
}

export async function updateHabit(
  habitId: string,
  data: Partial<FireHabit>,
): Promise<void> {
  const db = getDb();
  const ref = doc(db, "habits", habitId);
  await updateDoc(ref, data);
}

export async function deleteHabit(habitId: string): Promise<void> {
  const db = getDb();
  await deleteDoc(doc(db, "habits", habitId));
}

// ─── Habit Logs ──────────────────────────────────────────────────

export async function upsertLog(data: {
  habitId: string;
  userId: string;
  logDate: string;
  status: "completed" | "missed" | "shielded";
  value?: number;
}): Promise<void> {
  const db = getDb();
  const logId = `${data.habitId}_${data.logDate}`;
  const ref = doc(db, "habitLogs", logId);

  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { status: data.status, value: data.value ?? null });
  } else {
    await setDoc(ref, {
      ...data,
      id: logId,
      createdAt: new Date().toISOString(),
    });
  }

  await recalculateStreak(data.habitId, data.userId);
}

// FIX: the previous implementation counted consecutive completed log
// documents rather than consecutive calendar days, so a gap of several
// days was treated as an unbroken streak as long as no "missed" log
// documents existed for those days.  The rewrite mirrors the
// streakEngine.ts algorithm: sort completed dates ascending, walk them
// checking getDayGap between each pair, and apply the same monthly-flex
// (3 forgiveness days per month) rule used on the client.
async function recalculateStreak(
  habitId: string,
  userId: string,
): Promise<void> {
  const db = getDb();

  const logsQuery = query(
    collection(db, "habitLogs"),
    where("habitId", "==", habitId),
    orderBy("logDate", "asc"),
  );
  const logSnap = await getDocs(logsQuery);

  // Keep only completed entries — missing log docs mean the user never
  // logged that day, which is implicitly a break (or flex) in the streak.
  const completedDates = logSnap.docs
    .map((d) => d.data() as FireHabitLog)
    .filter((l) => l.status === "completed")
    .map((l) => l.logDate);
  // Already sorted ascending by the orderBy above.

  let currentStreak = 0;
  let bestStreak = 0;
  let flexUsedThisMonth = 0;
  let lastCompletedDate: string | undefined;

  for (let i = 0; i < completedDates.length; i++) {
    const date = completedDates[i];

    if (i === 0) {
      currentStreak = 1;
      bestStreak = 1;
      lastCompletedDate = date;
      continue;
    }

    const prev = completedDates[i - 1];

    // Reset monthly flex allowance when we cross into a new month.
    if (prev.substring(0, 7) !== date.substring(0, 7)) {
      flexUsedThisMonth = 0;
    }

    const gap = getDayGap(prev, date);

    if (gap === 1) {
      // Consecutive day — extend streak.
      currentStreak += 1;
    } else if (gap > 1) {
      if (flexUsedThisMonth < 3) {
        // Use a flex save to bridge the gap.
        flexUsedThisMonth += 1;
        currentStreak += 1;
      } else {
        // Streak broken; flex exhausted.
        currentStreak = 1;
        flexUsedThisMonth = 0;
      }
    }
    // gap === 0: duplicate date entry — skip silently.

    bestStreak = Math.max(bestStreak, currentStreak);
    lastCompletedDate = date;
  }

  const streakId = `streak_${habitId}`;
  const streakRef = doc(db, "streaks", streakId);
  const streakSnap = await getDoc(streakRef);

  const streakData: FireStreak = {
    habitId,
    userId,
    currentStreak,
    bestStreak,
    flexUsedThisMonth,
    lastCompletedDate,
  };

  if (streakSnap.exists()) {
    await updateDoc(streakRef, { ...streakData });
  } else {
    await setDoc(streakRef, { ...streakData, id: streakId });
  }
}

// ─── Stats ───────────────────────────────────────────────────────

// FIX (getWeeklyStats): the original fired one Firestore query per day
// of the week AND one per habit for the breakdown — up to ~14 round
// trips.  The rewrite fetches habits once and all logs for the date
// range in a single query, then aggregates entirely in memory.
export async function getWeeklyStats(
  userId: string,
  startDate: string,
  endDate: string,
): Promise<WeeklyStats> {
  const db = getDb();

  // One query for all habits.
  const habitsSnap = await getDocs(
    query(
      collection(db, "habits"),
      where("userId", "==", userId),
      where("isArchived", "==", false),
    ),
  );
  const habits = habitsSnap.docs.map((d) => ({
    ...(d.data() as FireHabit),
    id: d.id,
  }));

  // One query for all logs in the week range.
  const logsSnap = await getDocs(
    query(
      collection(db, "habitLogs"),
      where("userId", "==", userId),
      where("logDate", ">=", startDate),
      where("logDate", "<=", endDate),
    ),
  );
  const logs = logsSnap.docs.map((d) => d.data() as FireHabitLog);

  // Build lookup maps for in-memory aggregation.
  const logsByDate = new Map<string, FireHabitLog[]>();
  const logsByHabit = new Map<string, FireHabitLog[]>();
  for (const log of logs) {
    if (!logsByDate.has(log.logDate)) logsByDate.set(log.logDate, []);
    logsByDate.get(log.logDate)!.push(log);

    if (!logsByHabit.has(log.habitId)) logsByHabit.set(log.habitId, []);
    logsByHabit.get(log.habitId)!.push(log);
  }

  const dayNames = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
  const dailyRates: WeeklyStats["dailyRates"] = [];

  // Iterate using UTC midnight strings so date arithmetic is stable.
  const start = new Date(startDate + "T00:00:00Z");
  const end = new Date(endDate + "T00:00:00Z");
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    const dayLogs = logsByDate.get(dateStr) ?? [];
    const completed = dayLogs.filter((l) => l.status === "completed").length;
    const rate =
      dayLogs.length > 0 ? Math.round((completed / dayLogs.length) * 100) : 0;
    dailyRates.push({ dayName: dayNames[d.getUTCDay()], rate });
  }

  const habitBreakdown: WeeklyStats["habitBreakdown"] = habits.map((habit) => {
    const habitLogs = logsByHabit.get(habit.id!) ?? [];
    const completed = habitLogs.filter((l) => l.status === "completed").length;
    const rate =
      habitLogs.length > 0
        ? Math.round((completed / habitLogs.length) * 100)
        : 0;
    return {
      habitId: habit.id!,
      name: habit.name,
      icon: habit.icon,
      color: habit.color,
      completionRate: rate,
    };
  });

  const totalRate = dailyRates.reduce((s, d) => s + d.rate, 0);
  const tartibScore =
    dailyRates.length > 0 ? Math.round(totalRate / dailyRates.length) : 0;

  return { tartibScore, dailyRates, habitBreakdown };
}

// FIX (getMonthlyStats): same problem as getWeeklyStats — was firing
// one query per day of the month plus one per habit.  Now: two queries
// total (habits + logs for the month), aggregated in memory.
export async function getMonthlyStats(
  userId: string,
  year: number,
  month: number,
): Promise<MonthlyStats> {
  const db = getDb();

  const monthStr = `${year}-${String(month).padStart(2, "0")}`;
  const daysInMonth = new Date(year, month, 0).getDate();
  const startDate = `${monthStr}-01`;
  const endDate = `${monthStr}-${String(daysInMonth).padStart(2, "0")}`;

  // One query for all habits.
  const habitsSnap = await getDocs(
    query(
      collection(db, "habits"),
      where("userId", "==", userId),
      where("isArchived", "==", false),
    ),
  );
  const habits = habitsSnap.docs.map((d) => ({
    ...(d.data() as FireHabit),
    id: d.id,
  }));

  // One query for all logs in the month.
  const logsSnap = await getDocs(
    query(
      collection(db, "habitLogs"),
      where("userId", "==", userId),
      where("logDate", ">=", startDate),
      where("logDate", "<=", endDate),
    ),
  );
  const logs = logsSnap.docs.map((d) => d.data() as FireHabitLog);

  // Build lookup maps.
  const logsByDay = new Map<number, FireHabitLog[]>();
  const logsByHabit = new Map<string, FireHabitLog[]>();
  for (const log of logs) {
    const day = parseInt(log.logDate.split("-")[2], 10);
    if (!logsByDay.has(day)) logsByDay.set(day, []);
    logsByDay.get(day)!.push(log);

    if (!logsByHabit.has(log.habitId)) logsByHabit.set(log.habitId, []);
    logsByHabit.get(log.habitId)!.push(log);
  }

  const weeksInMonth = 4;
  const weeklyRates: MonthlyStats["weeklyRates"] = [];

  for (let w = 1; w <= weeksInMonth; w++) {
    const startDay = (w - 1) * 7 + 1;
    const endDay = Math.min(w * 7, daysInMonth);
    let totalLogs = 0;
    let totalCompleted = 0;

    for (let d = startDay; d <= endDay; d++) {
      const dayLogs = logsByDay.get(d) ?? [];
      totalLogs += dayLogs.length;
      totalCompleted += dayLogs.filter((l) => l.status === "completed").length;
    }

    const rate =
      totalLogs > 0 ? Math.round((totalCompleted / totalLogs) * 100) : 0;
    weeklyRates.push({ week: w, rate });
  }

  const habitBreakdown: MonthlyStats["habitBreakdown"] = habits.map((habit) => {
    const habitLogs = logsByHabit.get(habit.id!) ?? [];
    const completed = habitLogs.filter((l) => l.status === "completed").length;
    const rate =
      habitLogs.length > 0
        ? Math.round((completed / habitLogs.length) * 100)
        : 0;
    return {
      habitId: habit.id!,
      name: habit.name,
      icon: habit.icon,
      color: habit.color,
      completionRate: rate,
    };
  });

  const totalRate = weeklyRates.reduce((s, w) => s + w.rate, 0);
  const tartibScore =
    weeklyRates.length > 0 ? Math.round(totalRate / weeklyRates.length) : 0;

  return { tartibScore, weeklyRates, habitBreakdown };
}

// ─── Delete Account ──────────────────────────────────────────────

async function deleteDocs(db: Firestore, refs: DocumentReference[]) {
  for (let i = 0; i < refs.length; i += 500) {
    const batch = writeBatch(db);
    refs.slice(i, i + 500).forEach((r) => batch.delete(r));
    await batch.commit();
  }
}

export async function deleteUserAccount(userId: string): Promise<void> {
  const db = getDb();

  const habitsQuery = query(
    collection(db, "habits"),
    where("userId", "==", userId),
  );
  const habitSnap = await getDocs(habitsQuery);
  const habitRefs = habitSnap.docs.map((d) => d.ref);

  const logsQuery = query(
    collection(db, "habitLogs"),
    where("userId", "==", userId),
  );
  const logSnap = await getDocs(logsQuery);
  const logRefs = logSnap.docs.map((d) => d.ref);

  const streakQuery = query(
    collection(db, "streaks"),
    where("userId", "==", userId),
  );
  const streakSnap = await getDocs(streakQuery);
  const streakRefs = streakSnap.docs.map((d) => d.ref);

  await deleteDocs(db, [...habitRefs, ...logRefs, ...streakRefs]);

  await deleteDoc(doc(db, "users", userId));
}
