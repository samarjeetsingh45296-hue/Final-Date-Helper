"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "./icons";

export interface SelectOption<T extends string | number> {
  value: T;
  label: string;
}

interface SelectProps<T extends string | number> {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  label: string;
  /** Minimum width of the trigger, e.g. "7rem" */
  minWidth?: string;
}

/**
 * Accessible listbox dropdown (combobox pattern) with keyboard navigation,
 * outside-click dismissal and a spring-in panel.
 */
export default function Select<T extends string | number>({
  value,
  options,
  onChange,
  label,
  minWidth = "6.5rem",
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, options.findIndex((o) => o.value === value)),
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  const selected = options.find((o) => o.value === value);

  const openMenu = useCallback(() => {
    setActiveIndex(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  }, [options, value]);

  const commit = useCallback(
    (index: number) => {
      const opt = options[index];
      if (opt) onChange(opt.value);
      setOpen(false);
    },
    [onChange, options],
  );

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  // Keep the active option scrolled into view
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) openMenu();
        else setActiveIndex((i) => Math.min(options.length - 1, i + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) openMenu();
        else setActiveIndex((i) => Math.max(0, i - 1));
        break;
      case "Home":
        if (open) {
          e.preventDefault();
          setActiveIndex(0);
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          setActiveIndex(options.length - 1);
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (open) commit(activeIndex);
        else openMenu();
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        break;
      case "Tab":
        setOpen(false);
        break;
    }
    // Stop the global month/year shortcuts from firing while interacting here.
    e.stopPropagation();
  };

  return (
    <div ref={rootRef} className="relative" onKeyDown={onKeyDown}>
      <button
        type="button"
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => (open ? setOpen(false) : openMenu())}
        style={{ minWidth }}
        className="group inline-flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-line bg-surface px-2.5 text-[13px] font-medium text-ink shadow-card transition-[border-color,box-shadow,background-color] duration-200 hover:border-line-strong hover:shadow-hover/40 active:scale-[0.98]"
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-ink-3 transition-transform duration-200 group-hover:text-ink-2 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listboxId}
            ref={listRef}
            role="listbox"
            aria-label={label}
            aria-activedescendant={`${listboxId}-${activeIndex}`}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 500, damping: 32, mass: 0.6 }}
            className="absolute right-0 z-50 mt-2 max-h-72 w-max min-w-full origin-top-right overflow-y-auto rounded-xl border border-line bg-surface p-1.5 shadow-pop"
          >
            {options.map((opt, i) => {
              const isSelected = opt.value === value;
              const isActive = i === activeIndex;
              return (
                <li
                  key={String(opt.value)}
                  id={`${listboxId}-${i}`}
                  role="option"
                  aria-selected={isSelected}
                  onPointerEnter={() => setActiveIndex(i)}
                  onClick={() => commit(i)}
                  className={`flex cursor-pointer items-center justify-between gap-6 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive ? "bg-accent-soft text-accent" : "text-ink-2"
                  } ${isSelected ? "font-semibold" : "font-medium"}`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="h-4 w-4 text-accent" />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
