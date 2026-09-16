"use client";

import { motion } from "framer-motion";

/** Shimmering placeholder grid shown while a month is loading. */
export default function SkeletonGrid({ count = 35 }: { count?: number }) {
  const CELLS = Array.from({ length: count }, (_, i) => i);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.15 } }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      className="grid grid-cols-7 gap-1.5 sm:gap-2.5 lg:gap-3"
      aria-hidden
      data-testid="skeleton-grid"
    >
      {CELLS.map((i) => (
        <div
          key={i}
          className="skeleton min-h-[54px] rounded-xl border border-line/60 p-1.5 xs:min-h-[64px] sm:min-h-[84px] sm:rounded-2xl sm:p-2.5 md:min-h-[104px] lg:min-h-[118px]"
        >
          <div className="h-3.5 w-5 rounded bg-line/70 sm:h-4 sm:w-6" />
          {i % 5 === 2 && (
            <div className="mt-auto hidden h-4 w-3/4 rounded-md bg-line/60 sm:block" />
          )}
        </div>
      ))}
    </motion.div>
  );
}
