"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { MONTH_NAMES, WEEKDAY_LONG } from "@/lib/calendar";
import type { Festival } from "@/lib/festivals";
import type { ExamEvent } from "@/lib/exams";
import type { UserEvent } from "@/lib/userEvents";

interface FestivalBulletsProps {
  monthKey: string;
  festivals: Festival[];
  exams: ExamEvent[];
  userEvents: UserEvent[];
  showFestivals: boolean;
  showExams: boolean;
  showResults: boolean;
  reduceMotion: boolean;
}

const listVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -14 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 380, damping: 28 } },
};

function longDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${WEEKDAY_LONG[new Date(y, m - 1, d).getDay()]}, ${d} ${MONTH_NAMES[m - 1]}`;
}

const DOT = {
  festival: "bg-fest shadow-[0_0_0_3px_var(--color-fest-soft)]",
  exam: "bg-exam shadow-[0_0_0_3px_var(--color-exam-soft)]",
  result: "bg-result shadow-[0_0_0_3px_var(--color-result-soft)]",
  due: "bg-due shadow-[0_0_0_3px_var(--color-due-soft)]",
  note: "bg-accent shadow-[0_0_0_3px_var(--color-accent-soft)]",
} as const;

function Bullet({
  tone,
  icon,
  name,
  date,
  tags,
}: {
  tone: keyof typeof DOT;
  icon: string;
  name: string;
  date: string;
  tags: React.ReactNode;
}) {
  return (
    <motion.li
      variants={itemVariants}
      className="group flex items-baseline gap-3 text-[14px] leading-snug text-ink"
    >
      <span
        aria-hidden
        className={`relative top-[-2px] h-2 w-2 shrink-0 rounded-full transition-transform duration-300 group-hover:scale-125 ${DOT[tone]}`}
      />
      <span className="min-w-0">
        <span aria-hidden className="mr-1.5 inline-block transition-transform duration-300 group-hover:animate-wiggle">
          {icon}
        </span>
        <span className="font-semibold">{name}</span>
        <span className="text-ink-3"> — </span>
        <span className="text-ink-2">{date}</span>
        {tags}
      </span>
    </motion.li>
  );
}

function Section({
  monthKey,
  title,
  count,
  empty,
  children,
}: {
  monthKey: string;
  title: string;
  count: number;
  empty: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5 border-t border-line pt-4 sm:mt-6 sm:pt-5">
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">{title}</p>
        <span className="text-[12px] font-medium tabular-nums text-ink-2">
          {count} {count === 1 ? "event" : "events"}
        </span>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {count === 0 ? (
          <motion.p
            key={`${monthKey}-empty`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-1 text-[13px] text-ink-2"
          >
            {empty}
          </motion.p>
        ) : (
          <motion.ul key={monthKey} variants={listVariants} initial="hidden" animate="show" exit="exit" className="flex flex-col gap-2 px-1">
            {children}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExamBullet({ event: e }: { event: ExamEvent }) {
  return (
    <Bullet
      tone={e.kind}
      icon={e.icon}
      name={e.name}
      date={longDate(e.date)}
      tags={
        <>
          {e.window && <span className="ml-2 text-[12px] text-ink-3">({e.window})</span>}
          <span className="ml-2 text-[12px] text-ink-3">{e.org}</span>
          {e.status === "expected" && (
            <span
              className="ml-2 rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] font-medium text-ink-3 ring-1 ring-inset ring-line"
              title="Projected from the usual schedule — verify with the conducting body"
            >
              Expected
            </span>
          )}
        </>
      }
    />
  );
}

/** Bullet lists of this month's festivals, exams and results, for quick tracking. */
export default function FestivalBullets({
  monthKey,
  festivals,
  exams,
  userEvents,
  showFestivals,
  showExams,
  showResults,
  reduceMotion,
}: FestivalBulletsProps) {
  const examOnly = exams.filter((e) => e.kind === "exam");
  const resultOnly = exams.filter((e) => e.kind === "result");
  void reduceMotion;

  return (
    <>
      {showFestivals && (
        <Section
          monthKey={monthKey}
          title="Festivals this month"
          count={festivals.length}
          empty="No festivals this month."
        >
          {festivals.map((f) => (
            <Bullet
              key={f.id}
              tone="festival"
              icon={f.icon}
              name={f.name}
              date={longDate(f.date)}
              tags={
                f.isHoliday && (
                  <span className="ml-2 rounded-md bg-accent-soft px-1.5 py-0.5 text-[11px] font-medium text-accent">
                    Holiday
                  </span>
                )
              }
            />
          ))}
        </Section>
      )}

      {showExams && (
        <Section
          monthKey={`${monthKey}-exams`}
          title="Exams this month"
          count={examOnly.length}
          empty="No exams this month."
        >
          {examOnly.map((e) => (
            <ExamBullet key={e.id} event={e} />
          ))}
        </Section>
      )}

      {showResults && (
        <Section
          monthKey={`${monthKey}-results`}
          title="Results this month"
          count={resultOnly.length}
          empty="No results this month."
        >
          {resultOnly.map((e) => (
            <ExamBullet key={e.id} event={e} />
          ))}
        </Section>
      )}

      {userEvents.length > 0 && (
        <Section
          monthKey={`${monthKey}-mine`}
          title="My events this month"
          count={userEvents.length}
          empty=""
        >
          {userEvents.map((u) => (
            <Bullet
              key={u.id}
              tone={u.kind === "deadline" ? "due" : "note"}
              icon={u.kind === "deadline" ? "\u23F3" : "\uD83D\uDCCC"}
              name={u.title}
              date={longDate(u.date)}
              tags={
                <>
                  <span
                    className={`ml-2 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${
                      u.kind === "deadline" ? "bg-due-soft text-due-strong" : "bg-accent-soft text-accent"
                    }`}
                  >
                    {u.kind === "deadline" ? "Last date" : "My event"}
                  </span>
                  {u.note && <span className="ml-2 text-[12px] text-ink-3">{u.note}</span>}
                </>
              }
            />
          ))}
        </Section>
      )}
    </>
  );
}
