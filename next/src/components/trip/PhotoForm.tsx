"use client";

import { FormEvent, useState } from "react";
import { api, ApiError } from "@/lib/api";
import {
  datetimeBounds,
  defaultPlanTime,
  fromLocalInputValue,
} from "@/lib/datetime";
import type { Photo, Place, Trip } from "@/lib/types";
import { Field, formInputClass, FormFooter, formCardClass } from "./formBits";

export function PhotoForm({
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
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [takenAt, setTakenAt] = useState(defaultPlanTime(trip.startDate));
  const [placeId, setPlaceId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("파일을 선택해주세요");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      if (caption) form.append("caption", caption);
      const iso = fromLocalInputValue(takenAt);
      if (iso) form.append("takenAt", iso);
      if (placeId) form.append("placeId", placeId);
      await api.upload<Photo>(`/trips/${trip.id}/photos`, form);
      onCreated();
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className={formCardClass}>
      <Field label="이미지 파일 (10MB 이하)" className="sm:col-span-2">
        <input
          type="file"
          accept="image/*"
          required
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block text-sm file:mr-3 file:rounded-md file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-white hover:file:bg-indigo-700"
        />
      </Field>
      <Field label="캡션" optional className="sm:col-span-2">
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className={formInputClass}
        />
      </Field>
      <Field label="촬영 시각" className="sm:col-span-2">
        <input
          type="datetime-local"
          value={takenAt}
          min={bounds.min}
          max={bounds.max}
          onChange={(e) => setTakenAt(e.target.value)}
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
      <FormFooter
        error={error}
        submitting={submitting}
        submitLabel="업로드"
        onCancel={onCancel}
      />
    </form>
  );
}
