"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, API_BASE_URL, ApiError } from "@/lib/api";
import type { Photo, Place } from "@/lib/types";

export function PhotosTab({
  tripId,
  places,
}: {
  tripId: number;
  places: Place[];
}) {
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function refresh() {
    try {
      const list = await api.get<Photo[]>(`/trips/${tripId}/photos`);
      setPhotos(list);
    } catch (err) {
      setError((err as ApiError).message);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  async function remove(id: number) {
    if (!confirm("이 사진을 삭제하시겠습니까?")) return;
    try {
      await api.del(`/trips/${tripId}/photos/${id}`);
      void refresh();
    } catch (err) {
      alert((err as ApiError).message);
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">사진</h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700"
        >
          {showForm ? "취소" : "+ 업로드"}
        </button>
      </div>

      {showForm && (
        <PhotoForm
          tripId={tripId}
          places={places}
          onUploaded={() => {
            setShowForm(false);
            void refresh();
          }}
        />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {photos === null ? (
        <p className="text-zinc-500">불러오는 중...</p>
      ) : photos.length === 0 ? (
        <p className="rounded-md border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
          사진이 없습니다.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {photos.map((p) => (
            <li
              key={p.id}
              className="overflow-hidden rounded-md border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            >
              <a
                href={`${API_BASE_URL}${p.filePath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-zinc-100 dark:bg-zinc-800"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${API_BASE_URL}${p.filePath}`}
                  alt={p.caption ?? p.originalName}
                  className="h-40 w-full object-cover"
                />
              </a>
              <div className="flex items-start justify-between gap-2 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {p.caption ?? p.originalName}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {(p.size / 1024).toFixed(0)}KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function PhotoForm({
  tripId,
  places,
  onUploaded,
}: {
  tripId: number;
  places: Place[];
  onUploaded: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
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
      if (placeId) form.append("placeId", placeId);
      await api.upload<Photo>(`/trips/${tripId}/photos`, form);
      onUploaded();
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
        <span className="text-zinc-600 dark:text-zinc-400">
          이미지 파일 (10MB 이하)
        </span>
        <input
          type="file"
          accept="image/*"
          required
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        <span className="text-zinc-600 dark:text-zinc-400">캡션 (선택)</span>
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        <span className="text-zinc-600 dark:text-zinc-400">장소 (선택)</span>
        <select
          value={placeId}
          onChange={(e) => setPlaceId(e.target.value)}
          className={inputClass}
        >
          <option value="">선택 안 함</option>
          {places.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={submitting || !file}
          className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-60 dark:bg-white dark:text-black"
        >
          {submitting ? "업로드중..." : "업로드"}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-950";
