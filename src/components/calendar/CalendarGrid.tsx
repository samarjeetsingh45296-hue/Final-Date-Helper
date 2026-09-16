"use client";

import { AnimatePresence, motion, type PanInfo, type Variants } from "framer-motion";
import { WEEKDAY_LONG, WEEKDAY_SHORT, type DayCell } from "@/lib/calendar";
import type { Festival } from "@/lib/festivals";
import type { ExamEvent } from "@/lib/exams";
import type { UserEvent } from "@/lib/userEvents";
import type { Direction } from "@/hooks/useCalendar";
import CalendarDayCard from "./CalendarDayCard";
import SkeletonGrid from "./SkeletonGrid";

interface CalendarGridProps {
  monthKey: string;
  label: string;
  cells: DayCell[];
  festivalsByDate: Map<string, Festival[]>;
  examsByDate: Map<string, ExamEvent[]>;
  userEventsByDate: Map<string, UserEvent[]>;
  onOpenDay: (key: string) => void;
  direction: Direction;
  isLoading: boolean;
  onPrev: () => void;
  onNext: () => void;
  reduceMotion: boolean;
}

const SLIDE = 56;
const SWIPE_DISTANCE = 64;
const SWIPE_VELOCITY = 450;

const gridVariants: Variants = {
  enter: (dir: Direction) => ({ opacity: 0, x: dir * SLIDE }),
  center: {
    opacity: 1,
    x: 0,
    transition: {
      x: { type: "spring", stiffness: 320, damping: 32, mass: 0.8 },
      opacity: { duration: 0.25 },
      staggerChildren: 0.011,
      delayChildren: 0.02,
    },
  },
  exit: (dir: Direction) => ({
    opacity: 0,
    x: dir * -SLIDE * 0.6,
    transition: { duration: 0.18, ease: "easeIn" },
  }),
};

const reducedGridVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

export default function CalendarGrid({
  monthKey,
  label,
  cells,
  festivalsByDate,
  examsByDate,
  userEventsByDate,
  onOpenDay,
  direction,
  isLoading,
  onPrev,
  onNext,
  reduceMotion,
}: CalendarGridProps) {
  /** Swipe left → next month, swipe right → previous month. */
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    if (offset.x < -SWIPE_DISTANCE || velocity.x < -SWIPE_VELOCITY) onNext();
    else if (offset.x > SWIPE_DISTANCE || velocity.x > SWIPE_VELOCITY) onPrev();
  };

  return (
    <div role="grid" aria-label={`Calendar, ${label}`} aria-busy={isLoading}>
      {/* Weekday header */}
      <div role="row" className="mb-2 grid grid-cols-7 gap-1.5 sm:mb-3 sm:gap-2.5 lg:gap-3">
        {WEEKDAY_SHORT.map((d, i) => (
          <div
            key={d}
            role="columnheader"
            aria-label={WEEKDAY_LONG[i]}
            className="rounded-lg py-1 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3 sm:text-[11px]"
          >
            <span className="sm:hidden">{d.slice(0, 1)}</span>
            <span className="hidden sm:inline">{d}</span>
          </div>
        ))}
      </div>

      {/* Body — skeleton and month grid cross-fade/slide in the same slot */}
      <div className="relative overflow-hidden rounded-2xl p-0.5 [contain:paint]">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          {isLoading ? (
            <SkeletonGrid key="skeleton" count={cells.length || 35} />
          ) : (
            <motion.div
              key={monthKey}
              role="rowgroup"
              custom={direction}
              variants={reduceMotion ? reducedGridVariants : gridVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag={reduceMotion ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.14}
              dragMomentum={false}
              onDragEnd={handleDragEnd}
              className="grid cursor-grab grid-cols-7 gap-1.5 active:cursor-grabbing sm:gap-2.5 lg:gap-3"
            >
              {cells.map((cell) => (
                <CalendarDayCard
                  key={cell.key}
                  cell={cell}
                  festivals={festivalsByDate.get(cell.key) ?? []}
                  exams={examsByDate.get(cell.key) ?? []}
                  userEvents={userEventsByDate.get(cell.key) ?? []}
                  onOpen={onOpenDay}
                  reduceMotion={reduceMotion}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
