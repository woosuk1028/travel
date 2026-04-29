"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Trip } from "@/lib/types";
import { Field, formCardClass, FormFooter, formInputClass } from "./formBits";

export function TripHeader({
  trip,
  onChanged,
}: {
  trip: Trip;
  onChanged: (trip: Trip) => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  async function handleDelete() {
    if (
      !confirm(
        "이 여행을 삭제하시겠습니까? 장소·지출·사진이 모두 함께 삭제됩니다.",
      )
    ) {
      return;
    }
    try {
      await api.del(`/trips/${trip.id}`);
      router.replace("/trips");
    } catch (err) {
      alert((err as ApiError).message);
    }
  }

  async function handleLeave() {
    if (!confirm("이 여행에서 나가시겠습니까?")) return;
    try {
      await api.del(`/trips/${trip.id}/leave`);
      router.replace("/trips");
    } catch (err) {
      alert((err as ApiError).message);
    }
  }

  const isOwner = trip.role === "owner";

  if (editing) {
    return (
      <EditForm
        trip={trip}
        onCancel={() => setEditing(false)}
        onSaved={(t) => {
          onChanged(t);
          setEditing(false);
        }}
      />
    );
  }

  return (
    <header className="rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 p-6 text-white shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-3xl font-semibold tracking-tight">
            {trip.title}
          </h1>
          <p className="mt-1 text-sm font-medium text-indigo-100">
            {trip.startDate} ~ {trip.endDate}
            <span className="ml-2 text-indigo-200">
              ({tripDurationLabel(trip.startDate, trip.endDate)})
            </span>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-sm text-white backdrop-blur transition hover:bg-white/20"
          >
            수정
          </button>
          {isOwner ? (
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-sm text-white backdrop-blur transition hover:bg-red-500/40"
            >
              삭제
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLeave}
              className="rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-sm text-white backdrop-blur transition hover:bg-red-500/40"
            >
              나가기
            </button>
          )}
        </div>
      </div>
      {!isOwner && (
        <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white">
          🔗 공유받은 여행
        </span>
      )}
      {trip.description && (
        <p className="mt-3 whitespace-pre-wrap text-sm text-indigo-50">
          {trip.description}
        </p>
      )}
    </header>
  );
}

function tripDurationLabel(start: string, end: string) {
  const days =
    Math.round(
      (new Date(end).getTime() - new Date(start).getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1;
  if (days < 2) return "당일";
  return `${days - 1}박 ${days}일`;
}

function EditForm({
  trip,
  onCancel,
  onSaved,
}: {
  trip: Trip;
  onCancel: () => void;
  onSaved: (trip: Trip) => void;
}) {
  const [title, setTitle] = useState(trip.title);
  const [startDate, setStartDate] = useState(trip.startDate);
  const [endDate, setEndDate] = useState(trip.endDate);
  const [description, setDescription] = useState(trip.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const updated = await api.patch<Trip>(`/trips/${trip.id}`, {
        title,
        startDate,
        endDate,
        description: description || null,
      });
      onSaved(updated);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className={formCardClass}>
      <Field label="제목" className="sm:col-span-2">
        <input
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={formInputClass}
        />
      </Field>
      <Field label="시작일">
        <input
          type="date"
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className={formInputClass}
        />
      </Field>
      <Field label="종료일">
        <input
          type="date"
          required
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className={formInputClass}
        />
      </Field>
      <Field label="설명" optional className="sm:col-span-2">
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={formInputClass}
        />
      </Field>
      <FormFooter
        error={error}
        submitting={submitting}
        submitLabel="저장"
        onCancel={onCancel}
      />
    </form>
  );
}
