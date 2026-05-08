"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const pad = (n: number) => String(n).padStart(2, "0");

function ymd(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function parseYmd(s: string): { y: number; m: number; d: number } | null {
  if (!s) return null;
  const [y, m, d] = s.split("-").map((p) => parseInt(p, 10));
  if (!y || !m || !d) return null;
  return { y, m: m - 1, d };
}

function formatLabel(value: string): string {
  const p = parseYmd(value);
  if (!p) return "날짜 선택";
  const date = new Date(p.y, p.m, p.d);
  const wk = WEEKDAYS[date.getDay()];
  return `${p.y}-${pad(p.m + 1)}-${pad(p.d)} (${wk})`;
}

export function DatePickerField({
  value,
  onChange,
  min,
  max,
  placeholder = "날짜 선택",
}: {
  value: string;
  onChange: (next: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const today = useMemo(() => new Date(), []);
  const initial = parseYmd(value) ?? {
    y: today.getFullYear(),
    m: today.getMonth(),
    d: today.getDate(),
  };
  const [view, setView] = useState({ y: initial.y, m: initial.m });

  useEffect(() => {
    const p = parseYmd(value);
    if (p) setView({ y: p.y, m: p.m });
    setOpen(false);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const startWeekday = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  function isDisabled(day: number): boolean {
    const s = ymd(view.y, view.m, day);
    if (min && s < min) return true;
    if (max && s > max) return true;
    return false;
  }

  function prevMonth() {
    setView((v) =>
      v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 },
    );
  }
  function nextMonth() {
    setView((v) =>
      v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 },
    );
  }

  function pick(day: number) {
    onChange(ymd(view.y, view.m, day));
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-left text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950"
      >
        {value ? (
          <span>{formatLabel(value)}</span>
        ) : (
          <span className="text-zinc-400">{placeholder}</span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              aria-label="이전 달"
              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              ‹
            </button>
            <span className="text-sm font-medium">
              {view.y}년 {view.m + 1}월
            </span>
            <button
              type="button"
              onClick={nextMonth}
              aria-label="다음 달"
              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center text-[11px]">
            {WEEKDAYS.map((w, i) => (
              <div
                key={w}
                className={`py-1 ${
                  i === 0
                    ? "text-red-500"
                    : i === 6
                      ? "text-blue-500"
                      : "text-zinc-500"
                }`}
              >
                {w}
              </div>
            ))}
            {cells.map((day, i) =>
              day === null ? (
                <div key={i} />
              ) : (
                <button
                  key={i}
                  type="button"
                  disabled={isDisabled(day)}
                  onClick={() => pick(day)}
                  className={`flex h-9 items-center justify-center rounded-md text-sm transition ${
                    ymd(view.y, view.m, day) === value
                      ? "bg-indigo-600 text-white"
                      : isDisabled(day)
                        ? "text-zinc-300 dark:text-zinc-700"
                        : "hover:bg-indigo-50 dark:hover:bg-indigo-950"
                  }`}
                >
                  {day}
                </button>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
