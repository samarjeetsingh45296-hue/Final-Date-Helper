"use client";

import { memo } from "react";
import { motion, type Variants } from "framer-motion";
import { formatLongDate, WEEKDAY_LONG, type DayCell } from "@/lib/calendar";
import type { Festival } from "@/lib/festivals";
import type { ExamEvent } from "@/lib/exams";
import type { UserEvent } from "@/lib/userEvents";
import type { Todo } from "@/lib/todos";
import { Plus } from "@/components/ui/icons";
import FestivalBadge from "./FestivalBadge";

interface CalendarDayCardProps {
  cell: DayCell;
  festivals: Festival[];
  exams: ExamEvent[];
  userEvents: UserEvent[];
  todos: Todo[];
  onOpen: (key: string) => void;
  reduceMotion: boolean;
}

export const dayCardVariants: Variants = {
  enter: { opacity: 0, y: 14, scale: 0.92 },
  center: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 420, damping: 30, mass: 0.7 },
  },
  exit: { opacity: 0, transition: { duration: 0.12 } },
};

const CELL_SIZE =
  "min-h-[54px] xs:min-h-[64px] sm:min-h-[84px] md:min-h-[104px] lg:min-h-[118px]";

type BadgeTone = "festival" | "exam" | "result" | "due" | "note";

