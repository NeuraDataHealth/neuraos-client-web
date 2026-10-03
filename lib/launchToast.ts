/**
 * The single "launching soon" notice (design: one toast, 2.6s, a new message
 * replaces the current one and restarts the timer). A tiny external store so
 * any button can trigger it and <LaunchToast> can render it.
 */

type LaunchToastState = {
  message: string;
  visible: boolean;
  /** Increments on every show, so repeat messages are announced again. */
  count: number;
};

const VISIBLE_FOR_MS = 2600;

const initialState: LaunchToastState = { message: "", visible: false, count: 0 };
let state = initialState;
let hideTimer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function setState(next: LaunchToastState) {
  state = next;
  listeners.forEach((listener) => listener());
}

export function showLaunchToast(message: string) {
  setState({ message, visible: true, count: state.count + 1 });
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => setState({ ...state, visible: false }), VISIBLE_FOR_MS);
}

export function subscribeLaunchToast(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const getLaunchToast = () => state;
export const getServerLaunchToast = () => initialState;
