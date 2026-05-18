import { getDayGap } from "./date";

/**
 * Pure function: Flex Streak Algorithm
 * Mirrors the server-side logic exactly for instant UI updates.
 */
export interface StreakState {
  currentStreak: number;
  bestStreak: number;
  flexUsedThisMonth: number;
  lastCompletedDate: string | null;
}

export interface StreakResult extends StreakState {
  flexSaveUsed: boolean;
}

export function calcStreak(
  current: StreakState,
  logDate: string,
  status: string,
): StreakResult {
  let { currentStreak, bestStreak, flexUsedThisMonth, lastCompletedDate } =
    current;
  let flexSaveUsed = false;

  if (status !== "completed") {
    return {
      currentStreak,
      bestStreak,
      flexUsedThisMonth,
      lastCompletedDate,
      flexSaveUsed,
    };
  }

  // Monthly flex reset
  if (lastCompletedDate) {
    const lastMonth = lastCompletedDate.substring(0, 7);
    const currentMonth = logDate.substring(0, 7);
    if (lastMonth !== currentMonth) flexUsedThisMonth = 0;
  }

  if (!lastCompletedDate) {
    currentStreak = 1;
  } else if (lastCompletedDate === logDate) {
    return {
      currentStreak,
      bestStreak,
      flexUsedThisMonth,
      lastCompletedDate,
      flexSaveUsed,
    };
  } else {
    const gap = getDayGap(lastCompletedDate, logDate);
    if (gap === 1) {
      currentStreak += 1;
    } else if (gap > 1) {
      if (flexUsedThisMonth < 3) {
        flexUsedThisMonth += 1;
        currentStreak += 1;
        flexSaveUsed = true;
      } else {
        currentStreak = 1;
      }
    } else {
      return {
        currentStreak,
        bestStreak,
        flexUsedThisMonth,
        lastCompletedDate,
        flexSaveUsed,
      };
    }
  }

  bestStreak = Math.max(bestStreak, currentStreak);
  lastCompletedDate = logDate;

  return {
    currentStreak,
    bestStreak,
    flexUsedThisMonth,
    lastCompletedDate,
    flexSaveUsed,
  };
}
