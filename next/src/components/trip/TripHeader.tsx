"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Trip } from "@/lib/types";

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
    if (!confirm("이 여행을 삭제하시겠습니까? 장소·지출·사진이 모두 함께 삭제됩니다.")) {
      return;
    }
    try {
      await api.del(`/trips/${trip.id}`);
      router.replace("/trips");
    } catch (err) {
      alert((err as ApiError).message);
    }
  }

  return (
    <header className="flex flex-col gap-3 border-b border-zinc-200 pb-6 dark:border-zinc-800">
      {editing ? (
        <EditForm
          trip={trip}
          onCancel={() => setEditing(false)}
          onSaved={(t) => {
            onChanged(t);
            setEditing(false);
          }}
        />
      ) : (
        <>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                {trip.title}
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                {trip.startDate} ~ {trip.endDate}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                수정
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
              >
                삭제
              </button>
            </div>
          </div>
          {trip.description && (
            <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
              {trip.description}
            </p>
          )}
        </>
      )}
    </header>
  );
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
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        <span className="text-zinc-600 dark:text-zinc-400">제목</span>
        <input
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">시작일</span>
        <input
          type="date"
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">종료일</span>
        <input
          type="date"
          required
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        <span className="text-zinc-600 dark:text-zinc-400">설명</span>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
        />
      </label>
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-60 dark:bg-white dark:text-black"
        >
          {submitting ? "..." : "저장"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
        >
          취소
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white dark:focus:ring-white";
