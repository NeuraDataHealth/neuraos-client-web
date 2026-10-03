/** Fixed page background: a soft haze over a white-to-mist wash. */
export function Backdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 bg-(image:--gradient-backdrop)"
    />
  );
}
