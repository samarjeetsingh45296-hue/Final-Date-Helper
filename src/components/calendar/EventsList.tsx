"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MAX_YEAR, MIN_YEAR, MONTH_NAMES, WEEKDAY_LONG } from "@/lib/calendar";
import { CATEGORY_LABEL, daysUntil, getFestivalsForYear } from "@/lib/festivals";
import { getExamEventsForYear, LEVEL_LABEL } from "@/lib/exams";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { ChevronLeft, ChevronRight, ChevronUp } from "@/components/ui/icons";
import FestivalBadge from "./FestivalBadge";

interface EventsListProps {
  year: number;
}

type View = "festivals" | "holidays" | "exams" | "results";
type Tone = "festival" | "exam" | "result";
type BadgeTone = React.ComponentProps<typeof FestivalBadge>["tone"];

/** One row on the timeline, whichever data set it came from */
interface Item {
  id: string;
  date: string;
  icon: string;
  name: string;
  description: string;
  tone: Tone;
  badges: Array<{ tone: BadgeTone; label: string; title?: string }>;
  /** Extra line under the date, e.g. the exam window */
  meta?: string;
}

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const VIEWS: Array<{ key: View; label: string; icon: string; tone: Tone; noun: [string, string] }> = [
  { key: "festivals", label: "Festivals", icon: "🎉", tone: "festival", noun: ["festival", "festivals"] },
  { key: "holidays", label: "Holidays", icon: "🏖️", tone: "festival", noun: ["holiday", "holidays"] },
  { key: "exams", label: "Exam dates", icon: "📝", tone: "exam", noun: ["exam", "exams"] },
  { key: "results", label: "Result dates", icon: "📊", tone: "result", noun: ["result", "results"] },
];

const TONE = {
  festival: {
    text: "text-fest-strong",
    bar: "bg-fest/70 group-hover:bg-fest",
    node: "bg-fest text-white shadow-[0_10px_24px_-8px_var(--color-fest)]",
    ping: "bg-fest/40",
    pill: "bg-fest",
    active: "bg-fest text-white shadow-[0_8px_18px_-8px_var(--color-fest)]",
  },
  exam: {
    text: "text-exam-strong",
    bar: "bg-exam/70 group-hover:bg-exam",
    node: "bg-exam text-white shadow-[0_10px_24px_-8px_var(--color-exam)]",
    ping: "bg-exam/40",
    pill: "bg-exam",
    active: "bg-exam text-white shadow-[0_8px_18px_-8px_var(--color-exam)]",
  },
  result: {
    text: "text-result-strong",
    bar: "bg-result/70 group-hover:bg-result",
    node: "bg-result text-white shadow-[0_10px_24px_-8px_var(--color-result)]",
    ping: "bg-result/40",
    pill: "bg-result",
    active: "bg-result text-white shadow-[0_8px_18px_-8px_var(--color-result)]",
  },
} as const;

