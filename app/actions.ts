"use server";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SubscribeState = {
  status: "idle" | "success" | "error";
  message: string;
};

/**
 * Clinical brief sign-up. Validates the address; no mailing-list provider is
 * connected yet, so nothing is stored (see PROGRESS.md › Open questions).
 */
export async function subscribe(
  _previous: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  const email = formData.get("email");
  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
    return { status: "error", message: "Enter a valid email address." };
  }
  return { status: "success", message: "Thanks — the next brief lands on Monday." };
}
