"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { formatLongDate, WEEKDAY_LONG } from "@/lib/calendar";
import type { Festival } from "@/lib/festivals";
import type { ExamEvent } from "@/lib/exams";
import { addUserEvent, removeUserEvent, USER_KIND_LABEL, type UserEvent, type UserEventKind } from "@/lib/userEvents";
import { downloadIcs, type IcsEvent } from "@/lib/ics";
import FestivalBadge from "./FestivalBadge";

interface DayPopoverProps {
  /** ISO date of the open day, or null when closed */
  dateKey: string | null;
  festivals: Festival[];
  exams: ExamEvent[];
  userEvents: UserEvent[];
  onClose: () => void;
}

function parse(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const DOT = {
  festival: "bg-fest",
  exam: "bg-exam",
  result: "bg-result",
  due: "bg-due",
  note: "bg-accent",
} as const;

function Row({
  tone,
  icon,
  title,
  meta,
  tag,
  onRemove,
}: {
  tone: keyof typeof DOT;
  icon: string;
  title: string;
  meta?: string;
  tag?: React.ReactNode;
  onRemove?: () => void;
}) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      className="group flex items-start gap-2 rounded-md px-1 py-1.5 transition-colors hover:bg-surface-2"
    >
      <span aria-hidden className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${DOT[tone]}`} />
      <span aria-hidden className="text-sm leading-none">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[13px] font-semibold leading-tight text-ink">{title}</span>
          {tag}
        </span>
        {meta && <span className="mt-0.5 line-clamp-2 block text-[11px] leading-snug text-ink-2">{meta}</span>}
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${title}`}
          title="Remove"
          className="rounded-md px-1 text-[14px] leading-none text-ink-3 opacity-0 transition-[opacity,color] hover:text-result focus-visible:opacity-100 group-hover:opacity-100"
        >
          ×
        </button>
      )}
    </motion.li>
  );
}

