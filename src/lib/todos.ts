"use client";

import { useSyncExternalStore } from "react";

/**
 * Per-day to-do items ticked off from the day popup. Persisted in
 * localStorage on this device; exposed through a tiny external store so
 * React re-renders when the list changes (including from another tab).
 */

export interface Todo {
  id: string;
  /** ISO date `YYYY-MM-DD` */
  date: string;
  text: string;
  done: boolean;
  createdAt: number;
}

const STORAGE_KEY = "festival-calendar:todos";
const EMPTY: Todo[] = [];

let cache: Todo[] | null = null;
const listeners = new Set<() => void>();

function read(): Todo[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Todo[]) : [];
    cache = Array.isArray(parsed) ? parsed : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: Todo[]): void {
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — items still live for this session */
  }
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = null;
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function useTodos(): Todo[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function addTodo(date: string, text: string): Todo | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const todo: Todo = {
    id: `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    date,
    text: trimmed,
    done: false,
    createdAt: Date.now(),
  };
  write([...read(), todo]);
  return todo;
}

export function toggleTodo(id: string): void {
  write(read().map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
}

export function removeTodo(id: string): void {
  write(read().filter((t) => t.id !== id));
}

export function clearDoneTodos(date: string): void {
  write(read().filter((t) => !(t.date === date && t.done)));
}

export function indexTodos(todos: Todo[]): Map<string, Todo[]> {
  const map = new Map<string, Todo[]>();
  for (const t of todos) {
    const arr = map.get(t.date);
    if (arr) arr.push(t);
    else map.set(t.date, [t]);
  }
  return map;
}
