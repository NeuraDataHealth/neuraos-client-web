/** Tiny store for the app toast: one message at a time; a new one replaces the old. */
export type ToastMessage = { id: number; text: string };

const HIDE_AFTER_MS = 2600;

let current: ToastMessage | null = null;
let nextId = 1;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function showToast(text: string) {
  current = { id: nextId++, text };
  clearTimeout(timer);
  timer = setTimeout(() => {
    current = null;
    emit();
  }, HIDE_AFTER_MS);
  emit();
}

export function subscribeToast(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getToast() {
  return current;
}

export function getServerToast() {
  return null;
}
