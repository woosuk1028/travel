"use client";

import { useEffect, useState } from "react";

const POLL_INTERVAL_MS = 5 * 60 * 1000;

export function UpdatePrompt() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(
    null,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    let registration: ServiceWorkerRegistration | undefined;
    let reloading = false;
    let pollTimer: ReturnType<typeof setInterval> | undefined;

    function trackWorker(worker: ServiceWorker | null) {
      if (!worker) return;
      // Already installed and waiting
      if (worker.state === "installed" && navigator.serviceWorker.controller) {
        setWaitingWorker(worker);
        return;
      }
      worker.addEventListener("statechange", () => {
        if (
          worker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          setWaitingWorker(worker);
        }
      });
    }

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;
      registration = reg;

      // If a new SW already finished installing while the page was gone
      if (reg.waiting && navigator.serviceWorker.controller) {
        setWaitingWorker(reg.waiting);
      }

      // Watch future updates
      reg.addEventListener("updatefound", () => {
        trackWorker(reg.installing);
      });

      // Periodic update check (in addition to browser's own 24h check)
      pollTimer = setInterval(() => {
        reg.update().catch(() => undefined);
      }, POLL_INTERVAL_MS);
    });

    // When the new SW takes control, refresh the page once
    const onControllerChange = () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );

    return () => {
      if (pollTimer) clearInterval(pollTimer);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
    };
  }, []);

  function applyUpdate() {
    if (!waitingWorker) return;
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  }

  function dismiss() {
    setWaitingWorker(null);
  }

  if (!waitingWorker) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 flex items-center justify-between gap-3 rounded-xl border border-indigo-300 bg-white p-3 shadow-lg sm:left-auto sm:right-4 sm:max-w-sm dark:border-indigo-700 dark:bg-zinc-900">
      <div className="flex flex-col">
        <span className="text-sm font-medium">새 버전이 있습니다</span>
        <span className="text-xs text-zinc-500">
          업데이트하면 페이지가 새로고침됩니다.
        </span>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={dismiss}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          나중에
        </button>
        <button
          type="button"
          onClick={applyUpdate}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
        >
          업데이트
        </button>
      </div>
    </div>
  );
}
