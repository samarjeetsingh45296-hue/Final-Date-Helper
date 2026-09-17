"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MONTH_NAMES, WEEKDAY_LONG } from "@/lib/calendar";
import type { Festival } from "@/lib/festivals";
import type { ExamEvent } from "@/lib/exams";
import { addUserEvent, removeUserEvent, type UserEvent } from "@/lib/userEvents";
import { addTodo, clearDoneTodos, removeTodo, toggleTodo, type Todo } from "@/lib/todos";
import { downloadIcs, type IcsEvent } from "@/lib/ics";
import { Check } from "@/components/ui/icons";

interface DayPopoverProps {
  /** ISO date of the open day, or null when closed */
  dateKey: string | null;
  festivals: Festival[];
  exams: ExamEvent[];
  userEvents: UserEvent[];
  todos: Todo[];
  onClose: () => void;
}

type Mode = "task" | "event" | "deadline";
type Tone = "festival" | "exam" | "result" | "due" | "note" | "neutral";

function parse(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/* Soft header tints per dominant item type */
const HEADER_TINT: Record<Tone, string> = {
  festival: "from-fest/20 via-fest/5",
  exam: "from-exam/20 via-exam/5",
  result: "from-result/20 via-result/5",
  due: "from-due/20 via-due/5",
  note: "from-accent/20 via-accent/5",
  neutral: "from-accent/15 via-accent/5",
};

const ICON_TILE: Record<Exclude<Tone, "neutral">, string> = {
  festival: "bg-fest-soft ring-fest-line",
  exam: "bg-exam-soft ring-exam-line",
  result: "bg-result-soft ring-result-line",
  due: "bg-due-soft ring-due-line",
  note: "bg-accent-soft ring-accent-line",
};

const LABEL_TEXT: Record<Exclude<Tone, "neutral">, string> = {
  festival: "text-fest-strong",
  exam: "text-exam-strong",
  result: "text-result-strong",
  due: "text-due-strong",
  note: "text-accent",
};

/* -------------------------------------------------------------------------- */
/*  Pieces                                                                    */
/* -------------------------------------------------------------------------- */

function Item({
  tone,
  icon,
  title,
  label,
  onRemove,
}: {
  tone: Exclude<Tone, "neutral">;
  icon: string;
  title: string;
  label: string;
  onRemove?: () => void;
}) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="group flex items-center gap-3 py-2"
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[17px] ring-1 ring-inset ${ICON_TILE[tone]}`}>
        <span aria-hidden>{icon}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-semibold leading-tight text-ink">{title}</span>
        <span className={`mt-0.5 block text-[10.5px] font-semibold uppercase tracking-[0.12em] ${LABEL_TEXT[tone]}`}>
          {label}
        </span>
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${title}`}
          title="Remove"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[16px] leading-none text-ink-3 opacity-0 transition-[opacity,color,background-color] hover:bg-surface-2 hover:text-result focus-visible:opacity-100 group-hover:opacity-100"
        >
          ×
        </button>
      )}
    </motion.li>
  );
}

