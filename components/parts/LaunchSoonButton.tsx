"use client";

import type { ComponentPropsWithoutRef } from "react";
import { Button } from "@/components/ui/Button";
import { showLaunchToast } from "@/lib/launchToast";

type LaunchSoonButtonProps = Omit<ComponentPropsWithoutRef<typeof Button>, "onClick" | "type"> & {
  /** Platform line shown in the notice, e.g. "NeuraOS for iOS". */
  message: string;
};

/** A key button for an app that hasn't launched yet: shows the "launching soon" notice. */
export function LaunchSoonButton({ message, ...rest }: LaunchSoonButtonProps) {
  return <Button {...rest} onClick={() => showLaunchToast(message)} />;
}
