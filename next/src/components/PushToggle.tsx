"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  getPushState,
  pushSupported,
  PushPermissionState,
  subscribePush,
  unsubscribePush,
} from "@/lib/push";

export function PushToggle() {
  const { user } = useAuth();
  const [state, setState] = useState<PushPermissionState>("default");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (!pushSupported()) {
      setState("unsupported");
      return;
    }
    getPushState().then(setState);
  }, [user]);

  if (!user) return null;
  if (state === "unsupported") return null;

  async function toggle() {
    setBusy(true);
    try {
      if (state === "subscribed") {
        const next = await unsubscribePush();
        setState(next);
      } else {
        const next = await subscribePush();
        setState(next);
        if (next === "denied") {
          alert(
            "알림 권한이 거부되어 있습니다. 브라우저 사이트 설정에서 허용해주세요.",
          );
        }
      }
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const subscribed = state === "subscribed";
  const denied = state === "denied";

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy || denied}
      title={
        denied
          ? "알림이 차단되어 있습니다. 브라우저 설정에서 허용해주세요."
          : subscribed
            ? "알림 끄기"
            : "알림 켜기"
      }
      aria-label={subscribed ? "알림 끄기" : "알림 켜기"}
      className={`rounded-md border px-2.5 py-1.5 text-sm transition ${
        subscribed
          ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950 dark:text-indigo-200"
          : "border-zinc-300 hover:border-zinc-500 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
      } disabled:opacity-50`}
    >
      {subscribed ? "🔔" : "🔕"}
    </button>
  );
}
