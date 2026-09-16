"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MONTH_NAMES, type MonthKey } from "@/lib/calendar";
import type { Direction } from "@/hooks/useCalendar";
import { ChevronLeft, ChevronRight } from "@/components/ui/icons";

interface MonthNavigatorProps {
  view: MonthKey | null;
  direction: Direction;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  isViewingToday: boolean;
  reduceMotion: boolean;
}

function NavButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      whileHover={disabled ? undefined : { scale: 1.06 }}
      whileTap={disabled ? undefined : { scale: 0.92 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-ink-2 shadow-card transition-[border-color,box-shadow,color,opacity] duration-200 hover:border-line-strong hover:text-ink hover:shadow-hover/40 disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none sm:h-11 sm:w-11"
    >
      {children}
    </motion.button>
  );
}

export default function MonthNavigator({
  view,
  direction,
  canPrev,
  canNext,
  onPrev,
  onNext,
  isViewingToday,
  reduceMotion,
}: MonthNavigatorProps) {
  const label = view ? `${MONTH_NAMES[view.month]} ${view.year}` : "";
  const shift = reduceMotion ? 0 : 22;

  return (
    <div className="flex items-center justify-between gap-3 sm:gap-6">
      <NavButton onClick={onPrev} disabled={!canPrev} label="Previous month">
        <ChevronLeft className="h-5 w-5" />
      </NavButton>

      <div className="relative flex min-w-0 flex-1 flex-col items-center">
        <div className="relative h-9 w-full overflow-hidden sm:h-10">
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.h2
              key={label || "placeholder"}
              custom={direction}
              initial={{ opacity: 0, x: direction * shift, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: direction * -shift, filter: "blur(4px)" }}
              transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.7 }}
              className="absolute inset-0 flex items-center justify-center whitespace-nowrap text-center text-[22px] font-semibold tracking-[-0.02em] text-ink sm:text-[26px] lg:text-[28px]"
              aria-live="polite"
            >
              {label ? (
                <>
                  <span>{MONTH_NAMES[view!.month]}</span>
                  <span className="ml-2 font-medium text-ink-3">{view!.year}</span>
                </>
              ) : (
                <span className="skeleton inline-block h-7 w-44 rounded-lg" />
              )}
            </motion.h2>
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {isViewingToday && (
            <motion.span
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-0.5 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-accent"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              Current month
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <NavButton onClick={onNext} disabled={!canNext} label="Next month">
        <ChevronRight className="h-5 w-5" />
      </NavButton>
    </div>
  );
}
