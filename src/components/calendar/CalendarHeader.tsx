"use client";

import { motion } from "framer-motion";
import { MAX_YEAR, MIN_YEAR, MONTH_NAMES, type MonthKey } from "@/lib/calendar";
import Select from "@/components/ui/Select";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Link from "next/link";
import { CalendarMark, Printer, Sparkle } from "@/components/ui/icons";

interface CalendarHeaderProps {
  view: MonthKey | null;
  isViewingToday: boolean;
  onToday: () => void;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  festivalCount: number;
}

const YEAR_OPTIONS = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => {
  const y = MIN_YEAR + i;
  return { value: y, label: String(y) };
});

const MONTH_OPTIONS = MONTH_NAMES.map((name, i) => ({ value: i, label: name }));

export default function CalendarHeader({
  view,
  isViewingToday,
  onToday,
  onYearChange,
  onMonthChange,
  festivalCount,
}: CalendarHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      {/* Brand */}
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ y: [0, -4, 0], rotate: [0, -2, 2, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{ scale: 1.1, rotate: -8 }}
          className="brand-gradient relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-[0_8px_20px_-8px_var(--color-accent)]"
        >
          <motion.span
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="flex"
          >
            <CalendarMark className="h-5 w-5" />
          </motion.span>
          <span className="absolute -right-1 -top-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fest opacity-70" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-fest ring-2 ring-canvas" />
          </span>
        </motion.div>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-[-0.01em] text-ink sm:text-xl">
            Festival Calendar
          </h1>
          <p className="truncate text-[13px] text-ink-2">
            Month view · Indian festivals, automatically highlighted
          </p>
        </div>
      </div>

      {/* Controls — two groups so they wrap cleanly on phones */}
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}>
          <Link
            href={`/events?y=${view?.year ?? MIN_YEAR}`}
            title="All festivals of the year, month by month"
            className="print-hide inline-flex h-9 items-center gap-2 rounded-lg border border-fest-line bg-fest-soft px-3 text-[13px] font-semibold text-fest-strong shadow-card transition-[box-shadow,border-color] duration-200 hover:border-fest/50 hover:shadow-hover/40"
          >
            <Sparkle className="h-4 w-4" />
            Events
            <span className="rounded-md bg-surface px-1.5 text-[11px] font-semibold tabular-nums text-fest-strong ring-1 ring-inset ring-fest-line">
              {festivalCount}
            </span>
          </Link>
        </motion.div>
        <div className="flex flex-1 items-center gap-2 sm:flex-none">
          <div className="flex-1 sm:flex-none">
            <Select
              label="Select month"
              value={view?.month ?? 0}
              options={MONTH_OPTIONS}
              onChange={onMonthChange}
              minWidth="7.75rem"
            />
          </div>
          <Select
            label="Select year"
            value={view?.year ?? MIN_YEAR}
            options={YEAR_OPTIONS}
            onChange={onYearChange}
            minWidth="5.25rem"
          />
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            onClick={onToday}
            disabled={isViewingToday}
            whileTap={{ scale: 0.96 }}
            className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-[13px] font-semibold transition-[background-color,box-shadow,color,opacity] duration-200 ${
              isViewingToday
                ? "cursor-default border border-line bg-surface text-ink-3"
                : "bg-accent text-white shadow-[0_8px_18px_-8px_var(--color-accent)] hover:bg-accent-strong"
            }`}
            title="Jump to today (T)"
          >
            <span className="relative flex h-1.5 w-1.5">
              {!isViewingToday && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
              )}
              <span
                className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                  isViewingToday ? "bg-ink-3" : "bg-white"
                }`}
              />
            </span>
            Today
          </motion.button>

          <motion.button
            type="button"
            onClick={() => window.print()}
            aria-label="Print this month"
            title="Print this month"
            whileTap={{ scale: 0.95 }}
            className="print-hide inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-ink-2 shadow-card transition-[border-color,box-shadow,color] duration-200 hover:border-line-strong hover:text-ink hover:shadow-hover/40"
          >
            <Printer className="h-4 w-4" />
          </motion.button>
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
}
