import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync("ozbek_habits.db");
    await initTables(db);
  }
  return db;
}

async function initTables(database: SQLite.SQLiteDatabase) {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      serverid TEXT,
      userid TEXT,
      name TEXT NOT NULL,
      nameru TEXT,
      icon TEXT DEFAULT 'star',
      color TEXT DEFAULT '#0A84FF',
      type TEXT DEFAULT 'good',
      targettype TEXT DEFAULT 'binary',
      targetvalue INTEGER,
      frequencytype TEXT DEFAULT 'daily',
      frequencyvalue INTEGER,
      customdays TEXT,
      timeofday TEXT DEFAULT 'morning',
      remindertime TEXT,
      reminderenabled INTEGER DEFAULT 1,
      sortorder INTEGER DEFAULT 0,
      isarchived INTEGER DEFAULT 0,
      createdat TEXT,
      updatedat TEXT
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      id TEXT PRIMARY KEY,
      habitid TEXT NOT NULL,
      userid TEXT NOT NULL,
      logdate TEXT NOT NULL,
      status TEXT DEFAULT 'missed',
      value INTEGER,
      createdat TEXT,
      updatedat TEXT,
      UNIQUE(habitid, logdate)
    );

    CREATE TABLE IF NOT EXISTS streaks (
      id TEXT PRIMARY KEY,
      habitid TEXT UNIQUE NOT NULL,
      userid TEXT NOT NULL,
      currentstreak INTEGER DEFAULT 0,
      beststreak INTEGER DEFAULT 0,
      flexusedthismonth INTEGER DEFAULT 0,
      lastcompleteddate TEXT,
      updatedat TEXT
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operation TEXT NOT NULL,
      payload TEXT NOT NULL,
      createdat TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(userid, isarchived, sortorder);
    CREATE INDEX IF NOT EXISTS idx_logs_user_date ON habit_logs(userid, logdate);
    CREATE INDEX IF NOT EXISTS idx_streaks_user ON streaks(userid);
    CREATE INDEX IF NOT EXISTS idx_logs_habit ON habit_logs(habitid);
  `);
}

// === Habit CRUD ===
export async function insertHabit(habit: Record<string, unknown>) {
  const db = await getDB();
  await db.runAsync(
    `INSERT OR REPLACE INTO habits (id,serverid,userid,name,nameru,icon,color,type,targettype,targetvalue,frequencytype,timeofday,reminderenabled,sortorder,isarchived,createdat,updatedat)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      habit.id as string,
      (habit.serverId as string) ?? null,
      (habit.userId as string) ?? null,
      habit.name as string,
      (habit.nameRu as string) ?? null,
      habit.icon as string,
      habit.color as string,
      habit.type as string,
      habit.targetType as string,
      (habit.targetValue as number) ?? null,
      habit.frequencyType as string,
      habit.timeOfDay as string,
      habit.reminderEnabled ? 1 : 0,
      (habit.sortOrder as number) ?? 0,
      habit.isArchived ? 1 : 0,
      new Date().toISOString(),
      new Date().toISOString(),
    ],
  );
}

export async function getHabitsForUser(userId: string) {
  const db = await getDB();
  return db.getAllAsync(
    "SELECT * FROM habits WHERE userid = ? AND isarchived = 0 ORDER BY sortorder",
    [userId],
  );
}

export async function deleteHabit(habitId: string) {
  const db = await getDB();
  await db.runAsync("DELETE FROM habit_logs WHERE habitid = ?", [habitId]);
  await db.runAsync("DELETE FROM streaks WHERE habitid = ?", [habitId]);
  await db.runAsync("DELETE FROM habits WHERE id = ?", [habitId]);
}

// === Logs ===
export async function upsertLog(log: {
  id: string;
  habitId: string;
  userId: string;
  logDate: string;
  status: string;
  value?: number;
}) {
  const db = await getDB();
  await db.runAsync(
    `INSERT OR REPLACE INTO habit_logs (id,habitid,userid,logdate,status,value,updatedat) VALUES (?,?,?,?,?,?,?)`,
    [
      log.id,
      log.habitId,
      log.userId,
      log.logDate,
      log.status,
      log.value ?? null,
      new Date().toISOString(),
    ],
  );
}

export async function getLogsForDate(userId: string, date: string) {
  const db = await getDB();
  return db.getAllAsync(
    "SELECT * FROM habit_logs WHERE userid = ? AND logdate = ?",
    [userId, date],
  );
}

// === Streaks ===
export async function upsertStreak(streak: {
  habitId: string;
  userId: string;
  currentStreak: number;
  bestStreak: number;
  flexUsedThisMonth: number;
  lastCompletedDate?: string;
}) {
  const db = await getDB();
  await db.runAsync(
    `INSERT OR REPLACE INTO streaks (id,habitid,userid,currentstreak,beststreak,flexusedthismonth,lastcompleteddate,updatedat) VALUES (?,?,?,?,?,?,?,?)`,
    [
      streak.habitId,
      streak.habitId,
      streak.userId,
      streak.currentStreak,
      streak.bestStreak,
      streak.flexUsedThisMonth,
      streak.lastCompletedDate ?? null,
      new Date().toISOString(),
    ],
  );
}

export async function getStreak(habitId: string) {
  const db = await getDB();
  return db.getFirstAsync("SELECT * FROM streaks WHERE habitid = ?", [habitId]);
}

// === Sync Queue ===
export async function addToSyncQueue(
  operation: string,
  payload: Record<string, unknown>,
) {
  const db = await getDB();
  await db.runAsync(
    "INSERT INTO sync_queue (operation, payload) VALUES (?, ?)",
    [operation, JSON.stringify(payload)],
  );
}

export async function getSyncQueue() {
  const db = await getDB();
  return db.getAllAsync("SELECT * FROM sync_queue ORDER BY id ASC");
}

export async function clearSyncQueue() {
  const db = await getDB();
  await db.runAsync("DELETE FROM sync_queue");
}

export async function removeSyncQueueItem(id: number) {
  const db = await getDB();
  await db.runAsync("DELETE FROM sync_queue WHERE id = ?", [id]);
}

export async function clearUserData(userId: string) {
  const db = await getDB();
  await db.runAsync("DELETE FROM habit_logs WHERE userid = ?", [userId]);
  await db.runAsync("DELETE FROM streaks WHERE userid = ?", [userId]);
  await db.runAsync("DELETE FROM habits WHERE userid = ?", [userId]);
}
