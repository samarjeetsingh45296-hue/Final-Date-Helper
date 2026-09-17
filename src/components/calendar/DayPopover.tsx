"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { formatLongDate, WEEKDAY_LONG } from "@/lib/calendar";
import type { Festival } from "@/lib/festivals";
import type { ExamEvent } from "@/lib/exams";
import { addUserEvent, removeUserEvent, USER_KIND_LABEL, type UserEvent, type UserEventKind } from "@/lib/userEvents";
import { addTodo, clearDoneTodos, removeTodo, toggleTodo, type Todo } from "@/lib/todos";
import { downloadIcs, type IcsEvent } from "@/lib/ics";
import { Check } from "@/components/ui/icons";
import FestivalBadge from "./FestivalBadge";

interface DayPopoverProps {
  /** ISO date of the open day, or null when closed */
  dateKey: string | null;
  festivals: Festival[];
  exams: ExamEvent[];
  userEvents: UserEvent[];
  todos: Todo[];
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

/* -------------------------------------------------------------------------- */
/*  Small pieces                                                              */
/* -------------------------------------------------------------------------- */

function SectionTitle({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="mb-1.5 flex items-center justify-between px-1">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-3">{children}</p>
      {aside && <span className="text-[11px] tabular-nums text-ink-3">{aside}</span>}
    </div>
  );
}

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
      className="group flex items-start gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-2"
    >
      <span aria-hidden className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${DOT[tone]}`} />
      <span aria-hidden className="text-[15px] leading-5">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[13px] font-semibold leading-5 text-ink">{title}</span>
          {tag}
        </span>
        {meta && <span className="mt-0.5 line-clamp-2 block text-[11.5px] leading-snug text-ink-2">{meta}</span>}
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${title}`}
          title="Remove"
          className="rounded-md px-1 text-[15px] leading-5 text-ink-3 opacity-0 transition-[opacity,color] hover:text-result focus-visible:opacity-100 group-hover:opacity-100"
        >
          ×
        </button>
      )}
    </motion.li>
  );
}

