"use client";

import { FormEvent, useState } from "react";
import { api, ApiError } from "@/lib/api";
import {
  datetimeBounds,
  defaultPlanTime,
  fromLocalInputValue,
  toLocalInputValue,
} from "@/lib/datetime";
import type { Photo, Place, Trip } from "@/lib/types";
import { Field, formInputClass, FormFooter, formCardClass } from "./formBits";

type Mode = { kind: "create" } | { kind: "edit"; photo: Photo };

export function PhotoForm({
  trip,
  places,
  mode = { kind: "create" },
  onSaved,
  onCancel,
}: {
  trip: Trip;
  places: Place[];
  mode?: Mode;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const isEdit = mode.kind === "edit";
  const initial = isEdit ? mode.photo : null;
  const bounds = datetimeBounds(trip.startDate, trip.endDate);

  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState(initial?.caption ?? "");
  const [takenAt, setTakenAt] = useState(
    initial?.takenAt
      ? toLocalInputValue(initial.takenAt)
      : defaultPlanTime(trip.startDate),
  );
  const [placeId, setPlaceId] = useState<string>(
    initial?.placeId ? String(initial.placeId) : "",
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (isEdit) {
        await api.patch<Photo>(`/trips/${trip.id}/photos/${initial!.id}`, {
          caption: caption || null,
          takenAt: fromLocalInputValue(takenAt) ?? null,
          placeId: placeId ? parseInt(placeId, 10) : null,
        });
      } else {
        if (!file) {
          setError("파일을 선택해주세요");
          setSubmitting(false);
          return;
        }
        const form = new FormData();
        form.append("file", file);
        if (caption) form.append("caption", caption);
        const iso = fromLocalInputValue(takenAt);
        if (iso) form.append("takenAt", iso);
        if (placeId) form.append("placeId", placeId);
        await api.upload<Photo>(`/trips/${trip.id}/photos`, form);
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
      {!isEdit && (
        <Field label="이미지 파일 (10MB 이하)" className="sm:col-span-2">
          <input
            type="file"
            accept="image/*"
            required
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block text-sm file:mr-3 file:rounded-md file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-white hover:file:bg-indigo-700"
          />
        </Field>
      )}
      {isEdit && (
        <p className="text-xs text-zinc-500 sm:col-span-2">
          파일 자체는 교체할 수 없습니다. 변경하려면 삭제 후 다시 업로드해주세요.
        </p>
      )}
      <Field label="캡션" optional className="sm:col-span-2">
        <input
          value={caption ?? ""}
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
        submitLabel={isEdit ? "저장" : "업로드"}
        onCancel={onCancel}
      />
    </form>
  );
}
