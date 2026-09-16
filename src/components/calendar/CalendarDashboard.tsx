"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { buildMonthGrid, MONTH_NAMES } from "@/lib/calendar";
import { getFestivalsForMonth, getFestivalsForYear, indexByDate } from "@/lib/festivals";
import { getExamEventsForMonth, type ExamEvent } from "@/lib/exams";
import { indexUserEvents, useUserEvents } from "@/lib/userEvents";
import { useCalendar } from "@/hooks/useCalendar";
import { Keyboard } from "@/components/ui/icons";
import CalendarHeader from "./CalendarHeader";
import NextUp from "./NextFestival";
import MonthNavigator from "./MonthNavigator";
import CalendarGrid from "./CalendarGrid";
import FestivalBullets from "./FestivalBullets";
import DayPopover from "./DayPopover";

const SHORTCUTS: Array<[string, string]> = [
  ["←  →", "Previous / next month"],
  ["⇧ + ←  →", "Previous / next year"],
  ["T", "Jump to today"],
  ["Swipe", "Change month on touch"],
];

type Filters = { festivals: boolean; exams: boolean; results: boolean };

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    el.isContentEditable ||
    el.getAttribute("role") === "combobox" ||
    el.getAttribute("role") === "option"
  );
}

function indexExams(events: ExamEvent[]): Map<string, ExamEvent[]> {
  const map = new Map<string, ExamEvent[]>();
  for (const e of events) {
    const arr = map.get(e.date);
    if (arr) arr.push(e);
    else map.set(e.date, [e]);
  }
  return map;
}

/** Legend item that doubles as a show/hide toggle. */
function LegendToggle({
  active,
  onToggle,
  swatch,
  label,
  count,
}: {
  active: boolean;
  onToggle: () => void;
  swatch: string;
  label: string;
  count: number;
}) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      whileTap={{ scale: 0.95 }}
      title={active ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
      className={`inline-flex items-center gap-2 rounded-lg px-2 py-1 transition-[opacity,background-color] duration-200 hover:bg-surface-2 ${
        active ? "" : "opacity-40 line-through"
      }`}
    >
      <span className={`h-3 w-3 rounded-[4px] border ${swatch}`} />
      {label}
      <span className="rounded-md bg-surface-2 px-1.5 text-[11px] font-semibold tabular-nums text-ink-3 ring-1 ring-inset ring-line">
        {count}
      </span>
    </motion.button>
  );
}

