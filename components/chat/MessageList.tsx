"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";

type MessageListProps = {
  children: ReactNode;
  /** Changes whenever content grows (message count, streamed length). */
  contentKey: string;
};

const PIN_DISTANCE = 120;

/**
 * Scrolling message column. Opens at the latest message and follows new
 * content while the reader is near the bottom; scrolling up stops following.
 */
export function MessageList({ children, contentKey }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el && pinned.current) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [contentKey]);

  return (
    <div
      ref={scrollRef}
      onScroll={(event) => {
        const el = event.currentTarget;
        pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < PIN_DISTANCE;
      }}
      className="min-h-0 flex-1 overflow-auto px-4 pt-3 pb-7 app:px-6"
    >
      <ol role="log" aria-label="Messages" aria-relevant="additions" className="mx-auto flex max-w-reading flex-col gap-6.5">
        {children}
      </ol>
    </div>
  );
}