function TodoItem({ todo }: { todo: Todo }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-2"
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={todo.done}
        onClick={() => toggleTodo(todo.id)}
        aria-label={todo.done ? `Mark "${todo.text}" as not done` : `Mark "${todo.text}" as done`}
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-[background-color,border-color,transform] duration-200 active:scale-90 ${
          todo.done
            ? "border-fest bg-fest text-white shadow-[0_4px_10px_-4px_var(--color-fest)]"
            : "border-line-strong bg-surface hover:border-accent"
        }`}
      >
        <AnimatePresence initial={false}>
          {todo.done && (
            <motion.span
              key="tick"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 600, damping: 26 }}
              className="flex"
            >
              <Check className="h-3 w-3" strokeWidth={3} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <span
        className={`relative min-w-0 flex-1 text-[13px] leading-5 transition-colors duration-300 ${
          todo.done ? "text-ink-3" : "text-ink"
        }`}
      >
        {todo.text}
        {/* animated strike-through */}
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
        className="rounded-md px-1 text-[15px] leading-5 text-ink-3 opacity-0 transition-[opacity,color] hover:text-result focus-visible:opacity-100 group-hover:opacity-100"
      >
        ×
      </button>
    </motion.li>
  );
}

/* -------------------------------------------------------------------------- */
/*  Popup                                                                     */
/* -------------------------------------------------------------------------- */

/** Centered dialog for one day: what's on, a to-do list, and an add form. */
export default function DayPopover({ dateKey, festivals, exams, userEvents, todos, onClose }: DayPopoverProps) {
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<UserEventKind>("event");
  const [todoText, setTodoText] = useState("");
  const todoRef = useRef<HTMLInputElement>(null);
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

  const submitEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateKey || !title.trim()) return;
    addUserEvent({ date: dateKey, title, kind });
    setTitle("");
    setKind("event");
  };

  const submitTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateKey || !todoText.trim()) return;
    addTodo(dateKey, todoText);
    setTodoText("");
    todoRef.current?.focus();
  };

  const total = festivals.length + exams.length + userEvents.length;
  const doneCount = todos.filter((t) => t.done).length;
  const progress = todos.length ? Math.round((doneCount / todos.length) * 100) : 0;
  const allDone = todos.length > 0 && doneCount === todos.length;

  const exportDay = () => {
    if (!dateKey) return;
    const items: IcsEvent[] = [
      ...festivals.map((f) => ({ uid: f.id, date: f.date, title: `${f.icon} ${f.name}`, description: f.description })),
      ...exams.map((x) => ({ uid: x.id, date: x.date, title: `${x.icon} ${x.name}`, description: `${x.org} · ${x.description}` })),
      ...userEvents.map((u) => ({
        uid: u.id,
        date: u.date,
        title: `${u.kind === "deadline" ? "⏳ Last date: " : "📌 "}${u.title}`,
      })),
      ...todos.map((t) => ({ uid: t.id, date: t.date, title: `${t.done ? "☑" : "☐"} ${t.text}` })),
    ];
    downloadIcs(items, formatLongDate(parse(dateKey)), `ccc-master-calendar-${dateKey}`);
  };

  return (
    <AnimatePresence>
      {open && dateKey && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 p-0 backdrop-blur-md sm:items-center sm:p-6"
        >
          <motion.div
            key={dateKey}
            role="dialog"
            aria-modal="true"
            aria-labelledby="day-popover-title"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.8 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-t-2xl border border-line bg-surface shadow-pop sm:rounded-2xl"
          >
            {/* Accent strip */}
            <span aria-hidden className="brand-gradient absolute inset-x-0 top-0 h-1" />

            <div className="max-h-[88vh] overflow-y-auto p-4 pt-5 sm:p-5 sm:pt-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 flex-col items-center justify-center rounded-xl border border-line bg-surface-2 shadow-card">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-3">
                      {WEEKDAY_LONG[parse(dateKey).getDay()].slice(0, 3)}
                    </span>
                    <span className="text-xl font-semibold leading-none tabular-nums text-ink">{parse(dateKey).getDate()}</span>
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                      {WEEKDAY_LONG[parse(dateKey).getDay()]}
                    </p>
                    <h3 id="day-popover-title" className="text-[16px] font-semibold tracking-[-0.01em] text-ink">
                      {formatLongDate(parse(dateKey))}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {total + todos.length > 0 && (
                    <button
                      type="button"
                      onClick={exportDay}
                      title="Export this day as .ics"
                      className="h-8 rounded-lg border border-line bg-surface px-2.5 text-[11.5px] font-semibold text-ink-2 transition-[background-color,color] hover:bg-surface-2 hover:text-ink"
                    >
                      Export
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-lg leading-none text-ink-2 transition-[background-color,color] hover:bg-surface-2 hover:text-ink"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {/* Left: what's on this day + add */}
                <div className="min-w-0">
                  <SectionTitle aside={`${total} ${total === 1 ? "item" : "items"}`}>On this day</SectionTitle>
                  {total === 0 ? (
                    <p className="rounded-lg border border-dashed border-line px-3 py-3 text-[12px] text-ink-3">
                      Nothing scheduled. Add an event below.
                    </p>
                  ) : (
                    <ul className="flex max-h-48 flex-col overflow-y-auto">
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
                                {f.isHoliday && <FestivalBadge tone="holiday">Holiday</FestivalBadge>}
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
                            meta={`${x.org}${x.window ? ` · ${x.window}` : ""}`}
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

                  {/* Add event */}
                  <form onSubmit={submitEvent} className="mt-3 rounded-xl border border-line bg-surface-2/60 p-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">Add to this day</p>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Fee payment, Form submission"
                      maxLength={80}
                      className="mt-1.5 h-9 w-full rounded-lg border border-line bg-surface px-2.5 text-[13px] text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
                    />
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex rounded-lg border border-line bg-surface p-0.5" role="radiogroup" aria-label="Type">
                        {(["event", "deadline"] as UserEventKind[]).map((k) => (
                          <button
                            key={k}
                            type="button"
                            role="radio"
                            aria-checked={kind === k}
                            onClick={() => setKind(k)}
                            className={`h-7 whitespace-nowrap rounded-[6px] px-2.5 text-[11px] font-semibold transition-[background-color,color] ${
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
                      <motion.button
                        type="submit"
                        disabled={!title.trim()}
                        whileTap={{ scale: 0.96 }}
                        className={`h-8 rounded-lg px-3.5 text-[11.5px] font-semibold text-white shadow-card transition-[opacity,background-color] disabled:cursor-not-allowed disabled:opacity-40 ${
                          kind === "deadline" ? "bg-due hover:bg-due-strong" : "bg-accent hover:bg-accent-strong"
                        }`}
                      >
                        Add
                      </motion.button>
                    </div>
                  </form>
                </div>

                {/* Right: to-do list */}
                <div className="min-w-0 sm:border-l sm:border-line sm:pl-5">
                  <SectionTitle
                    aside={
                      todos.length ? (
                        <span className={allDone ? "font-semibold text-fest-strong" : ""}>
                          {doneCount}/{todos.length} done
                        </span>
                      ) : undefined
                    }
                  >
                    To-do list
                  </SectionTitle>

                  {/* Progress */}
                  {todos.length > 0 && (
                    <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-surface-2 ring-1 ring-inset ring-line">
                      <motion.div
                        initial={false}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className={`h-full rounded-full ${allDone ? "bg-fest" : "brand-gradient"}`}
                      />
                    </div>
                  )}

                  <form onSubmit={submitTodo} className="flex gap-1.5">
                    <input
                      ref={todoRef}
                      autoFocus
                      value={todoText}
                      onChange={(e) => setTodoText(e.target.value)}
                      placeholder="Add a task and press Enter"
                      maxLength={120}
                      className="h-9 min-w-0 flex-1 rounded-lg border border-line bg-surface px-2.5 text-[13px] text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
                    />
                    <motion.button
                      type="submit"
                      disabled={!todoText.trim()}
                      whileTap={{ scale: 0.94 }}
                      aria-label="Add task"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-lg leading-none text-white shadow-card transition-[opacity,background-color] hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      +
                    </motion.button>
                  </form>

                  {todos.length === 0 ? (
                    <p className="mt-3 rounded-lg border border-dashed border-line px-3 py-3 text-[12px] text-ink-3">
                      No tasks yet. Add what needs doing on this day and tick them off as you go.
                    </p>
                  ) : (
                    <>
                      <ul className="mt-2 flex max-h-56 flex-col overflow-y-auto">
                        <AnimatePresence initial={false}>
                          {todos.map((t) => (
                            <TodoItem key={t.id} todo={t} />
                          ))}
                        </AnimatePresence>
                      </ul>
                      <AnimatePresence>
                        {allDone && (
                          <motion.p
                            key="done"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-2 px-2 text-[12px] font-semibold text-fest-strong"
                          >
                            🎉 All done for this day
                          </motion.p>
                        )}
                      </AnimatePresence>
                      {doneCount > 0 && (
                        <button
                          type="button"
                          onClick={() => clearDoneTodos(dateKey)}
                          className="mt-1.5 px-2 text-[11px] font-medium text-ink-3 underline-offset-2 transition-colors hover:text-ink hover:underline"
                        >
                          Clear completed
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
