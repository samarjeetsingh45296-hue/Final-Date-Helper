"use client";

import { motion } from "framer-motion";
import { MONTH_NAMES, WEEKDAY_LONG, WEEKDAY_SHORT, type MonthKey } from "@/lib/calendar";
import { daysUntil, describeFestivalDate, getFestivalsForMonth, getUpcomingFestival } from "@/lib/festivals";
import {
  getExamEventsForMonth,
  getMonthComparison,
  getUpcomingExam,
  getUpcomingResult,
  type MonthComparisonRow,
} from "@/lib/exams";

interface NextUpProps {
  today: Date | null;
  view: MonthKey | null;
  onJump: (year: number, month: number) => void;
}

type Tone = "festival" | "exam" | "result";

const TONE = {
  festival: {
    dot: "bg-fest shadow-[0_0_0_3px_var(--color-fest-soft)]",
    text: "text-fest-strong",
    hover: "hover:text-fest-strong",
    pill: "bg-fest-soft text-fest-strong ring-fest-line",
  },
  exam: {
    dot: "bg-exam shadow-[0_0_0_3px_var(--color-exam-soft)]",
    text: "text-exam-strong",
    hover: "hover:text-exam-strong",
    pill: "bg-exam-soft text-exam-strong ring-exam-line",
  },
  result: {
    dot: "bg-result shadow-[0_0_0_3px_var(--color-result-soft)]",
    text: "text-result-strong",
    hover: "hover:text-result-strong",
    pill: "bg-result-soft text-result-strong ring-result-line",
  },
} as const;

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function countdownLabel(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days < 0) return `${-days} days ago`;
  return `In ${days} days`;
}

/**
 * First item in the viewed month that is still to come (today or later).
 * Returns null when everything in the month has already passed.
 */
function pickUpcomingInMonth<T extends { date: string }>(items: T[], today: Date): T | null {
  const y = today.getFullYear();
  const m = today.getMonth() + 1;
  const d = today.getDate();
  const iso = `${y}-${m < 10 ? "0" : ""}${m}-${d < 10 ? "0" : ""}${d}`;
  return items.find((i) => i.date >= iso) ?? null;
}

function shortWithDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${WEEKDAY_SHORT[new Date(y, m - 1, d).getDay()]}, ${d} ${MONTH_SHORT[m - 1]}`;
}

function shiftLabel(shift: number | null): { text: string; cls: string } | null {
  if (shift === null) return null;
  if (shift === 0) return { text: "same day", cls: "text-ink-3" };
  const n = Math.abs(shift);
  return shift < 0
    ? { text: `${n} day${n === 1 ? "" : "s"} earlier`, cls: "text-fest-strong" }
    : { text: `${n} day${n === 1 ? "" : "s"} later`, cls: "text-exam-strong" };
}

/* ----- Left column: next festival / exam / result ------------------------ */

interface LineProps {
  label: string;
  icon: string;
  name: string;
  date: string;
  countdown: string;
  tone: Tone;
  expected?: boolean;
  delay: number;
  onClick: () => void;
}

function Line({ label, icon, name, date, countdown, tone, expected, delay, onClick }: LineProps) {
  const t = TONE[tone];
  const [y, m, d] = date.split("-").map(Number);
  const weekday = WEEKDAY_LONG[new Date(y, m - 1, d).getDay()];

  return (
    <motion.p
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-baseline gap-2.5 px-1 text-[12.5px] leading-snug text-ink"
    >
      <span aria-hidden className={`relative top-[-2px] h-1.5 w-1.5 shrink-0 rounded-full ${t.dot}`} />
      <button
        type="button"
        onClick={onClick}
        title="Jump to this month"
        className={`group min-w-0 rounded-md text-left transition-colors ${t.hover}`}
      >
        <span className={`text-[11px] font-semibold uppercase tracking-[0.08em] ${t.text}`}>{label}:</span>{" "}
        <span aria-hidden className="mr-1 inline-block transition-transform duration-300 group-hover:animate-wiggle">
          {icon}
        </span>
        <span className="font-semibold">{name}</span>
        <span className="text-ink-3"> — </span>
        <span className="text-ink-2">
          {weekday}, {describeFestivalDate(date)}
        </span>
        <span className={`ml-2 rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold ring-1 ring-inset ${t.pill}`}>
          {countdown}
        </span>
        {expected && (
          <span
            className="ml-1.5 rounded-md bg-surface-2 px-1.5 py-0.5 text-[10.5px] font-medium text-ink-3 ring-1 ring-inset ring-line"
            title="Projected from the usual schedule — verify with the conducting body"
          >
            Expected
          </span>
        )}
      </button>
    </motion.p>
  );
}

function Empty({ label, tone, text, delay }: { label: string; tone: Tone; text: string; delay: number }) {
  const t = TONE[tone];
  return (
    <motion.p
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-baseline gap-2.5 px-1 text-[12.5px] leading-snug text-ink-2"
    >
      <span aria-hidden className={`relative top-[-2px] h-1.5 w-1.5 shrink-0 rounded-full opacity-50 ${t.dot}`} />
      <span>
        <span className={`text-[11px] font-semibold uppercase tracking-[0.08em] ${t.text}`}>{label}:</span>{" "}
        {text}
      </span>
    </motion.p>
  );
}

/* ----- Right column: this month's exams vs the previous year ------------- */

function Status({ status }: { status: "confirmed" | "expected" }) {
  return status === "expected" ? (
    <span className="ml-1 text-[10px] font-medium text-ink-3" title="Projected — verify with the conducting body">
      exp.
    </span>
  ) : null;
}

function Window({ start, end }: { start: string; end?: string }) {
  const tail = end && end !== start ? ` → ${shortWithDay(end).split(", ")[1]}` : "";
  return (
    <>
      {shortWithDay(start)}
      {tail}
    </>
  );
}

function MonthComparison({
  view,
  rows,
  delay,
}: {
  view: MonthKey;
  rows: MonthComparisonRow[];
  delay: number;
}) {
  const month = MONTH_NAMES[view.month];
  return (
    <motion.div
      key={`${view.year}-${view.month}`}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="min-w-0 border-l border-line pl-4 sm:pl-5"
      aria-label={`Exams in ${month} ${view.year} compared with ${view.year - 1}`}
    >
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">
        Exams in {month} {view.year}
        <span className="ml-1.5 font-medium normal-case tracking-normal text-ink-3/80">
          · vs {view.year - 1}
        </span>
      </p>

      {rows.length === 0 ? (
        <p className="mt-2 text-[12px] text-ink-2">No exams scheduled this month.</p>
      ) : (
        <table className="mt-2 w-full border-separate border-spacing-y-1 text-[12px] leading-tight">
          <thead>
            <tr className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-3">
              <th scope="col" className="pr-3 text-left font-semibold">Exam</th>
              <th scope="col" className="pr-3 text-left font-semibold">{view.year - 1}</th>
              <th scope="col" className="pr-3 text-left font-semibold">{view.year}</th>
              <th scope="col" className="text-left font-semibold">Shift</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const shift = shiftLabel(r.shiftDays);
              return (
                <motion.tr
                  key={r.key}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: delay + 0.06 + i * 0.04 }}
                  className="text-ink"
                >
                  <td className="max-w-[11rem] truncate pr-3 font-semibold" title={`${r.name} · ${r.org}`}>
                    <span aria-hidden className="mr-1">{r.icon}</span>
                    {r.short}
                  </td>
                  <td className="whitespace-nowrap pr-3">
                    {r.previous ? (
                      <>
                        <span className="rounded-md bg-surface-2 px-1.5 py-0.5 font-medium text-ink-2 ring-1 ring-inset ring-line">
                          <Window start={r.previous.start} end={r.previous.end} />
                        </span>
                        <Status status={r.previous.status} />
                      </>
                    ) : (
                      <span className="text-ink-3">no data</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap pr-3">
                    <span className="rounded-md bg-exam-soft px-1.5 py-0.5 font-medium text-exam-strong ring-1 ring-inset ring-exam-line">
                      <Window start={r.current.start} end={r.current.end} />
                    </span>
                    <Status status={r.current.status} />
                  </td>
                  <td className={`whitespace-nowrap text-[11px] font-medium ${shift?.cls ?? "text-ink-3"}`}>
                    {shift?.text ?? "—"}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      )}
    </motion.div>
  );
}

/* ----- Container ----------------------------------------------------------- */

function jumpFor(date: string, onJump: NextUpProps["onJump"]) {
  return () => {
    const [y, m] = date.split("-").map(Number);
    onJump(y, m - 1);
  };
}

/** Featured festival, exam and result for the viewed month on the left; the month's exams vs last year on the right. */
export default function NextUp({ today, view, onJump }: NextUpProps) {
  if (!today || !view) return null;
  const monthFestivals = getFestivalsForMonth(view.year, view.month);
  const monthExams = getExamEventsForMonth(view.year, view.month);
  // Prefer what is still to come in the viewed month; otherwise the next one after it.
  const festival = pickUpcomingInMonth(monthFestivals, today) ?? getUpcomingFestival(today);
  const exam =
    pickUpcomingInMonth(
      monthExams.filter((e) => e.kind === "exam" && !e.name.endsWith(" ends")),
      today,
    ) ?? getUpcomingExam(today);
  const result = pickUpcomingInMonth(monthExams.filter((e) => e.kind === "result"), today) ?? getUpcomingResult(today);
  const rows = getMonthComparison(view.year, view.month);

  return (
    <div className="mt-5 grid gap-4 sm:mt-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-8">
      <div key={`${view.year}-${view.month}`} className="flex flex-col gap-1.5">
        {festival ? (
          <Line
            label="Next festival"
            icon={festival.icon}
            name={festival.name}
            date={festival.date}
            countdown={countdownLabel(daysUntil(festival.date, today))}
            tone="festival"
            delay={0.15}
            onClick={jumpFor(festival.date, onJump)}
          />
        ) : (
          <Empty label="Next festival" tone="festival" text="No upcoming festival" delay={0.15} />
        )}
        {exam ? (
          <Line
            label="Next exam"
            icon={exam.icon}
            name={exam.name}
            date={exam.date}
            countdown={countdownLabel(daysUntil(exam.date, today))}
            tone="exam"
            expected={exam.status === "expected"}
            delay={0.22}
            onClick={jumpFor(exam.date, onJump)}
          />
        ) : (
          <Empty label="Next exam" tone="exam" text="No upcoming exam" delay={0.22} />
        )}
        {result ? (
          <Line
            label="Next result"
            icon={result.icon}
            name={result.name}
            date={result.date}
            countdown={countdownLabel(daysUntil(result.date, today))}
            tone="result"
            expected={result.status === "expected"}
            delay={0.29}
            onClick={jumpFor(result.date, onJump)}
          />
        ) : (
          <Empty label="Next result" tone="result" text="No upcoming result" delay={0.29} />
        )}
      </div>

      {view && (
        <div className="overflow-x-auto">
          <MonthComparison view={view} rows={rows} delay={0.3} />
        </div>
      )}
    </div>
  );
}