export default function CalendarDashboard() {
  const cal = useCalendar();
  const { view, today, direction, isLoading } = cal;
  const reduceMotion = useReducedMotion() ?? false;
  const [filters, setFilters] = useState<Filters>({ festivals: true, exams: true, results: true });
  const [openDay, setOpenDay] = useState<string | null>(null);
  const userEvents = useUserEvents();

  /* ----- Derived data (memoised: only recomputed when the month changes) --- */
  const festivals = useMemo(
    () => (view ? getFestivalsForMonth(view.year, view.month) : []),
    [view],
  );
  const examEvents = useMemo(
    () => (view ? getExamEventsForMonth(view.year, view.month) : []),
    [view],
  );
  const visibleFestivals = useMemo(
    () => (filters.festivals ? festivals : []),
    [festivals, filters.festivals],
  );
  const visibleExams = useMemo(
    () => examEvents.filter((e) => (e.kind === "exam" ? filters.exams : filters.results)),
    [examEvents, filters.exams, filters.results],
  );
  const festivalsByDate = useMemo(() => indexByDate(visibleFestivals), [visibleFestivals]);
  const examsByDate = useMemo(() => indexExams(visibleExams), [visibleExams]);
  const monthUserEvents = useMemo(() => {
    if (!view) return [];
    const prefix = `${view.year}-${view.month + 1 < 10 ? "0" : ""}${view.month + 1}-`;
    return userEvents.filter((u) => u.date.startsWith(prefix));
  }, [userEvents, view]);
  const userEventsByDate = useMemo(() => indexUserEvents(monthUserEvents), [monthUserEvents]);
  const deadlineCount = monthUserEvents.filter((u) => u.kind === "deadline").length;
  const cells = useMemo(
    () => (view && today ? buildMonthGrid(view, today) : []),
    [view, today],
  );

  const examCount = examEvents.filter((e) => e.kind === "exam").length;
  const resultCount = examEvents.length - examCount;
  const monthKey = view ? `${view.year}-${view.month}` : "none";
  const label = view ? `${MONTH_NAMES[view.month]} ${view.year}` : "";

  /* ----- Keyboard navigation ------------------------------------------- */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target) || openDay) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          if (e.shiftKey && view) cal.setYear(view.year - 1);
          else cal.goPrev();
          break;
        case "ArrowRight":
          e.preventDefault();
          if (e.shiftKey && view) cal.setYear(view.year + 1);
          else cal.goNext();
          break;
        case "PageUp":
          e.preventDefault();
          cal.goPrev();
          break;
        case "PageDown":
          e.preventDefault();
          cal.goNext();
          break;
        case "t":
        case "T":
        case "Home":
          e.preventDefault();
          cal.goToday();
          break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [cal, view, openDay]);

  const jumpTo = useCallback((year: number, month: number) => cal.goTo(year, month), [cal]);
  const toggle = (key: keyof Filters) => setFilters((f) => ({ ...f, [key]: !f[key] }));
  const closeDay = useCallback(() => setOpenDay(null), []);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pt-10">
      <CalendarHeader
        view={view}
        isViewingToday={cal.isViewingToday}
        onToday={cal.goToday}
        onYearChange={cal.setYear}
        onMonthChange={cal.setMonth}
        festivalCount={view ? getFestivalsForYear(view.year).length : 0}
      />

      <NextUp today={today} view={view} onJump={jumpTo} />

      {/* Calendar panel */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        aria-label="Month calendar"
        className="mt-5 rounded-3xl border border-line bg-surface/80 p-3 shadow-panel backdrop-blur-sm sm:mt-6 sm:p-5 lg:p-6"
      >
        <MonthNavigator
          view={view}
          direction={direction}
          canPrev={cal.canPrev}
          canNext={cal.canNext}
          onPrev={cal.goPrev}
          onNext={cal.goNext}
          isViewingToday={cal.isViewingToday}
          reduceMotion={reduceMotion}
        />

        <div className="mt-4 sm:mt-6">
          <CalendarGrid
            monthKey={monthKey}
            label={label}
            cells={cells}
            festivalsByDate={festivalsByDate}
            examsByDate={examsByDate}
            userEventsByDate={userEventsByDate}
            onOpenDay={setOpenDay}
            direction={direction}
            isLoading={isLoading || cells.length === 0}
            onPrev={cal.goPrev}
            onNext={cal.goNext}
            reduceMotion={reduceMotion}
          />
        </div>

        {/* Legend + filters */}
        <div className="print-hide mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-ink-2 sm:mt-5">
          <LegendToggle
            active={filters.festivals}
            onToggle={() => toggle("festivals")}
            swatch="border-fest-line bg-fest-soft"
            label="Festivals"
            count={festivals.length}
          />
          <LegendToggle
            active={filters.exams}
            onToggle={() => toggle("exams")}
            swatch="border-exam-line bg-exam-soft"
            label="Exams"
            count={examCount}
          />
          <LegendToggle
            active={filters.results}
            onToggle={() => toggle("results")}
            swatch="border-result-line bg-result-soft"
            label="Results"
            count={resultCount}
          />
          <span className="inline-flex items-center gap-2 px-2 py-1" title="Personal last dates you add">
            <span className="h-3 w-3 rounded-[4px] border border-due-line bg-due-soft" />
            Last date
            {deadlineCount > 0 && (
              <span className="rounded-md bg-surface-2 px-1.5 text-[11px] font-semibold tabular-nums text-ink-3 ring-1 ring-inset ring-line">
                {deadlineCount}
              </span>
            )}
          </span>
          <span className="inline-flex items-center gap-2 px-2 py-1" title="Personal events you add">
            <span className="h-3 w-3 rounded-[4px] border border-accent-line bg-accent-soft" />
            My event
            {monthUserEvents.length - deadlineCount > 0 && (
              <span className="rounded-md bg-surface-2 px-1.5 text-[11px] font-semibold tabular-nums text-ink-3 ring-1 ring-inset ring-line">
                {monthUserEvents.length - deadlineCount}
              </span>
            )}
          </span>
          <span className="inline-flex items-center gap-2 px-2 py-1">
            <span className="h-3 w-3 rounded-full bg-accent" />
            Today
          </span>
          <span className="ml-auto hidden items-center gap-1.5 text-ink-3 md:inline-flex">
            <Keyboard className="h-3.5 w-3.5" />
            Click a day to add · arrows or swipe to navigate
          </span>
        </div>

        {/* Bullet lists for quick tracking */}
        <FestivalBullets
          monthKey={monthKey}
          festivals={festivals}
          exams={examEvents}
          userEvents={monthUserEvents}
          showFestivals={filters.festivals}
          showExams={filters.exams}
          showResults={filters.results}
          reduceMotion={reduceMotion}
        />
      </motion.section>

      <DayPopover
        dateKey={openDay}
        festivals={openDay ? (festivalsByDate.get(openDay) ?? []) : []}
        exams={openDay ? (examsByDate.get(openDay) ?? []) : []}
        userEvents={openDay ? (userEventsByDate.get(openDay) ?? []) : []}
        onClose={closeDay}
      />

      {/* Footer */}
      <footer className="mt-10 flex flex-col gap-4 border-t border-line pt-6 text-[12px] text-ink-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="max-w-lg leading-relaxed">
          Lunar festival dates may shift by a day depending on region or moon sighting. Exam and
          result dates marked <span className="font-semibold text-ink-2">Expected</span> are
          projected from the usual schedule; always confirm with the conducting board or agency.
        </p>
        <dl className="print-hide grid grid-cols-2 gap-x-6 gap-y-1.5 sm:shrink-0">
          {SHORTCUTS.map(([keys, desc]) => (
            <div key={keys} className="flex items-center gap-2">
              <dt>
                <kbd className="rounded-md border border-line bg-surface px-1.5 py-0.5 font-sans text-[11px] font-medium text-ink-2 shadow-card">
                  {keys}
                </kbd>
              </dt>
              <dd className="whitespace-nowrap">{desc}</dd>
            </div>
          ))}
        </dl>
      </footer>
    </main>
  );
}
