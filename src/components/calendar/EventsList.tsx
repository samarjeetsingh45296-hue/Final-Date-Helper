"use client";

import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MAX_YEAR, MIN_YEAR, MONTH_NAMES, WEEKDAY_LONG } from "@/lib/calendar";
import { CATEGORY_LABEL, daysUntil, getFestivalsForYear, type Festival } from "@/lib/festivals";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { ChevronLeft, ChevronRight, ChevronUp } from "@/components/ui/icons";
import FestivalBadge from "./FestivalBadge";

interface EventsListProps {
  year: number;
}

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function todayIso(d: Date): string {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${d.getFullYear()}-${m < 10 ? "0" : ""}${m}-${day < 10 ? "0" : ""}${day}`;
}

/* -------------------------------------------------------------------------- */
/*  Timeline entry                                                            */
/* -------------------------------------------------------------------------- */

function Entry({
  festival,
  state,
  daysAway,
  index,
  reduceMotion,
}: {
  festival: Festival;
  state: "past" | "next" | "future";
  daysAway: number | null;
  index: number;
  reduceMotion: boolean;
}) {
  const [y, m, d] = festival.date.split("-").map(Number);
  const weekday = WEEKDAY_LONG[new Date(y, m - 1, d).getDay()];
  const isNext = state === "next";
  const isPast = state === "past";

  return (
    <li
      className={`group relative grid grid-cols-[3.25rem_1fr] gap-x-4 pb-8 transition-opacity duration-300 last:pb-2 sm:grid-cols-[4rem_1fr] sm:gap-x-6 ${
        isPast ? "opacity-55 hover:opacity-100" : ""
      }`}
    >
      {/* Node on the line */}
      <div className={`relative flex justify-center ${reduceMotion ? "" : "animate-fade-in"}`} style={reduceMotion ? undefined : { animationDelay: `${Math.min(index, 6) * 60}ms` }}>
        <span
          className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-full text-xl ring-4 ring-canvas transition-transform duration-300 group-hover:scale-110 sm:h-12 sm:w-12 sm:text-2xl ${
            isNext
              ? "bg-fest text-white shadow-[0_10px_24px_-8px_var(--color-fest)]"
              : isPast
                ? "bg-surface-2 grayscale"
                : "bg-surface shadow-card"
          }`}
        >
          {isNext && !reduceMotion && (
            <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-fest/40" />
          )}
          <span aria-hidden>{festival.icon}</span>
        </span>
      </div>

      {/* Content */}
      <div className={`min-w-0 pt-1 ${reduceMotion ? "" : "animate-fade-in"}`} style={reduceMotion ? undefined : { animationDelay: `${Math.min(index, 6) * 60 + 40}ms` }}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Link
            href={`/?y=${y}&m=${m}`}
            title="Open this month on the calendar"
            className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3 transition-colors hover:text-accent"
          >
            {weekday} · {d} {MONTH_NAMES[m - 1]} {y}
          </Link>
          {isNext && daysAway !== null && (
            <span className="rounded-full bg-fest px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-white">
              Next up · {daysAway === 0 ? "today" : daysAway === 1 ? "tomorrow" : `in ${daysAway} days`}
            </span>
          )}
          {isPast && <span className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-ink-3">Passed</span>}
        </div>

        <h3 className="mt-1 text-[19px] font-semibold tracking-[-0.015em] text-ink sm:text-[22px]">
          {festival.name}
        </h3>

        <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-ink-2">{festival.description}</p>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <FestivalBadge tone={festival.category} size="md">
            {CATEGORY_LABEL[festival.category]}
          </FestivalBadge>
          {festival.isHoliday && (
            <FestivalBadge tone="holiday" size="md">
              Public holiday
            </FestivalBadge>
          )}
          {festival.isApproximate && (
            <FestivalBadge tone="approx" size="md" title="Lunar date — may vary by a day regionally">
              Lunar date
            </FestivalBadge>
          )}
        </div>
      </div>
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/*  Today marker                                                              */
/* -------------------------------------------------------------------------- */

function TodayMarker({ iso }: { iso: string }) {
  const [y, m, d] = iso.split("-").map(Number);
  return (
    <li className="relative grid grid-cols-[3.25rem_1fr] items-center gap-x-4 pb-8 sm:grid-cols-[4rem_1fr] sm:gap-x-6">
      <div className="relative flex justify-center">
        <span className="relative z-10 flex h-4 w-4 items-center justify-center rounded-full bg-accent ring-4 ring-canvas">
          <span className="absolute inset-0 animate-ping rounded-full bg-accent/50" />
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
          Today · {WEEKDAY_LONG[new Date(y, m - 1, d).getDay()]}, {d} {MONTH_NAMES[m - 1]} {y}
        </span>
        <span className="h-px flex-1 bg-gradient-to-r from-accent/60 to-transparent" />
      </div>
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/*  Back to top                                                               */
/* -------------------------------------------------------------------------- */

function BackToTop({ reduceMotion }: { reduceMotion: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })}
          aria-label="Back to top"
          title="Back to top"
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.9 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
          className="print-hide fixed bottom-5 right-5 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface/90 text-ink-2 shadow-pop backdrop-blur-sm transition-colors hover:border-accent/50 hover:text-accent sm:bottom-6 sm:right-6"
        >
          <ChevronUp className="h-4 w-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function EventsList({ year }: EventsListProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => {
    queueMicrotask(() => setToday(new Date()));
  }, []);
  const todayKey = today ? todayIso(today) : null;

  const festivals = getFestivalsForYear(year);
  const holidays = festivals.filter((f) => f.isHoliday).length;
  const nextId = todayKey ? (festivals.find((f) => f.date >= todayKey)?.id ?? null) : null;
  const passed = todayKey ? festivals.filter((f) => f.date < todayKey).length : 0;

  const months = MONTH_NAMES.map((name, i) => ({
    name,
    index: i,
    items: festivals.filter((f) => Number(f.date.slice(5, 7)) - 1 === i),
  }));
  const maxPerMonth = Math.max(...months.map((x) => x.items.length), 1);
  const currentMonth = today && today.getFullYear() === year ? today.getMonth() : -1;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-24 pt-6 sm:px-6 sm:pt-8">
      {/* Top bar */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <Link
          href={`/?y=${year}&m=${currentMonth >= 0 ? currentMonth + 1 : 1}`}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-[13px] font-semibold text-ink-2 shadow-card transition-[border-color,color] hover:border-line-strong hover:text-ink"
        >
          <ChevronLeft className="h-4 w-4" />
          Calendar
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href={`/events?y=${year - 1}`}
            aria-disabled={year <= MIN_YEAR}
            aria-label="Previous year"
            className={`flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-ink-2 shadow-card transition-[border-color,color] hover:border-line-strong hover:text-ink ${
              year <= MIN_YEAR ? "pointer-events-none opacity-30" : ""
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <span className="min-w-[4.5rem] text-center text-[15px] font-semibold tabular-nums text-ink">{year}</span>
          <Link
            href={`/events?y=${year + 1}`}
            aria-disabled={year >= MAX_YEAR}
            aria-label="Next year"
            className={`flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-ink-2 shadow-card transition-[border-color,color] hover:border-line-strong hover:text-ink ${
              year >= MAX_YEAR ? "pointer-events-none opacity-30" : ""
            }`}
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 flex flex-col gap-6 sm:mt-14 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fest-strong">Festival timeline</p>
          <h1 className="mt-2 text-[56px] font-semibold leading-none tracking-[-0.04em] text-ink sm:text-[88px]">
            {year}
          </h1>
        </div>
        <dl className="flex gap-8 sm:pb-2">
          {[
            ["Festivals", festivals.length],
            ["Public holidays", holidays],
            ["Passed", passed],
          ].map(([label, value]) => (
            <div key={String(label)}>
              <dd className="text-[26px] font-semibold leading-none tabular-nums tracking-tight text-ink">{value}</dd>
              <dt className="mt-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">{label}</dt>
            </div>
          ))}
        </dl>
      </motion.section>

      {/* Year strip: one bar per month, height = number of festivals */}
      <motion.nav
        aria-label="Jump to month"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="mt-8 grid grid-cols-12 gap-1.5 sm:mt-10"
      >
        {months.map((m) => {
          const h = 10 + Math.round((m.items.length / maxPerMonth) * 30);
          const isCurrent = m.index === currentMonth;
          return (
            <a
              key={m.index}
              href={`#month-${m.index}`}
              title={`${m.name}: ${m.items.length} festival${m.items.length === 1 ? "" : "s"}`}
              className="group flex flex-col items-center gap-1.5"
            >
              <span className="flex h-10 w-full items-end">
                <motion.span
                  initial={{ height: 0 }}
                  animate={{ height: h }}
                  transition={{ delay: 0.2 + m.index * 0.03, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className={`w-full rounded-t-sm transition-colors ${
                    isCurrent ? "bg-accent" : m.items.length ? "bg-fest/70 group-hover:bg-fest" : "bg-line"
                  }`}
                />
              </span>
              <span
                className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${
                  isCurrent ? "text-accent" : "text-ink-3 group-hover:text-ink"
                }`}
              >
                {MONTH_SHORT[m.index]}
              </span>
            </a>
          );
        })}
      </motion.nav>

      {/* Timeline */}
      <div className="relative mt-12">
        {/* the line */}
        <span
          aria-hidden
          className="absolute bottom-0 left-[1.625rem] top-0 w-px bg-gradient-to-b from-transparent via-line-strong to-transparent sm:left-8"
        />

        {months.map((month) => {
          if (month.items.length === 0) return null;
          const monthPrefix = `${year}-${month.index + 1 < 10 ? "0" : ""}${month.index + 1}-`;
          const todayInMonth = todayKey?.startsWith(monthPrefix) ? todayKey : null;
          // Where the "today" marker goes: before the first festival after today
          const markerBefore = todayInMonth ? month.items.findIndex((f) => f.date > todayInMonth) : -1;

          return (
            <section key={month.index} id={`month-${month.index}`} className="scroll-mt-6">
              {/* Month marker */}
              <div className="relative grid grid-cols-[3.25rem_1fr] items-center gap-x-4 pb-6 pt-2 sm:grid-cols-[4rem_1fr] sm:gap-x-6">
                <div className="flex justify-center">
                  <span
                    className={`relative z-10 h-2.5 w-2.5 rounded-full ring-4 ring-canvas ${
                      month.index === currentMonth ? "bg-accent" : "bg-line-strong"
                    }`}
                  />
                </div>
                <div className="flex items-baseline gap-3">
                  <h2 className="text-[13px] font-semibold uppercase tracking-[0.22em] text-ink">
                    <Link href={`/?y=${year}&m=${month.index + 1}`} className="transition-colors hover:text-accent">
                      {month.name}
                    </Link>
                  </h2>
                  <span className="text-[11px] tabular-nums text-ink-3">
                    {month.items.length} {month.items.length === 1 ? "festival" : "festivals"}
                  </span>
                  <span className="h-px flex-1 bg-line" />
                </div>
              </div>

              <ul>
                {month.items.map((f, i) => {
                  const state: "past" | "next" | "future" =
                    todayKey === null ? "future" : f.id === nextId ? "next" : f.date < todayKey ? "past" : "future";
                  return (
                    <Fragment key={f.id}>
                      {todayInMonth && markerBefore === i && <TodayMarker iso={todayInMonth} />}
                      <Entry
                        festival={f}
                        state={state}
                        daysAway={today ? daysUntil(f.date, today) : null}
                        index={i}
                        reduceMotion={reduceMotion}
                      />
                    </Fragment>
                  );
                })}
                {todayInMonth && markerBefore === -1 && <TodayMarker iso={todayInMonth} />}
              </ul>
            </section>
          );
        })}

        {/* End cap */}
        <div className="relative grid grid-cols-[3.25rem_1fr] items-center gap-x-4 sm:grid-cols-[4rem_1fr] sm:gap-x-6">
          <div className="flex justify-center">
            <span className="relative z-10 h-2.5 w-2.5 rounded-full bg-line-strong ring-4 ring-canvas" />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">
            End of {year}
            {year < MAX_YEAR && (
              <>
                {" · "}
                <Link href={`/events?y=${year + 1}`} className="text-accent transition-colors hover:text-accent-strong">
                  Continue to {year + 1} →
                </Link>
              </>
            )}
          </p>
        </div>
      </div>

      <p className="mt-10 max-w-2xl text-[11.5px] leading-relaxed text-ink-3">
        Lunar festival dates follow the lunisolar calendar and may shift by a day depending on region or moon
        sighting. Click any date or month name to open it on the calendar.
      </p>

      <BackToTop reduceMotion={reduceMotion} />
    </main>
  );
}
