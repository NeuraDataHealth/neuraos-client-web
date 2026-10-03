"use client";

import { clsx } from "clsx";
import { useActionState } from "react";
import { subscribe } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";

const initialState: Awaited<ReturnType<typeof subscribe>> = { status: "idle", message: "" };

/** Email field + Subscribe key. Works without JS; with JS, shows the result inline. */
export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribe, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2.5">
        <Text as="label" htmlFor="brief-email" variant="field" className="sr-only">
          Email address
        </Text>
        <Text
          as="input"
          id="brief-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@hospital.org"
          aria-describedby="brief-status"
          variant="field"
          className="h-13 min-w-50 flex-1 rounded-full border border-night-border bg-night-field px-5 text-night-fg inset-shadow-field placeholder:text-muted"
        />
        <Button type="submit" look="accent-field" disabled={pending}>
          Subscribe
        </Button>
      </div>
      <Text
        id="brief-status"
        variant="caption"
        aria-live="polite"
        className={clsx(state.status === "success" ? "text-accent-hi" : "text-night-link")}
      >
        {state.message}
      </Text>
    </form>
  );
}
