/**
 * Pure date helpers for the month grid. No external dependencies, no
 * timezone surprises: everything works on local calendar dates.
 */

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const WEEKDAY_SHORT = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;
export const WEEKDAY_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const MIN_YEAR = 2024;
export const MAX_YEAR = 2030;

export interface MonthKey {
  /** Full year, e.g. 2026 */
  year: number;
  /** Zero-based month, 0 = January */
  month: number;
}

export interface DayCell {
  /** ISO key `YYYY-MM-DD` — stable React key and festival lookup key */
  key: string;
  date: Date;
  day: number;
  weekday: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSunday: boolean;
}

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function toISODate(year: number, month: number, day: number): string {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function addMonths({ year, month }: MonthKey, delta: number): MonthKey {
  const d = new Date(year, month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

export function clampYear(year: number): number {
  return Math.min(MAX_YEAR, Math.max(MIN_YEAR, year));
}

export function monthLabel({ year, month }: MonthKey): string {
  return `${MONTH_NAMES[month]} ${year}`;
}

export function formatLongDate(date: Date): string {
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Builds a 7-column grid starting on Sunday, padded with leading/trailing
 * days from the adjacent months. Uses as many full weeks as the month needs
 * (5 or 6 rows) so there is never a row made only of filler days.
 */
export function buildMonthGrid({ year, month }: MonthKey, today = new Date()): DayCell[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const total = firstWeekday + daysInMonth(year, month);
  const cellCount = Math.ceil(total / 7) * 7;
  const cells: DayCell[] = [];

  for (let i = 0; i < cellCount; i++) {
    const date = new Date(year, month, 1 - firstWeekday + i);
    const weekday = date.getDay();
    cells.push({
      key: toISODate(date.getFullYear(), date.getMonth(), date.getDate()),
      date,
      day: date.getDate(),
      weekday,
      isCurrentMonth: date.getMonth() === month,
      isToday: isSameDay(date, today),
      isSunday: weekday === 0,
    });
  }
  return cells;
}

export function countSundays(year: number, month: number): number {
  const total = daysInMonth(year, month);
  let count = 0;
  for (let d = 1; d <= total; d++) {
    if (new Date(year, month, d).getDay() === 0) count++;
  }
  return count;
}
