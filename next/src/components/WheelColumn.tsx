"use client";

import { useEffect, useRef } from "react";

const ITEM_HEIGHT = 36; // px
const VISIBLE = 5; // odd number
const CENTER = Math.floor(VISIBLE / 2);

export function WheelColumn({
  items,
  value,
  onChange,
  suffix,
  itemLabel,
  className = "w-16",
}: {
  items: string[];
  value: string;
  onChange: (next: string) => void;
  suffix?: string;
  itemLabel?: (item: string) => string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<number | null>(null);
  const externalSync = useRef(false);

  // Sync scroll position when external value changes
  useEffect(() => {
    if (!ref.current) return;
    const idx = items.indexOf(value);
    if (idx < 0) return;
    const target = idx * ITEM_HEIGHT;
    if (Math.abs(ref.current.scrollTop - target) > 1) {
      externalSync.current = true;
      ref.current.scrollTop = target;
      // release after the resulting scroll event fires
      setTimeout(() => (externalSync.current = false), 50);
    }
  }, [value, items]);

  function onScroll() {
    if (externalSync.current) return;
    if (settleTimer.current) window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      if (!ref.current) return;
      const idx = Math.round(ref.current.scrollTop / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      const next = items[clamped];
      // Snap exact pixel
      const target = clamped * ITEM_HEIGHT;
      if (Math.abs(ref.current.scrollTop - target) > 0.5) {
        ref.current.scrollTo({ top: target, behavior: "smooth" });
      }
      if (next !== value) onChange(next);
    }, 120);
  }

  return (
    <div
      className={`relative select-none ${className}`}
      style={{ height: ITEM_HEIGHT * VISIBLE }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 z-10 border-y border-zinc-300 bg-zinc-100/40 dark:border-zinc-700 dark:bg-zinc-800/40"
        style={{ top: ITEM_HEIGHT * CENTER, height: ITEM_HEIGHT }}
      />
      <div
        ref={ref}
        onScroll={onScroll}
        className="scrollbar-hide h-full overflow-y-scroll"
        style={{ scrollSnapType: "y mandatory" }}
      >
        <div style={{ height: ITEM_HEIGHT * CENTER }} aria-hidden="true" />
        {items.map((item) => {
          const display = itemLabel ? itemLabel(item) : item;
          const isActive = item === value;
          return (
            <div
              key={item}
              style={{
                height: ITEM_HEIGHT,
                scrollSnapAlign: "center",
                scrollSnapStop: "always",
              }}
              className={`flex items-center justify-center whitespace-nowrap transition-colors ${
                isActive
                  ? "text-base font-semibold text-zinc-900 dark:text-zinc-100"
                  : "text-sm text-zinc-400 dark:text-zinc-500"
              }`}
            >
              {display}
              {isActive && suffix ? (
                <span className="ml-0.5 text-xs text-zinc-500">{suffix}</span>
              ) : null}
            </div>
          );
        })}
        <div style={{ height: ITEM_HEIGHT * CENTER }} aria-hidden="true" />
      </div>
    </div>
  );
}
