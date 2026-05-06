"use client";

import { useMemo } from "react";
import type { Expense, Trip } from "@/lib/types";

export function BudgetPanel({
  trip,
  expenses,
}: {
  trip: Trip;
  expenses: Expense[];
}) {
  const budget = trip.budget ? parseFloat(trip.budget) : 0;
  const hasBudget = trip.budget !== null && trip.budget !== undefined && budget > 0;

  const { spent, otherCurrencies } = useMemo(() => {
    let spent = 0;
    const others = new Map<string, number>();
    for (const e of expenses) {
      const amt = parseFloat(e.amount);
      if (!isFinite(amt)) continue;
      if (e.currency === trip.budgetCurrency) {
        spent += amt;
      } else {
        others.set(e.currency, (others.get(e.currency) ?? 0) + amt);
      }
    }
    return { spent, otherCurrencies: Array.from(others.entries()) };
  }, [expenses, trip.budgetCurrency]);

  if (!hasBudget && expenses.length === 0) return null;

  const remaining = budget - spent;
  const ratio = hasBudget ? Math.min(spent / budget, 1) : 0;
  const over = hasBudget && spent > budget;

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold">예산</h2>
        {hasBudget ? (
          <span
            className={`font-mono text-sm font-medium ${
              over
                ? "text-red-600 dark:text-red-400"
                : "text-zinc-600 dark:text-zinc-300"
            }`}
          >
            {fmt(spent)} / {fmt(budget)} {trip.budgetCurrency}
          </span>
        ) : (
          <span className="text-sm text-zinc-500">예산 미설정</span>
        )}
      </div>

      {hasBudget && (
        <>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className={`h-full transition-all ${
                over
                  ? "bg-red-500"
                  : ratio > 0.8
                    ? "bg-amber-500"
                    : "bg-indigo-600"
              }`}
              style={{ width: `${Math.max(ratio * 100, 2)}%` }}
            />
          </div>
          <div className="mt-2 flex items-baseline justify-between text-xs">
            <span className="text-zinc-500">
              {over ? "예산 초과" : `사용률 ${(ratio * 100).toFixed(0)}%`}
            </span>
            <span
              className={`font-mono font-semibold ${
                over
                  ? "text-red-600 dark:text-red-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {over ? "−" : ""}
              {fmt(Math.abs(remaining))} {trip.budgetCurrency}{" "}
              {over ? "초과" : "남음"}
            </span>
          </div>
        </>
      )}

      {otherCurrencies.length > 0 && (
        <div className="mt-3 border-t border-zinc-100 pt-2 text-xs text-zinc-500 dark:border-zinc-800">
          <span className="mr-1">기타 통화 지출:</span>
          {otherCurrencies
            .map(([cur, sum]) => `${fmt(sum)} ${cur}`)
            .join(" · ")}
        </div>
      )}
    </section>
  );
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}
