"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import type { Trip } from "@/lib/types";

export default function TripsPage() {
  const { loading: authLoading, user } = useRequireAuth();
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function refresh() {
    try {
      const list = await api.get<Trip[]>("/trips");
      setTrips(list);
    } catch (err) {
      setError((err as ApiError).message);
    }
  }

  useEffect(() => {
    if (user) void refresh();
  }, [user]);

  if (authLoading || !user) return <p className="text-zinc-500">로딩중...</p>;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">내 여행</h1>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-black px-4 py-2 text-sm text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {showForm ? "취소" : "+ 새 여행"}
        </button>
      </header>

      {showForm && (
        <CreateTripForm
          onCreated={() => {
            setShowForm(false);
            void refresh();
          }}
        />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {trips === null ? (
        <p className="text-zinc-500">불러오는 중...</p>
      ) : trips.length === 0 ? (
        <p className="rounded-md border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
          아직 등록된 여행이 없습니다. 위의 &quot;+ 새 여행&quot;으로 시작해보세요.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {trips.map((trip) => (
            <li key={trip.id}>
              <Link
                href={`/trips/${trip.id}`}
                className="block rounded-lg border border-zinc-200 bg-white p-4 transition hover:border-black hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-white"
              >
                <h2 className="text-lg font-medium">{trip.title}</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {trip.startDate} ~ {trip.endDate}
                </p>
                {trip.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {trip.description}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function CreateTripForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post<Trip>("/trips", {
        title,
        startDate,
        endDate,
        description: description || undefined,
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
      className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-2"
    >
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
        <span className="text-zinc-600 dark:text-zinc-400">설명 (선택)</span>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
        />
      </label>
      {error && (
        <p className="text-sm text-red-600 sm:col-span-2">{error}</p>
      )}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-black px-4 py-2 text-sm text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {submitting ? "..." : "만들기"}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white dark:focus:ring-white";