function todayIso(d: Date): string {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${d.getFullYear()}-${m < 10 ? "0" : ""}${m}-${day < 10 ? "0" : ""}${day}`;
}

/* -------------------------------------------------------------------------- */
/*  Data → timeline items                                                     */
/* -------------------------------------------------------------------------- */

function buildItems(year: number, view: View): Item[] {
  if (view === "festivals" || view === "holidays") {
    return getFestivalsForYear(year)
      .filter((f) => (view === "holidays" ? f.isHoliday : true))
      .map((f) => ({
        id: f.id,
        date: f.date,
        icon: f.icon,
        name: f.name,
        description: f.description,
        tone: "festival" as const,
        badges: [
          { tone: f.category, label: CATEGORY_LABEL[f.category] },
          ...(f.isHoliday ? [{ tone: "holiday" as const, label: "Public holiday" }] : []),
          ...(f.isApproximate
            ? [{ tone: "approx" as const, label: "Lunar date", title: "May vary by a day regionally" }]
            : []),
        ],
      }));
  }

  const kind = view === "exams" ? "exam" : "result";
  return getExamEventsForYear(year)
    .filter((e) => e.kind === kind && !e.name.endsWith(" ends"))
    .map((e) => ({
      id: e.id,
      date: e.date,
      icon: e.icon,
      name: e.name.replace(/ begins$/, ""),
      description: e.description,
      tone: kind,
      meta: e.window ? `Exam window · ${e.window}` : undefined,
      badges: [
        { tone: kind, label: e.org },
        { tone: "approx" as const, label: LEVEL_LABEL[e.level] },
        ...(e.status === "expected"
          ? [{ tone: "approx" as const, label: "Expected", title: "Projected — verify with the conducting body" }]
          : [{ tone: "holiday" as const, label: "Confirmed" }]),
      ],
    }));
}

/* -------------------------------------------------------------------------- */
/*  Timeline entry                                                            */
/* -------------------------------------------------------------------------- */

function Entry({
  item,
  state,
  daysAway,
  index,
  reduceMotion,
}: {
  item: Item;
  state: "past" | "next" | "future";
  daysAway: number | null;
  index: number;
  reduceMotion: boolean;
}) {
  const [y, m, d] = item.date.split("-").map(Number);
  const weekday = WEEKDAY_LONG[new Date(y, m - 1, d).getDay()];
  const isNext = state === "next";
  const isPast = state === "past";
  const t = TONE[item.tone];
  const delay = `${Math.min(index, 6) * 60}ms`;

  return (
    <li
      className={`group relative grid grid-cols-[3.25rem_1fr] gap-x-4 pb-8 transition-opacity duration-300 last:pb-2 sm:grid-cols-[4rem_1fr] sm:gap-x-6 ${
        isPast ? "opacity-55 hover:opacity-100" : ""
      }`}
    >
      {/* Node on the line */}
      <div className={`relative flex justify-center ${reduceMotion ? "" : "animate-fade-in"}`} style={reduceMotion ? undefined : { animationDelay: delay }}>
        <span
          className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-full text-xl ring-4 ring-canvas transition-transform duration-300 group-hover:scale-110 sm:h-12 sm:w-12 sm:text-2xl ${
            isNext ? t.node : isPast ? "bg-surface-2 grayscale" : "bg-surface shadow-card"
          }`}
        >
          {isNext && !reduceMotion && <span className={`absolute inset-0 -z-10 animate-ping rounded-full ${t.ping}`} />}
          <span aria-hidden>{item.icon}</span>
        </span>
      </div>

      {/* Content */}
      <div className={`min-w-0 pt-1 ${reduceMotion ? "" : "animate-fade-in"}`} style={reduceMotion ? undefined : { animationDelay: delay }}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Link
            href={`/?y=${y}&m=${m}`}
            title="Open this month on the calendar"
            className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3 transition-colors hover:text-accent"
          >
            {weekday} · {d} {MONTH_NAMES[m - 1]} {y}
          </Link>
          {isNext && daysAway !== null && (
            <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-white ${t.pill}`}>
              Next up · {daysAway === 0 ? "today" : daysAway === 1 ? "tomorrow" : `in ${daysAway} days`}
            </span>
          )}
          {isPast && <span className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-ink-3">Passed</span>}
        </div>

        <h3 className="mt-1 text-[19px] font-semibold tracking-[-0.015em] text-ink sm:text-[22px]">{item.name}</h3>
        {item.meta && <p className={`mt-0.5 text-[12px] font-medium ${t.text}`}>{item.meta}</p>}
        <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-ink-2">{item.description}</p>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {item.badges.map((b, i) => (
            <FestivalBadge key={i} tone={b.tone} size="md" title={b.title}>
              {b.label}
            </FestivalBadge>
          ))}
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
  const [view, setView] = useState<View>("festivals");
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => {
    queueMicrotask(() => setToday(new Date()));
  }, []);
  const todayKey = today ? todayIso(today) : null;

  const items = useMemo(() => buildItems(year, view), [year, view]);
  const meta = VIEWS.find((v) => v.key === view)!;
  const t = TONE[meta.tone];

  const nextId = todayKey ? (items.find((i) => i.date >= todayKey)?.id ?? null) : null;
  const passed = todayKey ? items.filter((i) => i.date < todayKey).length : 0;
  const upcoming = items.length - passed;

  const months = MONTH_NAMES.map((name, i) => ({
    name,
    index: i,
    items: items.filter((it) => Number(it.date.slice(5, 7)) - 1 === i),
  }));
  const maxPerMonth = Math.max(...months.map((x) => x.items.length), 1);
  const currentMonth = today && today.getFullYear() === year ? today.getMonth() : -1;

  const counts = useMemo(
    () => Object.fromEntries(VIEWS.map((v) => [v.key, buildItems(year, v.key).length])) as Record<View, number>,
    [year],
  );

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
          <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${t.text}`}>
            {view === "exams" ? "Exam timeline" : view === "results" ? "Result timeline" : view === "holidays" ? "Holiday timeline" : "Festival timeline"}
          </p>
          <h1 className="mt-2 text-[56px] font-semibold leading-none tracking-[-0.04em] text-ink sm:text-[88px]">{year}</h1>
        </div>
        <dl className="flex gap-8 sm:pb-2">
          {[
            [meta.noun[1].replace(/^./, (c) => c.toUpperCase()), items.length],
            ["Upcoming", upcoming],
            ["Passed", passed],
          ].map(([label, value]) => (
            <div key={String(label)}>
              <dd className="text-[26px] font-semibold leading-none tabular-nums tracking-tight text-ink">{value}</dd>
              <dt className="mt-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">{label}</dt>
            </div>
          ))}
        </dl>
      </motion.section>

      {/* View switch */}
      <div role="tablist" aria-label="Choose what to show" className="mt-6 flex flex-wrap gap-2">
        {VIEWS.map((v) => {
          const active = v.key === view;
          return (
            <motion.button
              key={v.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setView(v.key)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              className={`inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-[13px] font-semibold transition-[background-color,color,box-shadow] duration-200 ${
                active ? TONE[v.tone].active : "border border-line bg-surface text-ink-2 shadow-card hover:border-line-strong hover:text-ink"
              }`}
            >
              <span aria-hidden>{v.icon}</span>
              {v.label}
              <span
                className={`rounded-full px-1.5 text-[11px] font-semibold tabular-nums ${
                  active ? "bg-white/20 text-white" : "bg-surface-2 text-ink-3 ring-1 ring-inset ring-line"
                }`}
              >
                {counts[v.key]}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Year strip: one bar per month, height = number of items */}
      <motion.nav
        key={view}
        aria-label="Jump to month"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mt-8 grid grid-cols-12 gap-1.5"
      >
        {months.map((m) => {
          const h = 10 + Math.round((m.items.length / maxPerMonth) * 30);
          const isCurrent = m.index === currentMonth;
          return (
            <a
              key={m.index}
              href={`#month-${m.index}`}
              title={`${m.name}: ${m.items.length} ${m.items.length === 1 ? meta.noun[0] : meta.noun[1]}`}
              className="group flex flex-col items-center gap-1.5"
            >
              <span className="flex h-10 w-full items-end">
                <motion.span
                  initial={{ height: 0 }}
                  animate={{ height: m.items.length ? h : 4 }}
                  transition={{ delay: m.index * 0.03, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className={`w-full rounded-t-sm transition-colors ${isCurrent ? "bg-accent" : m.items.length ? t.bar : "bg-line"}`}
                />
              </span>
              <span className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${isCurrent ? "text-accent" : "text-ink-3 group-hover:text-ink"}`}>
                {MONTH_SHORT[m.index]}
              </span>
            </a>
          );
        })}
      </motion.nav>

      {/* Timeline */}
      <div key={`${view}-${year}`} className="relative mt-12">
        <span
          aria-hidden
          className="absolute bottom-0 left-[1.625rem] top-0 w-px bg-gradient-to-b from-transparent via-line-strong to-transparent sm:left-8"
        />

        {items.length === 0 && (
          <p className="pl-16 text-[13px] text-ink-2 sm:pl-20">
            No {meta.noun[1]} recorded for {year}.
          </p>
        )}

        {months.map((month) => {
          if (month.items.length === 0) return null;
          const monthPrefix = `${year}-${month.index + 1 < 10 ? "0" : ""}${month.index + 1}-`;
          const todayInMonth = todayKey?.startsWith(monthPrefix) ? todayKey : null;
          const markerBefore = todayInMonth ? month.items.findIndex((i) => i.date > todayInMonth) : -1;

          return (
            <section key={month.index} id={`month-${month.index}`} className="scroll-mt-6">
              <div className="relative grid grid-cols-[3.25rem_1fr] items-center gap-x-4 pb-6 pt-2 sm:grid-cols-[4rem_1fr] sm:gap-x-6">
                <div className="flex justify-center">
                  <span className={`relative z-10 h-2.5 w-2.5 rounded-full ring-4 ring-canvas ${month.index === currentMonth ? "bg-accent" : "bg-line-strong"}`} />
                </div>
                <div className="flex items-baseline gap-3">
                  <h2 className="text-[13px] font-semibold uppercase tracking-[0.22em] text-ink">
                    <Link href={`/?y=${year}&m=${month.index + 1}`} className="transition-colors hover:text-accent">
                      {month.name}
                    </Link>
                  </h2>
                  <span className="text-[11px] tabular-nums text-ink-3">
                    {month.items.length} {month.items.length === 1 ? meta.noun[0] : meta.noun[1]}
                  </span>
                  <span className="h-px flex-1 bg-line" />
                </div>
              </div>

              <ul>
                {month.items.map((item, i) => {
                  const state: "past" | "next" | "future" =
                    todayKey === null ? "future" : item.id === nextId ? "next" : item.date < todayKey ? "past" : "future";
                  return (
                    <Fragment key={item.id}>
                      {todayInMonth && markerBefore === i && <TodayMarker iso={todayInMonth} />}
                      <Entry
                        item={item}
                        state={state}
                        daysAway={today ? daysUntil(item.date, today) : null}
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
        Lunar festival dates may shift by a day depending on region or moon sighting. Exam and result dates marked
        Expected are projected from the usual schedule; confirm with the conducting body. Click any date or month name
        to open it on the calendar.
      </p>

      <BackToTop reduceMotion={reduceMotion} />
    </main>
  );
}
