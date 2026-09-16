"use client";

import { useSyncExternalStore } from "react";

/**
 * Personal events the visitor adds from the day popup. Persisted in
 * localStorage on this device only; exposed through a tiny external store so
 * React re-renders when the list changes (including from another tab).
 */

export type UserEventKind = "event" | "deadline";

export interface UserEvent {
  id: string;
  /** ISO date `YYYY-MM-DD` */
  date: string;
  title: string;
  note?: string;
  kind: UserEventKind;
  createdAt: number;
}

const STORAGE_KEY = "festival-calendar:user-events";
const EMPTY: UserEvent[] = [];

let cache: UserEvent[] | null = null;
const listeners = new Set<() => void>();

function read(): UserEvent[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as UserEvent[]) : [];
    cache = Array.isArray(parsed) ? parsed : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: UserEvent[]): void {
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — events still live for this session */
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

export function useUserEvents(): UserEvent[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function addUserEvent(input: Omit<UserEvent, "id" | "createdAt">): UserEvent {
  const event: UserEvent = {
    ...input,
    title: input.title.trim(),
    note: input.note?.trim() || undefined,
    id: `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
  };
  write([...read(), event].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)));
  return event;
}

export function removeUserEvent(id: string): void {
  write(read().filter((e) => e.id !== id));
}

export function indexUserEvents(events: UserEvent[]): Map<string, UserEvent[]> {
  const map = new Map<string, UserEvent[]>();
  for (const e of events) {
    const arr = map.get(e.date);
    if (arr) arr.push(e);
    else map.set(e.date, [e]);
  }
  return map;
}

export const USER_KIND_LABEL: Record<UserEventKind, string> = {
  event: "My event",
  deadline: "Last date",
};
