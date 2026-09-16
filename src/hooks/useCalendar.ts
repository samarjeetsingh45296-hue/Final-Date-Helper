"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { addMonths, MAX_YEAR, MIN_YEAR, type MonthKey } from "@/lib/calendar";

/** +1 = moving forward in time, -1 = backwards, 0 = no directional motion */
export type Direction = 1 | -1 | 0;

/** How long the skeleton is shown while a month "loads". Kept short: data is local. */
const SWITCH_DELAY_MS = 320;
const INITIAL_DELAY_MS = 520;

export interface CalendarState {
  today: Date | null;
  view: MonthKey | null;
  direction: Direction;
  isLoading: boolean;
  canPrev: boolean;
  canNext: boolean;
  isViewingToday: boolean;
  goPrev: () => void;
  goNext: () => void;
  goToday: () => void;
  setYear: (year: number) => void;
  setMonth: (month: number) => void;
  goTo: (year: number, month: number) => void;
}

function sameMonth(a: MonthKey | null, b: MonthKey): boolean {
  return !!a && a.year === b.year && a.month === b.month;
}

function compareMonths(a: MonthKey, b: MonthKey): Direction {
  const diff = (b.year - a.year) * 12 + (b.month - a.month);
  return diff === 0 ? 0 : diff > 0 ? 1 : -1;
}

/**
 * Owns the visible month, navigation direction and loading state.
 *
 * `today` and the initial `view` are resolved on the client (after mount) so
 * that static server HTML never disagrees with the visitor's local date.
 */
export function useCalendar(): CalendarState {
  const [today, setToday] = useState<Date | null>(null);
  const [view, setView] = useState<MonthKey | null>(null);
  const [direction, setDirection] = useState<Direction>(0);
  const [isLoading, setIsLoading] = useState(true);

  const viewRef = useRef<MonthKey | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Resolve the visitor's local date after hydration. Deferred to a
    // microtask (still before paint) so the initial render stays deterministic.
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const now = new Date();
      // Deep links: ?y=2026&m=9 opens that month (m is 1-based)
      const params = new URLSearchParams(window.location.search);
      const qy = Number(params.get("y"));
      const qm = Number(params.get("m"));
      const hasLink = qy >= MIN_YEAR && qy <= MAX_YEAR && qm >= 1 && qm <= 12;
      const initial = hasLink
        ? { year: qy, month: qm - 1 }
        : { year: now.getFullYear(), month: now.getMonth() };
      viewRef.current = initial;
      setToday(now);
      setView(initial);
      timerRef.current = window.setTimeout(() => setIsLoading(false), INITIAL_DELAY_MS);
    });
    return () => {
      cancelled = true;
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const navigate = useCallback((target: MonthKey) => {
    const current = viewRef.current;
    if (!current) return;
    if (target.year < MIN_YEAR || target.year > MAX_YEAR) return;
    if (sameMonth(current, target)) return;

    setDirection(compareMonths(current, target));
    viewRef.current = target;
    setView(target);
    setIsLoading(true);

    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setIsLoading(false), SWITCH_DELAY_MS);
  }, []);

  const goPrev = useCallback(() => {
    if (viewRef.current) navigate(addMonths(viewRef.current, -1));
  }, [navigate]);

  const goNext = useCallback(() => {
    if (viewRef.current) navigate(addMonths(viewRef.current, 1));
  }, [navigate]);

  const goToday = useCallback(() => {
    const now = new Date();
    setToday(now);
    navigate({ year: now.getFullYear(), month: now.getMonth() });
  }, [navigate]);

  const setYear = useCallback(
    (year: number) => {
      if (viewRef.current) navigate({ year, month: viewRef.current.month });
    },
    [navigate],
  );

  const setMonth = useCallback(
    (month: number) => {
      if (viewRef.current) navigate({ year: viewRef.current.year, month });
    },
    [navigate],
  );

  const goTo = useCallback((year: number, month: number) => navigate({ year, month }), [navigate]);

  const canPrev = !!view && !(view.year === MIN_YEAR && view.month === 0);
  const canNext = !!view && !(view.year === MAX_YEAR && view.month === 11);
  const isViewingToday =
    !!view && !!today && view.year === today.getFullYear() && view.month === today.getMonth();

  return {
    today,
    view,
    direction,
    isLoading,
    canPrev,
    canNext,
    isViewingToday,
    goPrev,
    goNext,
    goToday,
    setYear,
    setMonth,
    goTo,
  };
}
