// Human-friendly currency formatting.
// KRW / JPY → Korean-style 만/억 grouping
// USD       → "$" prefix with thousand separators
// other     → fall back to locale + currency code

function formatKoreanUnit(n: number, suffix: string): string {
  const abs = Math.abs(Math.round(n));
  const sign = n < 0 ? "-" : "";

  if (abs < 10000) {
    return `${sign}${abs.toLocaleString("en-US")}${suffix}`;
  }

  const eok = Math.floor(abs / 100_000_000);
  const man = Math.floor((abs % 100_000_000) / 10_000);
  const rest = abs % 10_000;

  const parts: string[] = [];
  if (eok > 0) parts.push(`${eok.toLocaleString("en-US")}억`);
  if (man > 0) parts.push(`${man.toLocaleString("en-US")}만`);
  if (rest > 0) parts.push(`${rest.toLocaleString("en-US")}`);

  return `${sign}${parts.join(" ")}${suffix}`;
}

export function formatCurrency(amount: number, currency: string): string {
  if (!isFinite(amount)) return "—";
  switch (currency) {
    case "KRW":
      return formatKoreanUnit(amount, "원");
    case "JPY":
      return formatKoreanUnit(amount, "엔");
    case "USD":
      return `$${amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    default:
      return `${amount.toLocaleString("en-US", {
        maximumFractionDigits: 2,
      })} ${currency}`;
  }
}

export function parseAmount(s: string | null | undefined): number {
  if (!s) return 0;
  const n = parseFloat(s);
  return isFinite(n) ? n : 0;
}
