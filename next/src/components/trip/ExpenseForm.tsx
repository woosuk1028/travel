"use client";

import { FormEvent, useState } from "react";
import { api, ApiError } from "@/lib/api";
import {
  datetimeBounds,
  defaultPlanTime,
  fromLocalInputValue,
} from "@/lib/datetime";
import type { Expense, ExpenseCategory, Place, Trip } from "@/lib/types";
import { Field, formInputClass, FormFooter, formCardClass } from "./formBits";

const CATEGORIES: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: "transport", label: "교통", icon: "🚌" },
  { value: "food", label: "식비", icon: "🍽️" },
  { value: "lodging", label: "숙박", icon: "🏨" },
  { value: "shopping", label: "쇼핑", icon: "🛍️" },
  { value: "activity", label: "액티비티", icon: "🎢" },
  { value: "other", label: "기타", icon: "📌" },
];

const CURRENCIES: { value: string; label: string }[] = [
  { value: "KRW", label: "원 (KRW)" },
  { value: "USD", label: "달러 (USD)" },
  { value: "JPY", label: "엔 (JPY)" },
];

export function ExpenseForm({
  trip,
  places,
  onCreated,
  onCancel,
}: {
  trip: Trip;
  places: Place[];
  onCreated: () => void;
  onCancel: () => void;
}) {
  const bounds = datetimeBounds(trip.startDate, trip.endDate);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("KRW");
  const [category, setCategory] = useState<ExpenseCategory>("food");
  const [description, setDescription] = useState("");
  const [paidAt, setPaidAt] = useState(defaultPlanTime(trip.startDate));
  const [placeId, setPlaceId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const iso = fromLocalInputValue(paidAt);
      if (!iso) {
        setError("결제 시각을 선택해주세요");
        setSubmitting(false);
        return;
      }
      await api.post<Expense>(`/trips/${trip.id}/expenses`, {
        amount,
        currency,
        category,
        description: description || undefined,
        paidAt: iso,
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
    <form onSubmit={submit} className={formCardClass}>
      <Field label="금액">
        <input
          required
          inputMode="decimal"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={formInputClass}
        />
      </Field>
      <Field label="통화">
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className={formInputClass}
        >
          {CURRENCIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="카테고리" className="sm:col-span-2">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-xs transition ${
                category === c.value
                  ? "border-indigo-500 bg-indigo-50 text-indigo-900 dark:border-indigo-400 dark:bg-indigo-950 dark:text-indigo-100"
                  : "border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900"
              }`}
            >
              <span className="text-lg">{c.icon}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </Field>
      <Field label="결제 시각" className="sm:col-span-2">
        <input
          type="datetime-local"
          required
          value={paidAt}
          min={bounds.min}
          max={bounds.max}
          onChange={(e) => setPaidAt(e.target.value)}
          className={formInputClass}
        />
      </Field>
      {places.length > 0 && (
        <Field label="장소 연결" optional className="sm:col-span-2">
          <select
            value={placeId}
            onChange={(e) => setPlaceId(e.target.value)}
            className={formInputClass}
          >
            <option value="">선택 안 함</option>
            {places.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
      )}
      <Field label="설명" optional className="sm:col-span-2">
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={formInputClass}
        />
      </Field>
      <FormFooter
        error={error}
        submitting={submitting}
        submitLabel="지출 추가"
        onCancel={onCancel}
      />
    </form>
  );
}
