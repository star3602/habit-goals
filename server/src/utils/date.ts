export function todayUtcDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addUtcDays(date: string, days: number): string {
  const current = new Date(`${date}T00:00:00.000Z`);
  current.setUTCDate(current.getUTCDate() + days);
  return current.toISOString().slice(0, 10);
}

// Streak is calculated backwards from today. A past streak that does not include
// today intentionally returns 0 because the current streak is broken.
export function calculateCurrentStreak(dates: string[], today = todayUtcDate()): number {
  const dateSet = new Set(dates);
  let cursor = today;
  let streak = 0;

  while (dateSet.has(cursor)) {
    streak += 1;
    cursor = addUtcDays(cursor, -1);
  }

  return streak;
}
