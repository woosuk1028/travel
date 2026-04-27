"use client";

import { FormEvent, useState } from "react";
import { api, ApiError } from "@/lib/api";
import {
  datetimeBounds,
  defaultPlanTime,
  fromLocalInputValue,
  toLocalInputValue,
} from "@/lib/datetime";
import type { Place, Trip } from "@/lib/types";
import { Field, formInputClass, FormFooter, formCardClass } from "./formBits";

type Mode = { kind: "create" } | { kind: "edit"; place: Place };

export function PlaceForm({
  trip,
  mode = { kind: "create" },
  onSaved,
  onCancel,
}: {
  trip: Trip;
  mode?: Mode;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const isEdit = mode.kind === "edit";
  const initial = isEdit ? mode.place : null;
  const bounds = datetimeBounds(trip.startDate, trip.endDate);

  const [name, setName] = useState(initial?.name ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [visitAt, setVisitAt] = useState(
    initial?.visitAt
      ? toLocalInputValue(initial.visitAt)
      : defaultPlanTime(trip.startDate),
  );
  const [memo, setMemo] = useState(initial?.memo ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const body = {
        name,
        address: address || (isEdit ? null : undefined),
        visitAt: fromLocalInputValue(visitAt) ?? (isEdit ? null : undefined),
        memo: memo || (isEdit ? null : undefined),
      };
      if (isEdit) {
        await api.patch<Place>(
          `/trips/${trip.id}/places/${initial!.id}`,
          body,
        );
      } else {
        await api.post<Place>(`/trips/${trip.id}/places`, body);
      }
      onSaved();
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
          value={address ?? ""}
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
          value={memo ?? ""}
          onChange={(e) => setMemo(e.target.value)}
          className={formInputClass}
        />
      </Field>
      <FormFooter
        error={error}
        submitting={submitting}
        submitLabel={isEdit ? "저장" : "장소 추가"}
        onCancel={onCancel}
      />
    </form>
  );
}
