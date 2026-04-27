"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Place } from "@/lib/types";

export function PlacesTab({
  tripId,
  onPlacesChange,
}: {
  tripId: number;
  onPlacesChange?: (places: Place[]) => void;
}) {
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function refresh() {
    try {
      const list = await api.get<Place[]>(`/trips/${tripId}/places`);
      setPlaces(list);
      onPlacesChange?.(list);
    } catch (err) {
      setError((err as ApiError).message);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  async function remove(id: number) {
    if (!confirm("이 장소를 삭제하시겠습니까?")) return;
    try {
      await api.del(`/trips/${tripId}/places/${id}`);
      void refresh();
    } catch (err) {
      alert((err as ApiError).message);
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">장소</h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700"
        >
          {showForm ? "취소" : "+ 추가"}
        </button>
      </div>

      {showForm && (
        <PlaceForm
          tripId={tripId}
          onCreated={() => {
            setShowForm(false);
            void refresh();
          }}
        />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {places === null ? (
        <p className="text-zinc-500">불러오는 중...</p>
      ) : places.length === 0 ? (
        <p className="rounded-md border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
          장소가 없습니다.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {places.map((p) => (
            <li
              key={p.id}
              className="flex items-start justify-between gap-3 rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <h3 className="font-medium">{p.name}</h3>
                  {p.visitDate && (
                    <span className="text-xs text-zinc-500">
                      {p.visitDate} · {p.dayOrder}번째
                    </span>
                  )}
                </div>
                {p.address && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {p.address}
                  </p>
                )}
                {p.memo && (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                    {p.memo}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => remove(p.id)}
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

function PlaceForm({
  tripId,
  onCreated,
}: {
  tripId: number;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [dayOrder, setDayOrder] = useState("1");
  const [memo, setMemo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post<Place>(`/trips/${tripId}/places`, {
        name,
        address: address || undefined,
        visitDate: visitDate || undefined,
        dayOrder: dayOrder ? parseInt(dayOrder, 10) : undefined,
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
    <form
      onSubmit={submit}
      className="grid gap-3 rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-2"
    >
      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        <span className="text-zinc-600 dark:text-zinc-400">장소명</span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        <span className="text-zinc-600 dark:text-zinc-400">주소 (선택)</span>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">방문일</span>
        <input
          type="date"
          value={visitDate}
          onChange={(e) => setVisitDate(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">순서</span>
        <input
          type="number"
          min={0}
          value={dayOrder}
          onChange={(e) => setDayOrder(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        <span className="text-zinc-600 dark:text-zinc-400">메모</span>
        <textarea
          rows={2}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
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
