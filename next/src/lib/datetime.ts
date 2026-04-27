// Helpers for working with the trip date range and HTML datetime-local inputs.

const pad = (n: number) => String(n).padStart(2, "0");

/** trip.startDate / endDate (YYYY-MM-DD) → bounds for <input type="datetime-local" min/max>. */
export function datetimeBounds(startDate: string, endDate: string) {
  return {
    min: `${startDate}T00:00`,
    max: `${endDate}T23:59`,
  };
}

/** ISO string (UTC) → "YYYY-MM-DDTHH:mm" in local tz, suitable for datetime-local input. */
export function toLocalInputValue(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate(),
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "YYYY-MM-DDTHH:mm" (local) → ISO string for the API. */
export function fromLocalInputValue(local: string): string | undefined {
  if (!local) return undefined;
  return new Date(local).toISOString();
}

/** Default datetime-local value: trip start at 09:00 if creating before any item exists. */
export function defaultPlanTime(startDate: string): string {
  return `${startDate}T09:00`;
}

/** "YYYY-MM-DD" key extracted from an ISO string in local tz. */
export function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatDayHeader(dayKeyStr: string, tripStart: string): string {
  const d = new Date(`${dayKeyStr}T00:00`);
  const start = new Date(`${tripStart}T00:00`);
  const dayNumber =
    Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const label = d.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
  return `Day ${dayNumber} · ${label}`;
}

export function formatTimeShort(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatDateTimeShort(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
