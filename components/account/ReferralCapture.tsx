"use client";

import { useEffect } from "react";
import { saveReferralCode } from "@/components/account/referralCookie";

/** Invisible: keeps a landing-page ?ref=CODE in a cookie until first sign-in. */
export function ReferralCapture() {
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("ref");
    if (code) saveReferralCode(code);
  }, []);
  return null;
}