function CalendarDayCard({ cell, festivals, exams, userEvents, todos, onOpen, reduceMotion }: CalendarDayCardProps) {
  const festival = festivals[0];
  const exam = exams.find((e) => e.kind === "exam");
  const result = exams.find((e) => e.kind === "result");
  const deadline = userEvents.find((u) => u.kind === "deadline");
  const note = userEvents.find((u) => u.kind === "event");
  const total = festivals.length + exams.length + userEvents.length;
  const doneTodos = todos.filter((t) => t.done).length;
  const { isToday, isCurrentMonth } = cell;

  /* ----- Outside-month filler cell -------------------------------------- */
  if (!isCurrentMonth) {
    return (
      <motion.div
        variants={dayCardVariants}
        role="gridcell"
        aria-disabled
        className={`${CELL_SIZE} flex flex-col rounded-xl border border-dashed border-line/80 bg-surface-2/40 p-1.5 sm:rounded-2xl sm:p-2.5`}
      >
        <span className="text-[13px] font-medium tabular-nums text-ink-3/60 sm:text-sm">
          {cell.day}
        </span>
      </motion.div>
    );
  }

  /* ----- Visual state ----------------------------------------------------
     Base colour priority: festival > exam > result > last date > my event.
     If the box already has a festival/exam/result colour, a personal item
     does not change it — it adds a highlight ring instead.                 */
  let surface = "bg-surface border-line hover:border-line-strong";
  let number = "text-ink";
  let icon: string | null = null;
  const hasOfficial = !!(festival || exam || result);

  if (festival) {
    surface = `bg-fest-soft border-fest-line hover:border-fest/60 ${reduceMotion ? "" : "animate-festival-glow"}`;
    number = "text-fest-strong";
    icon = festival.icon;
  } else if (exam) {
    surface = "bg-exam-soft border-exam-line hover:border-exam/60";
    number = "text-exam-strong";
    icon = exam.icon;
  } else if (result) {
    surface = "bg-result-soft border-result-line hover:border-result/60";
    number = "text-result-strong";
    icon = result.icon;
  } else if (deadline) {
    surface = "bg-due-soft border-due-line hover:border-due/60";
    number = "text-due-strong";
    icon = "⏳";
  } else if (note) {
    surface = "bg-accent-soft border-accent-line hover:border-accent/60";
    number = "text-accent";
    icon = "📌";
  }

  /** Highlight ring when a personal item sits on an already-coloured day */
  const highlight = hasOfficial && userEvents.length > 0 ? (deadline ? "ring-due" : "ring-accent") : null;

  /* Badges: primary items first, then personal ones; show two, count the rest */
  const badges: Array<{ key: string; tone: BadgeTone; label: string; title: string }> = [];
  if (festival) badges.push({ key: festival.id, tone: "festival", label: festival.shortName, title: festival.name });
  if (exam) badges.push({ key: exam.id, tone: "exam", label: exam.shortName, title: exam.name });
  if (result) badges.push({ key: result.id, tone: "result", label: result.shortName, title: result.name });
  for (const u of userEvents) {
    badges.push({
      key: u.id,
      tone: u.kind === "deadline" ? "due" : "note",
      label: u.title,
      title: `${u.kind === "deadline" ? "Last date: " : ""}${u.title}`,
    });
  }
  const shown = badges.slice(0, 2);
  const extra = total - shown.length;

  const ariaLabel = [
    WEEKDAY_LONG[cell.weekday],
    formatLongDate(cell.date),
    isToday ? "Today" : null,
    ...festivals.map((f) => f.name),
    ...exams.map((e) => e.name),
    ...userEvents.map((u) => (u.kind === "deadline" ? `Last date: ${u.title}` : u.title)),
    todos.length ? `${doneTodos} of ${todos.length} tasks done` : null,
    "Press Enter to open",
  ]
    .filter(Boolean)
    .join(", ");

  const open = () => onOpen(cell.key);

  return (
    <motion.div
      variants={dayCardVariants}
      whileHover={reduceMotion ? undefined : { scale: 1.035, y: -3 }}
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      role="gridcell"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-current={isToday ? "date" : undefined}
      onTap={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      className={`${CELL_SIZE} group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border p-1.5 text-left shadow-card transition-[box-shadow,border-color,background-color] duration-300 ease-out will-change-transform hover:shadow-hover sm:rounded-2xl sm:p-2.5 ${surface} ${
        isToday ? "ring-2 ring-accent ring-offset-2 ring-offset-canvas" : ""
      }`}
    >
      {/* Hover glow ring */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 ring-2 ring-inset ring-accent/25 transition-opacity duration-300 group-hover:opacity-100"
      />
      {/* Personal-item highlight on an already-coloured day */}
      {highlight && (
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 rounded-[inherit] ring-2 ring-inset ${highlight}`}
        />
      )}
      {/* Light sheen that sweeps across on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition-[transform,opacity] duration-700 ease-out group-hover:translate-x-[300%] group-hover:opacity-100 dark:via-white/10"
      />

      {/* Top row: day number + icon */}
      <div className="flex items-start justify-between gap-1">
        {isToday ? (
          <span
            className={`inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[12px] font-semibold text-white sm:h-7 sm:w-7 sm:text-[13px] ${
              reduceMotion ? "" : "animate-today-pulse"
            }`}
          >
            {cell.day}
          </span>
        ) : (
          <span
            className={`text-[13px] font-semibold tabular-nums leading-6 transition-transform duration-300 group-hover:translate-x-0.5 sm:text-sm sm:leading-7 ${number}`}
          >
            {cell.day}
          </span>
        )}

        <span className="flex items-center gap-1">
          {/* Pin marker for personal items on a coloured day */}
          {highlight && (
            <span aria-hidden className={`h-2 w-2 rounded-full ${deadline ? "bg-due" : "bg-accent"}`} />
          )}
          {icon && (
            <span
              aria-hidden
              className="hidden text-base leading-none transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6 sm:block md:text-lg"
            >
              {icon}
            </span>
          )}
        </span>
      </div>

      {/* Hover call-to-action: open the day to add something */}
      <span
        aria-hidden
        className="absolute right-1.5 top-8 z-10 hidden h-6 w-6 items-center justify-center rounded-lg bg-surface/90 text-ink-2 opacity-0 shadow-card ring-1 ring-inset ring-line transition-[opacity,transform] duration-200 group-hover:opacity-100 sm:top-9 sm:flex md:right-2.5"
      >
        <Plus className="h-3.5 w-3.5" />
      </span>

      {/* Bottom: badges */}
      {total > 0 && (
        <div className="mt-auto flex flex-col gap-0.5 pt-1 sm:gap-1">
          <span aria-hidden className="text-sm leading-none sm:hidden">
            {icon}
          </span>
          <div className="hidden min-w-0 flex-col gap-1 sm:flex">
            {shown.map((b) => (
              <FestivalBadge key={b.key} tone={b.tone} className="max-w-full" title={b.title}>
                {b.label}
              </FestivalBadge>
            ))}
          </div>
          {extra > 0 && (
            <span className="hidden text-[10px] font-medium text-ink-3 underline-offset-2 group-hover:underline md:block">
              +{extra} more · open
            </span>
          )}
        </div>
      )}

      {/* Task progress pill */}
      {todos.length > 0 && (
        <span
          className={`${total > 0 ? "mt-1" : "mt-auto"} hidden w-fit items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ring-1 ring-inset sm:inline-flex ${
            doneTodos === todos.length
              ? "bg-fest/10 text-fest-strong ring-fest/30"
              : "bg-surface-2 text-ink-2 ring-line"
          }`}
          title={`${doneTodos} of ${todos.length} tasks done`}
        >
          {doneTodos === todos.length ? "✓" : "☐"} {doneTodos}/{todos.length}
        </span>
      )}
    </motion.div>
  );
}

export default memo(CalendarDayCard);
