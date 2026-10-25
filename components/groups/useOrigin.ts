"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** This site's origin ("https://…") for invite links; empty during server render. */
export function useOrigin(): string {
  return useSyncExternalStore(noop, () => window.location.origin, () => "");
}