function TaskItem({ todo }: { todo: Todo }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="group flex items-center gap-3 py-1.5"
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={todo.done}
        onClick={() => toggleTodo(todo.id)}
        aria-label={todo.done ? `Mark "${todo.text}" as not done` : `Mark "${todo.text}" as done`}
        className={`relative flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-[background-color,border-color,transform] duration-200 active:scale-90 ${
          todo.done ? "border-fest bg-fest text-white" : "border-line-strong bg-surface hover:border-fest"
        }`}
      >
        <AnimatePresence initial={false}>
          {todo.done && (
            <motion.span
              key="tick"
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.3, opacity: 0 }}
              transition={{ type: "spring", stiffness: 600, damping: 24 }}
              className="flex"
            >
              <Check className="h-3 w-3" strokeWidth={3} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <span className={`relative min-w-0 flex-1 text-[13.5px] leading-5 transition-colors duration-300 ${todo.done ? "text-ink-3" : "text-ink"}`}>
        {todo.text}
        <motion.span
          aria-hidden
          initial={false}
          animate={{ scaleX: todo.done ? 1 : 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-0 top-1/2 h-px w-full origin-left bg-ink-3"
        />
      </span>

      <button
        type="button"
        onClick={() => removeTodo(todo.id)}
        aria-label={`Delete "${todo.text}"`}
        title="Delete"
        className="flex h-7 w-7 items-center justify-center rounded-lg text-[16px] leading-none text-ink-3 opacity-0 transition-[opacity,color,background-color] hover:bg-surface-2 hover:text-result focus-visible:opacity-100 group-hover:opacity-100"
      >
        ×
      </button>
    </motion.li>
  );
}

/** Circular progress indicator for the task list */
function ProgressRing({ done, total }: { done: number; total: number }) {
  const r = 14;
  const c = 2 * Math.PI * r;
  const pct = total ? done / total : 0;
  const complete = total > 0 && done === total;
  return (
    <span className="relative inline-flex h-9 w-9 items-center justify-center" aria-hidden>
      <svg viewBox="0 0 36 36" className="h-9 w-9 -rotate-90">
        <circle cx="18" cy="18" r={r} fill="none" stroke="var(--color-line)" strokeWidth="3" />
        <motion.circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke={complete ? "var(--color-fest)" : "var(--color-accent)"}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <span className={`absolute text-[10px] font-semibold tabular-nums ${complete ? "text-fest-strong" : "text-ink-2"}`}>
        {complete ? "✓" : `${done}/${total}`}
      </span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Popup                                                                     */
/* -------------------------------------------------------------------------- */

const MODE_META: Record<Mode, { label: string; icon: string; placeholder: string; active: string }> = {
  task: { label: "Task", icon: "☑", placeholder: "Add a task for this day…", active: "bg-fest text-white" },
  event: { label: "Event", icon: "📌", placeholder: "Add an event…", active: "bg-accent text-white" },
  deadline: { label: "Last date", icon: "⏳", placeholder: "Add a last date…", active: "bg-due text-white" },
};

export default function DayPopover({ dateKey, festivals, exams, userEvents, todos, onClose }: DayPopoverProps) {
  const [mode, setMode] = useState<Mode>("task");
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
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
    if (!dateKey || !text.trim()) return;
    if (mode === "task") addTodo(dateKey, text);
    else addUserEvent({ date: dateKey, title: text, kind: mode });
    setText("");
    inputRef.current?.focus();
  };

  const date = dateKey ? parse(dateKey) : null;
  const total = festivals.length + exams.length + userEvents.length;
  const done = todos.filter((t) => t.done).length;
  const allDone = todos.length > 0 && done === todos.length;

  const dominant: Tone = festivals[0]
    ? "festival"
    : exams.find((e) => e.kind === "exam")
      ? "exam"
      : exams.find((e) => e.kind === "result")
        ? "result"
        : userEvents.find((u) => u.kind === "deadline")
          ? "due"
          : userEvents.length
            ? "note"
            : "neutral";

  const exportDay = () => {
    if (!dateKey || !date) return;
    const items: IcsEvent[] = [
      ...festivals.map((f) => ({ uid: f.id, date: f.date, title: `${f.icon} ${f.name}`, description: f.description })),
      ...exams.map((x) => ({ uid: x.id, date: x.date, title: `${x.icon} ${x.name}`, description: `${x.org} · ${x.description}` })),
      ...userEvents.map((u) => ({ uid: u.id, date: u.date, title: `${u.kind === "deadline" ? "⏳ Last date: " : "📌 "}${u.title}` })),
      ...todos.map((t) => ({ uid: t.id, date: t.date, title: `${t.done ? "☑" : "☐"} ${t.text}` })),
    ];
    downloadIcs(items, `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`, `ccc-master-calendar-${dateKey}`);
  };

  return (
    <AnimatePresence>
      {open && dateKey && date && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/25 p-0 backdrop-blur-md sm:items-center sm:p-6"
        >
          <motion.div
            key={dateKey}
            role="dialog"
            aria-modal="true"
            aria-labelledby="day-popover-title"
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 360, damping: 32, mass: 0.8 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-surface shadow-pop ring-1 ring-line sm:rounded-3xl"
          >
            {/* Header */}
            <div className={`relative bg-gradient-to-b to-transparent px-6 pb-5 pt-6 ${HEADER_TINT[dominant]}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-3">
                    {WEEKDAY_LONG[date.getDay()]}
                  </p>
                  <h3 id="day-popover-title" className="mt-1 flex items-baseline gap-2">
                    <span className="text-[44px] font-semibold leading-none tracking-[-0.04em] text-ink">{date.getDate()}</span>
                    <span className="text-[17px] font-medium text-ink-2">
                      {MONTH_NAMES[date.getMonth()]} {date.getFullYear()}
                    </span>
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  {total + todos.length > 0 && (
                    <button
                      type="button"
                      onClick={exportDay}
                      title="Export this day (.ics)"
                      className="h-8 rounded-full border border-line/80 bg-surface/70 px-3 text-[11.5px] font-semibold text-ink-2 backdrop-blur-sm transition-[background-color,color] hover:bg-surface hover:text-ink"
                    >
                      Export
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-line/80 bg-surface/70 text-lg leading-none text-ink-2 backdrop-blur-sm transition-[background-color,color] hover:bg-surface hover:text-ink"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Summary chips */}
              <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-medium">
                {festivals.length > 0 && (
                  <span className="rounded-full bg-fest/10 px-2.5 py-1 text-fest-strong">
                    {festivals.length} festival{festivals.length > 1 ? "s" : ""}
                  </span>
                )}
                {exams.some((e) => e.kind === "exam") && (
                  <span className="rounded-full bg-exam/10 px-2.5 py-1 text-exam-strong">
                    {exams.filter((e) => e.kind === "exam").length} exam
                  </span>
                )}
                {exams.some((e) => e.kind === "result") && (
                  <span className="rounded-full bg-result/10 px-2.5 py-1 text-result-strong">
                    {exams.filter((e) => e.kind === "result").length} result
                  </span>
                )}
                {userEvents.length > 0 && (
                  <span className="rounded-full bg-accent/10 px-2.5 py-1 text-accent">
                    {userEvents.length} of yours
                  </span>
                )}
                {todos.length > 0 && (
                  <span className={`rounded-full px-2.5 py-1 ${allDone ? "bg-fest/10 text-fest-strong" : "bg-surface-2 text-ink-2"}`}>
                    {allDone ? "All tasks done" : `${done}/${todos.length} tasks`}
                  </span>
                )}
                {total + todos.length === 0 && <span className="rounded-full bg-surface-2 px-2.5 py-1 text-ink-3">Free day</span>}
              </div>
            </div>

            {/* Scrollable body */}
            <div className="min-h-0 flex-1 overflow-y-auto px-6">
              {/* On this day */}
              {total > 0 && (
                <section className="pb-2">
                  <p className="pt-1 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-ink-3">On this day</p>
                  <ul className="mt-1 divide-y divide-line/60">
                    <AnimatePresence initial={false}>
                      {festivals.map((f) => (
                        <Item key={f.id} tone="festival" icon={f.icon} title={f.name} label={f.isHoliday ? "Festival · Public holiday" : "Festival"} />
                      ))}
                      {exams.map((x) => (
                        <Item
                          key={x.id}
                          tone={x.kind}
                          icon={x.icon}
                          title={x.name}
                          label={`${x.kind === "exam" ? "Exam" : "Result"} · ${x.org}${x.status === "expected" ? " · expected" : ""}`}
                        />
                      ))}
                      {userEvents.map((u) => (
                        <Item
                          key={u.id}
                          tone={u.kind === "deadline" ? "due" : "note"}
                          icon={u.kind === "deadline" ? "⏳" : "📌"}
                          title={u.title}
                          label={u.kind === "deadline" ? "Last date" : "My event"}
                          onRemove={() => removeUserEvent(u.id)}
                        />
                      ))}
                    </AnimatePresence>
                  </ul>
                </section>
              )}

              {/* Tasks */}
              <section className={`pb-3 ${total > 0 ? "mt-3 border-t border-line/60 pt-4" : "pt-1"}`}>
                <div className="flex items-center justify-between">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-ink-3">Tasks</p>
                  <div className="flex items-center gap-2">
                    {done > 0 && (
                      <button
                        type="button"
                        onClick={() => clearDoneTodos(dateKey)}
                        className="text-[11px] font-medium text-ink-3 transition-colors hover:text-ink"
                      >
                        Clear done
                      </button>
                    )}
                    {todos.length > 0 && <ProgressRing done={done} total={todos.length} />}
                  </div>
                </div>

                {todos.length === 0 ? (
                  <p className="mt-2 text-[12.5px] leading-relaxed text-ink-3">
                    Nothing to do yet. Add tasks below and tick them off as you go.
                  </p>
                ) : (
                  <ul className="mt-1">
                    <AnimatePresence initial={false}>
                      {todos.map((t) => (
                        <TaskItem key={t.id} todo={t} />
                      ))}
                    </AnimatePresence>
                  </ul>
                )}
                <AnimatePresence>
                  {allDone && (
                    <motion.p
                      key="done"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-1 text-[12px] font-semibold text-fest-strong"
                    >
                      🎉 All done for this day
                    </motion.p>
                  )}
                </AnimatePresence>
              </section>
            </div>

            {/* Composer */}
            <form onSubmit={submit} className="border-t border-line/60 bg-surface-2/50 px-4 py-3 sm:px-5">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  autoFocus
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={MODE_META[mode].placeholder}
                  maxLength={120}
                  className="h-10 min-w-0 flex-1 rounded-full border border-line bg-surface px-4 text-[13.5px] text-ink shadow-card placeholder:text-ink-3 focus:border-accent focus:outline-none"
                />
                <motion.button
                  type="submit"
                  disabled={!text.trim()}
                  whileTap={{ scale: 0.94 }}
                  aria-label={`Add ${MODE_META[mode].label.toLowerCase()}`}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl leading-none shadow-card transition-[opacity,filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 ${MODE_META[mode].active}`}
                >
                  +
                </motion.button>
              </div>
              <div className="mt-2 flex items-center gap-1" role="radiogroup" aria-label="What to add">
                {(Object.keys(MODE_META) as Mode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={mode === m}
                    onClick={() => {
                      setMode(m);
                      inputRef.current?.focus();
                    }}
                    className={`h-7 rounded-full px-3 text-[11px] font-semibold transition-[background-color,color] ${
                      mode === m ? MODE_META[m].active : "text-ink-2 hover:bg-surface hover:text-ink"
                    }`}
                  >
                    <span aria-hidden className="mr-1">{MODE_META[m].icon}</span>
                    {MODE_META[m].label}
                  </button>
                ))}
                <span className="ml-auto hidden text-[10.5px] text-ink-3 sm:inline">Enter to add</span>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
