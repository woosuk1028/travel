import { api } from "./api";

export type PushPermissionState =
  | "unsupported"
  | "default"
  | "granted"
  | "denied"
  | "subscribed";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function pushSupported(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function getPushState(): Promise<PushPermissionState> {
  if (!pushSupported()) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  if (Notification.permission === "default") return "default";
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return "granted";
  const sub = await reg.pushManager.getSubscription();
  return sub ? "subscribed" : "granted";
}

export async function subscribePush(): Promise<PushPermissionState> {
  if (!pushSupported()) return "unsupported";

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission as PushPermissionState;

  const reg =
    (await navigator.serviceWorker.getRegistration()) ??
    (await navigator.serviceWorker.ready);

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    const { publicKey } = await api.get<{ publicKey: string | null }>(
      "/push/vapid-public-key",
    );
    if (!publicKey) {
      throw new Error("서버에 VAPID 공개 키가 설정되지 않았습니다.");
    }
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const json = sub.toJSON() as {
    endpoint: string;
    keys?: { p256dh?: string; auth?: string };
  };
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error("구독 정보가 불완전합니다.");
  }

  await api.post("/push/subscribe", {
    endpoint: json.endpoint,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
    userAgent: navigator.userAgent,
  });

  return "subscribed";
}

export async function unsubscribePush(): Promise<PushPermissionState> {
  if (!pushSupported()) return "unsupported";
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return "granted";
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return "granted";
  const endpoint = sub.endpoint;
  await sub.unsubscribe().catch(() => undefined);
  await api
    .del(`/push/unsubscribe?endpoint=${encodeURIComponent(endpoint)}`)
    .catch(() => undefined);
  return "granted";
}
