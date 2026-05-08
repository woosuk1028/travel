"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import type { Trip } from "@/lib/types";

export default function TripsPage() {
  const router = useRouter();
  const { loading: authLoading, user } = useRequireAuth();
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const list = await api.get<Trip[]>("/trips");
      setTrips(list);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    void refresh();
  }, [user, refresh]);

  if (authLoading || !user) return <p className="text-zinc-500">로딩중...</p>;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">내 여행</h1>
        <div className="flex gap-2">
          <RefreshButton onClick={refresh} loading={refreshing} />
          <button
            type="button"
            onClick={() => {
              setShowJoin((v) => !v);
              setShowForm(false);
            }}
            className={`rounded-md border px-3 py-2 text-sm transition ${
              showJoin
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950 dark:text-indigo-200"
                : "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            }`}
          >
            🔗 코드로 참여
          </button>
          {trips !== null && trips.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setShowForm((v) => !v);
                setShowJoin(false);
              }}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                showForm
                  ? "border border-zinc-300 dark:border-zinc-700"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {showForm ? "취소" : "+ 새 여행"}
            </button>
          )}
        </div>
      </header>

      {showJoin && (
        <JoinByCodeForm
          onJoined={(tripId) => {
            setShowJoin(false);
            router.push(`/trips/${tripId}`);
          }}
        />
      )}

      {showForm && (
        <CreateTripForm
          onCreated={() => {
            setShowForm(false);
            void refresh();
          }}
        />
      )}

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {trips === null ? (
        <p className="text-zinc-500">불러오는 중...</p>
      ) : trips.length === 0 ? (
        showForm ? null : (
          <button
            type="button"
            onClick={() => {
              setShowForm(true);
              setShowJoin(false);
            }}
            className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-indigo-300 bg-white p-12 text-center transition hover:-translate-y-0.5 hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-md dark:border-indigo-800 dark:bg-zinc-900 dark:hover:border-indigo-500 dark:hover:bg-indigo-950"
          >
            <span className="text-5xl">✈️</span>
            <span className="text-xl font-semibold text-indigo-700 dark:text-indigo-300">
              + 새 여행 만들기
            </span>
            <span className="text-sm text-zinc-500">
              첫 여행 일정을 등록해보세요.
            </span>
          </button>
        )
      ) : (
        <>
        <ul className="grid gap-3 sm:grid-cols-2">
          {trips.map((trip) => (
            <li key={trip.id}>
              <Link
                href={`/trips/${trip.id}`}
                className="block overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700"
              >
                <div className="h-2 w-full bg-gradient-to-r from-indigo-400 via-violet-500 to-fuchsia-500" />
                <div className="p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <h2 className="text-lg font-medium">{trip.title}</h2>
                    {trip.role === "member" && (
                      <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">
                        🔗 공유
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-mono text-xs text-zinc-500">
                    {trip.startDate} → {trip.endDate}
                  </p>
                  {trip.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {trip.description}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
        {!showForm && (
          <button
            type="button"
            onClick={() => {
              setShowForm(true);
              setShowJoin(false);
            }}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-300 bg-white px-4 py-6 text-base font-medium text-indigo-700 transition hover:-translate-y-0.5 hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-md dark:border-indigo-800 dark:bg-zinc-900 dark:text-indigo-300 dark:hover:border-indigo-500 dark:hover:bg-indigo-950"
          >
            <span className="text-xl">✈️</span>
            <span>+ 새 여행 만들기</span>
          </button>
        )}
        </>
      )}
    </section>
  );
}

function RefreshButton({
  onClick,
  loading,
}: {
  onClick: () => void;
  loading: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-label="새로고침"
      title="새로고침"
      className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-300 transition hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
        aria-hidden="true"
      >
        <path d="M3 12a9 9 0 0 1 15.3-6.4L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" />
        <path d="M3 21v-5h5" />
      </svg>
    </button>
  );
}

function CreateTripForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [budgetCurrency, setBudgetCurrency] = useState("KRW");
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
        budget: budget ? budget : undefined,
        budgetCurrency,
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
      className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-2"
    >
      <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
        <span className="text-zinc-700 dark:text-zinc-300">제목</span>
        <input
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 오사카 3박 4일"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-zinc-700 dark:text-zinc-300">시작일</span>
        <input
          type="date"
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-zinc-700 dark:text-zinc-300">종료일</span>
        <input
          type="date"
          required
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-zinc-700 dark:text-zinc-300">
          예산 <span className="text-xs text-zinc-400">(선택)</span>
        </span>
        <input
          inputMode="decimal"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="0"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-zinc-700 dark:text-zinc-300">통화</span>
        <select
          value={budgetCurrency}
          onChange={(e) => setBudgetCurrency(e.target.value)}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="KRW">원 (KRW)</option>
          <option value="USD">달러 (USD)</option>
          <option value="JPY">엔 (JPY)</option>
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
        <span className="text-zinc-700 dark:text-zinc-300">
          설명 <span className="text-xs text-zinc-400">(선택)</span>
        </span>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}
      <div className="flex justify-end sm:col-span-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? "..." : "만들기"}
        </button>
      </div>
    </form>
  );
}

function JoinByCodeForm({
  onJoined,
}: {
  onJoined: (tripId: number) => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post<{ tripId: number; title: string }>(
        "/trips/join",
        { code: code.trim().toUpperCase() },
      );
      onJoined(res.tripId);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-end"
    >
      <label className="flex flex-1 flex-col gap-1.5 text-sm">
        <span className="text-zinc-700 dark:text-zinc-300">공유 코드</span>
        <input
          required
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="A1B2C3D4"
          maxLength={16}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-base tracking-widest focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>
      <button
        type="submit"
        disabled={submitting || !code.trim()}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
      >
        {submitting ? "..." : "참여"}
      </button>
      {error && (
        <p className="text-sm text-red-600 sm:basis-full">{error}</p>
      )}
    </form>
  );
}
