"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Trip } from "@/lib/types";

export function SharePanel({
  trip,
  onCodeChanged,
}: {
  trip: Trip;
  onCodeChanged: (code: string) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    if (!trip.shareCode) return;
    try {
      await navigator.clipboard.writeText(trip.shareCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  async function regenerate() {
    if (
      !confirm(
        "코드를 새로 생성하면 기존 코드는 사용할 수 없게 됩니다. 진행할까요?",
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await api.post<{ shareCode: string }>(
        `/trips/${trip.id}/share-code`,
      );
      onCodeChanged(res.shareCode);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">공유</h2>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <p className="text-xs text-zinc-500">
          이 코드를 알려주면 상대가 여행 일정을 함께 볼 수 있습니다 (읽기 전용).
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 select-all rounded-md bg-indigo-50 px-3 py-2 text-center font-mono text-lg font-semibold tracking-widest text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">
            {trip.shareCode ?? "—"}
          </code>
          <button
            type="button"
            onClick={copyCode}
            disabled={!trip.shareCode}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm transition hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            {copied ? "복사됨" : "복사"}
          </button>
          <button
            type="button"
            onClick={regenerate}
            disabled={busy}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm transition hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            title="코드 새로 생성"
          >
            새 코드
          </button>
        </div>
        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
