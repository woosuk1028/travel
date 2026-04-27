"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Expense, ExpenseCategory, Place } from "@/lib/types";

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "transport", label: "교통" },
  { value: "food", label: "식비" },
  { value: "lodging", label: "숙박" },
  { value: "shopping", label: "쇼핑" },
  { value: "activity", label: "액티비티" },
  { value: "other", label: "기타" },
];

export function ExpensesTab({
  tripId,
  places,
}: {
  tripId: number;
  places: Place[];
}) {
  const [expenses, setExpenses] = useState<Expense[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function refresh() {
    try {
      const list = await api.get<Expense[]>(`/trips/${tripId}/expenses`);
      setExpenses(list);
    } catch (err) {
      setError((err as ApiError).message);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  async function remove(id: number) {
    if (!confirm("이 지출을 삭제하시겠습니까?")) return;
    try {
      await api.del(`/trips/${tripId}/expenses/${id}`);
      void refresh();
    } catch (err) {
      alert((err as ApiError).message);
    }
  }

  const totals = useMemo(() => {
    if (!expenses) return null;
    const map = new Map<string, number>();
    for (const e of expenses) {
      map.set(e.currency, (map.get(e.currency) ?? 0) + parseFloat(e.amount));
    }
    return Array.from(map.entries());
  }, [expenses]);

  const placeName = (id?: number | null) =>
    id ? places.find((p) => p.id === id)?.name ?? `#${id}` : null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">지출</h2>
          {totals && totals.length > 0 && (
            <p className="mt-1 text-xs text-zinc-500">
              합계:{" "}
              {totals
                .map(
                  ([cur, sum]) =>
                    `${sum.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${cur}`,
                )
                .join(" · ")}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700"
        >
          {showForm ? "취소" : "+ 추가"}
        </button>
      </div>

      {showForm && (
        <ExpenseForm
          tripId={tripId}
          places={places}
          onCreated={() => {
            setShowForm(false);
            void refresh();
          }}
        />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {expenses === null ? (
        <p className="text-zinc-500">불러오는 중...</p>
      ) : expenses.length === 0 ? (
        <p className="rounded-md border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
          지출이 없습니다.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {expenses.map((e) => (
            <li
              key={e.id}
              className="flex items-start justify-between gap-3 rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono font-medium">
                    {parseFloat(e.amount).toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}{" "}
                    {e.currency}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {CATEGORIES.find((c) => c.value === e.category)?.label ??
                      e.category}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  {new Date(e.paidAt).toLocaleString("ko-KR")}
                  {placeName(e.placeId) && ` · ${placeName(e.placeId)}`}
                </p>
                {e.description && (
                  <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                    {e.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => remove(e.id)}
                className="text-xs text-red-600 hover:underline"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ExpenseForm({
  tripId,
  places,
  onCreated,
}: {
  tripId: number;
  places: Place[];
  onCreated: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("KRW");
  const [category, setCategory] = useState<ExpenseCategory>("food");
  const [description, setDescription] = useState("");
  const [paidAt, setPaidAt] = useState(() =>
    new Date().toISOString().slice(0, 16),
  );
  const [placeId, setPlaceId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post<Expense>(`/trips/${tripId}/expenses`, {
        amount,
        currency,
        category,
        description: description || undefined,
        paidAt: new Date(paidAt).toISOString(),
        placeId: placeId ? parseInt(placeId, 10) : undefined,
      });
      onCreated();
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-3 rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-2"
    >
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">금액</span>
        <input
          required
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">통화</span>
        <input
          value={currency}
          onChange={(e) => setCurrency(e.target.value.toUpperCase())}
          maxLength={8}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">카테고리</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
          className={inputClass}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">결제일시</span>
        <input
          type="datetime-local"
          required
          value={paidAt}
          onChange={(e) => setPaidAt(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        <span className="text-zinc-600 dark:text-zinc-400">장소 (선택)</span>
        <select
          value={placeId}
          onChange={(e) => setPlaceId(e.target.value)}
          className={inputClass}
        >
          <option value="">선택 안 함</option>
          {places.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        <span className="text-zinc-600 dark:text-zinc-400">설명</span>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
        />
      </label>
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-60 dark:bg-white dark:text-black"
        >
          {submitting ? "..." : "추가"}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-950";
