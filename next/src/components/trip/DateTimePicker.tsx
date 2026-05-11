"use client";

import { useMemo } from "react";
import { WheelColumn } from "@/components/WheelColumn";

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

  const dayLabels = useMemo(() => {
    const m = new Map<string, string>();
    days.forEach((d, i) => m.set(d, `Day ${i + 1} · ${dayLabel(d)}`));
    return m;
  }, [days]);

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex justify-center rounded-lg border border-zinc-200 bg-white py-1 dark:border-zinc-800 dark:bg-zinc-900">
        <WheelColumn
          items={days}
          value={safeDate}
          onChange={(d) => update(d, hour, minute)}
          itemLabel={(d) => dayLabels.get(d) ?? d}
          className="w-full max-w-xs"
        />
      </div>
      <div className="flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white py-1 dark:border-zinc-800 dark:bg-zinc-900">
        <WheelColumn
          items={HOURS}
          value={hour}
          onChange={(h) => update(safeDate, h, minute)}
          suffix="시"
        />
        <span className="text-zinc-400">:</span>
        <WheelColumn
          items={MINUTES}
          value={minute}
          onChange={(m) => update(safeDate, hour, m)}
          suffix="분"
        />
      </div>
    </div>
  );
}
