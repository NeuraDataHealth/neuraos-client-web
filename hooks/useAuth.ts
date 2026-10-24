"use client";

import { use } from "react";
import { AuthContext, type AuthState } from "@/components/AuthProvider";

/** Auth state from the nearest AuthProvider (app, admin and sign-in layouts). */
export function useAuth(): AuthState {
  const auth = use(AuthContext);
  if (!auth) throw new Error("useAuth must be used inside <AuthProvider>");
  return auth;
}
