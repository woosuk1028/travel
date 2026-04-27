"use client";

import { FormEvent, useState } from "react";
import { api, ApiError } from "@/lib/api";
import {
  datetimeBounds,
  defaultPlanTime,
  fromLocalInputValue,
} from "@/lib/datetime";
import type { Place, Trip } from "@/lib/types";
import { Field, formInputClass, FormFooter, formCardClass } from "./formBits";

export function PlaceForm({
  trip,
  onCreated,
  onCancel,
}: {
  trip: Trip;
  onCreated: () => void;
  onCancel: () => void;
}) {
  const bounds = datetimeBounds(trip.startDate, trip.endDate);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [visitAt, setVisitAt] = useState(defaultPlanTime(trip.startDate));
  const [memo, setMemo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post<Place>(`/trips/${trip.id}/places`, {
        name,
        address: address || undefined,
        visitAt: fromLocalInputValue(visitAt),
        memo: memo || undefined,
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
      <Field label="장소명" className="sm:col-span-2">
        <input
          required
          maxLength={200}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={formInputClass}
          placeholder="예: 오사카성, 후쿠오카 공항"
        />
      </Field>
      <Field label="주소" optional className="sm:col-span-2">
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={formInputClass}
        />
      </Field>
      <Field label="방문 시각" className="sm:col-span-2">
        <input
          type="datetime-local"
          value={visitAt}
          min={bounds.min}
          max={bounds.max}
          onChange={(e) => setVisitAt(e.target.value)}
          className={formInputClass}
        />
        <span className="text-xs text-zinc-500">
          여행 기간({trip.startDate} ~ {trip.endDate}) 안에서 선택
        </span>
      </Field>
      <Field label="메모" optional className="sm:col-span-2">
        <textarea
          rows={3}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className={formInputClass}
        />
      </Field>
      <FormFooter
        error={error}
        submitting={submitting}
        submitLabel="장소 추가"
        onCancel={onCancel}
      />
    </form>
  );
}
