"use client";

import { useMemo } from "react";

const HOURS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0"),
);
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

const pad = (n: number) => String(n).padStart(2, "0");

function listDays(startDate: string, endDate: string): string[] {
  const out: string[] = [];
  const s = new Date(`${startDate}T00:00:00`);
  const e = new Date(`${endDate}T00:00:00`);
  const cur = new Date(s);
  while (cur.getTime() <= e.getTime()) {
    out.push(
      `${cur.getFullYear()}-${pad(cur.getMonth() + 1)}-${pad(cur.getDate())}`,
    );
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

function dayLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${d.getMonth() + 1}/${d.getDate()} (${weekday})`;
}

/** Snap "HH:MM" minutes to the nearest available 5-minute step. */
function snapMinute(min: string): string {
  const n = parseInt(min, 10);
  if (!Number.isFinite(n)) return "00";
  const rounded = Math.round(n / 5) * 5;
  const clamped = Math.max(0, Math.min(55, rounded));
  return pad(clamped);
}

export function DateTimePicker({
  value,
  startDate,
  endDate,
  onChange,
}: {
  /** "YYYY-MM-DDTHH:MM" */
  value: string;
  startDate: string;
  endDate: string;
  onChange: (next: string) => void;
}) {
  const days = useMemo(
    () => listDays(startDate, endDate),
    [startDate, endDate],
  );

  const [datePart, timePart] = value
    ? value.split("T")
    : [days[0] ?? "", "09:00"];
  const safeDate = days.includes(datePart) ? datePart : days[0] ?? "";
  const [rawHour, rawMinute] = (timePart ?? "09:00").split(":");
  const hour = HOURS.includes(rawHour) ? rawHour : "09";
  const minute = MINUTES.includes(rawMinute)
    ? rawMinute
    : snapMinute(rawMinute ?? "00");

  function update(d: string, h: string, m: string) {
    onChange(`${d}T${h}:${m}`);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {days.map((d, i) => {
          const active = d === safeDate;
          return (
            <button
              key={d}
              type="button"
              onClick={() => update(d, hour, minute)}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                active
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "border border-zinc-300 bg-white text-zinc-700 hover:border-indigo-400 hover:bg-indigo-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-indigo-500 dark:hover:bg-indigo-950"
              }`}
            >
              <span className="block leading-tight">Day {i + 1}</span>
              <span className="block text-[10px] opacity-80">
                {dayLabel(d)}
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <select
          value={hour}
          onChange={(e) => update(safeDate, e.target.value, minute)}
          className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950"
        >
          {HOURS.map((h) => (
            <option key={h} value={h}>
              {h}시
            </option>
          ))}
        </select>
        <span className="text-zinc-500">:</span>
        <select
          value={minute}
          onChange={(e) => update(safeDate, hour, e.target.value)}
          className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950"
        >
          {MINUTES.map((m) => (
            <option key={m} value={m}>
              {m}분
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