/** Centered dialog for one day: everything on that date plus an add-your-own form. */
export default function DayPopover({ dateKey, festivals, exams, userEvents, onClose }: DayPopoverProps) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [kind, setKind] = useState<UserEventKind>("event");
  const titleRef = useRef<HTMLInputElement>(null);
  const open = dateKey !== null;

  // Escape closes; lock page scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      e.stopPropagation();
    };
    window.addEventListener("keydown", onKey, true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateKey || !title.trim()) return;
    addUserEvent({ date: dateKey, title, note, kind });
    setTitle("");
    setNote("");
    setKind("event");
    titleRef.current?.focus();
  };

  const total = festivals.length + exams.length + userEvents.length;

  const exportDay = () => {
    if (!dateKey) return;
    const items: IcsEvent[] = [
      ...festivals.map((f) => ({ uid: f.id, date: f.date, title: `${f.icon} ${f.name}`, description: f.description })),
      ...exams.map((x) => ({ uid: x.id, date: x.date, title: `${x.icon} ${x.name}`, description: `${x.org} · ${x.description}` })),
      ...userEvents.map((u) => ({
        uid: u.id,
        date: u.date,
        title: `${u.kind === "deadline" ? "⏳ Last date: " : "📌 "}${u.title}`,
        description: u.note,
      })),
    ];
    downloadIcs(items, formatLongDate(parse(dateKey)), `festival-calendar-${dateKey}`);
  };

  return (
    <AnimatePresence>
      {open && dateKey && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end justify-center bg-transparent p-0 sm:items-center sm:p-6"
        >
          <motion.div
            key={dateKey}
            role="dialog"
            aria-modal="true"
            aria-labelledby="day-popover-title"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.8 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-t-xl border border-line bg-surface p-3.5 shadow-pop sm:rounded-lg sm:p-4"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
                  {WEEKDAY_LONG[parse(dateKey).getDay()]}
                </p>
                <h3 id="day-popover-title" className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
                  {formatLongDate(parse(dateKey))}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-line text-base leading-none text-ink-2 transition-[background-color,color] hover:bg-surface-2 hover:text-ink"
              >
                ×
              </button>
            </div>

            {/* Everything on this day */}
            <div className="mt-3">
              <div className="mb-0.5 flex items-center justify-between px-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">On this day</p>
                <span className="text-[11px] tabular-nums text-ink-2">
                  {total} {total === 1 ? "item" : "items"}
                </span>
              </div>
              {total === 0 ? (
                <p className="px-1 py-2 text-[12px] text-ink-2">Nothing here yet — add something below.</p>
              ) : (
                <ul className="flex max-h-44 flex-col overflow-y-auto">
                  <AnimatePresence initial={false}>
                    {festivals.map((f) => (
                      <Row
                        key={f.id}
                        tone="festival"
                        icon={f.icon}
                        title={f.name}
                        meta={f.description}
                        tag={
                          <>
                            <FestivalBadge tone="festival">Festival</FestivalBadge>
                            {f.isHoliday && <FestivalBadge tone="holiday">Public holiday</FestivalBadge>}
                          </>
                        }
                      />
                    ))}
                    {exams.map((x) => (
                      <Row
                        key={x.id}
                        tone={x.kind}
                        icon={x.icon}
                        title={x.name}
                        meta={`${x.org}${x.window ? ` · ${x.window}` : ""} · ${x.description}`}
                        tag={
                          <>
                            <FestivalBadge tone={x.kind}>{x.kind === "exam" ? "Exam" : "Result"}</FestivalBadge>
                            {x.status === "expected" && <FestivalBadge tone="approx">Expected</FestivalBadge>}
                          </>
                        }
                      />
                    ))}
                    {userEvents.map((u) => (
                      <Row
                        key={u.id}
                        tone={u.kind === "deadline" ? "due" : "note"}
                        icon={u.kind === "deadline" ? "⏳" : "📌"}
                        title={u.title}
                        meta={u.note}
                        tag={
                          <FestivalBadge tone={u.kind === "deadline" ? "due" : "note"}>
                            {USER_KIND_LABEL[u.kind]}
                          </FestivalBadge>
                        }
                        onRemove={() => removeUserEvent(u.id)}
                      />
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Add your own */}
            <form onSubmit={submit} className="mt-3 rounded-lg border border-dashed border-line-strong bg-surface-2/60 p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">Add to this day</p>
              <div className="mt-1.5 flex flex-col gap-1.5 sm:flex-row">
                <input
                  ref={titleRef}
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What is happening? e.g. Fee payment"
                  maxLength={80}
                  className="h-8 min-w-0 flex-1 rounded-md border border-line bg-surface px-2.5 text-[13px] text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
                />
                <div className="flex shrink-0 rounded-md border border-line bg-surface p-0.5" role="radiogroup" aria-label="Type">
                  {(["event", "deadline"] as UserEventKind[]).map((k) => (
                    <button
                      key={k}
                      type="button"
                      role="radio"
                      aria-checked={kind === k}
                      onClick={() => setKind(k)}
                      className={`h-7 flex-1 whitespace-nowrap rounded-[5px] px-2.5 text-[11px] font-semibold transition-[background-color,color] ${
                        kind === k
                          ? k === "deadline"
                            ? "bg-due text-white"
                            : "bg-accent text-white"
                          : "text-ink-2 hover:text-ink"
                      }`}
                    >
                      {k === "deadline" ? "⏳ Last date" : "📌 Event"}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note"
                rows={1}
                maxLength={280}
                className="mt-1.5 w-full resize-none rounded-md border border-line bg-surface px-2.5 py-1.5 text-[12px] text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
              />
              <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1.5">
                <p className="text-[10px] text-ink-3">
                  {kind === "deadline" ? "Marks the day purple." : "Marks the day indigo."}
                </p>
                <div className="flex gap-1.5">
                  {total > 0 && (
                    <button
                      type="button"
                      onClick={exportDay}
                      className="h-7 rounded-md border border-line bg-surface px-2 text-[11px] font-semibold text-ink-2 transition-[background-color,color] hover:bg-surface-2 hover:text-ink"
                    >
                      Export
                    </button>
                  )}
                  <motion.button
                    type="submit"
                    disabled={!title.trim()}
                    whileTap={{ scale: 0.96 }}
                    className={`h-7 rounded-md px-3 text-[11px] font-semibold text-white shadow-card transition-[opacity,background-color] disabled:cursor-not-allowed disabled:opacity-40 ${
                      kind === "deadline" ? "bg-due hover:bg-due-strong" : "bg-accent hover:bg-accent-strong"
                    }`}
                  >
                    Add
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
