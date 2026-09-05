/**
 * Streaks calculation utility (Phase 10: Post-MVP)
 * Calculates current consecutive active days, longest streak, and total active days
 * from a list of activity/dev-log timestamps. Pure and deterministic for easy testing.
 */

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  lastActiveDate: string | null;
  isActiveToday: boolean;
}

/**
 * Normalizes a Date or ISO timestamp into a YYYY-MM-DD calendar day string.
 */
export function toCalendarDay(date: Date | string | number): string {
  const d = typeof date === "object" ? date : new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Calculates day difference between two YYYY-MM-DD date strings (a - b in days).
 */
function dayDiff(dateStrA: string, dateStrB: string): number {
  const [yA, mA, dA] = dateStrA.split("-").map(Number);
  const [yB, mB, dB] = dateStrB.split("-").map(Number);
  const utcA = Date.UTC(yA, mA - 1, dA);
  const utcB = Date.UTC(yB, mB - 1, dB);
  return Math.round((utcA - utcB) / (1000 * 60 * 60 * 24));
}

/**
 * Computes streaks from timestamps against a reference date (defaults to current system time).
 */
export function calculateStreaks(
  timestamps: (Date | string | number)[],
  referenceDate: Date = new Date()
): StreakStats {
  if (timestamps.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalActiveDays: 0,
      lastActiveDate: null,
      isActiveToday: false,
    };
  }

  // Deduplicate calendar days
  const daySet = new Set<string>();
  for (const t of timestamps) {
    daySet.add(toCalendarDay(t));
  }

  // Sorted unique days descending (most recent first)
  const sortedDays = Array.from(daySet).sort((a, b) => b.localeCompare(a));
  const totalActiveDays = sortedDays.length;
  const lastActiveDate = sortedDays[0] || null;

  const todayStr = toCalendarDay(referenceDate);
  const isActiveToday = daySet.has(todayStr);

  // Determine current streak
  let currentStreak = 0;
  const diffFromToday = dayDiff(todayStr, sortedDays[0]);

  // If the last activity was today or yesterday (giving user today to maintain it)
  if (diffFromToday <= 1) {
    currentStreak = 1;
    let expectedDay = sortedDays[0];

    for (let i = 1; i < sortedDays.length; i++) {
      const prevDay = sortedDays[i];
      if (dayDiff(expectedDay, prevDay) === 1) {
        currentStreak++;
        expectedDay = prevDay;
      } else {
        break;
      }
    }
  } else {
    currentStreak = 0;
  }

  // Determine longest streak
  let longestStreak = 0;
  if (sortedDays.length > 0) {
    let streakCount = 1;
    longestStreak = 1;
    let prevDay = sortedDays[0];

    for (let i = 1; i < sortedDays.length; i++) {
      const currentDay = sortedDays[i];
      if (dayDiff(prevDay, currentDay) === 1) {
        streakCount++;
        if (streakCount > longestStreak) {
          longestStreak = streakCount;
        }
      } else {
        streakCount = 1;
      }
      prevDay = currentDay;
    }
  }

  return {
    currentStreak,
    longestStreak,
    totalActiveDays,
    lastActiveDate,
    isActiveToday,
  };
}
