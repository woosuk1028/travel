"use client";

import { useMemo, useState } from "react";
import { api, API_BASE_URL, ApiError } from "@/lib/api";
import { dayKey, formatDayHeader, formatTimeShort } from "@/lib/datetime";
import type { Expense, Photo, Place, Trip } from "@/lib/types";
import { ExpenseForm } from "./ExpenseForm";
import { PhotoForm } from "./PhotoForm";
import { PlaceForm } from "./PlaceForm";

const CATEGORY_META: Record<
  Expense["category"],
  { label: string; icon: string }
> = {
  transport: { label: "교통", icon: "🚌" },
  food: { label: "식비", icon: "🍽️" },
  lodging: { label: "숙박", icon: "🏨" },
  shopping: { label: "쇼핑", icon: "🛍️" },
  activity: { label: "액티비티", icon: "🎢" },
  other: { label: "기타", icon: "📌" },
};

type FeedItem =
  | { kind: "place"; data: Place; sortAt: string; key: string }
  | { kind: "expense"; data: Expense; sortAt: string; key: string }
  | { kind: "photo"; data: Photo; sortAt: string; key: string };

export function Feed({
  trip,
  places,
  expenses,
  photos,
  onChanged,
}: {
  trip: Trip;
  places: Place[];
  expenses: Expense[];
  photos: Photo[];
  onChanged: () => void;
}) {
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const groups = useMemo(() => {
    const fallback = `${trip.startDate}T00:00:00`;
    const items: FeedItem[] = [
      ...places.map<FeedItem>((p) => ({
        kind: "place",
        data: p,
        sortAt: p.visitAt ?? fallback,
        key: `place-${p.id}`,
      })),
      ...expenses.map<FeedItem>((e) => ({
        kind: "expense",
        data: e,
        sortAt: e.paidAt,
        key: `expense-${e.id}`,
      })),
      ...photos.map<FeedItem>((ph) => ({
        kind: "photo",
        data: ph,
        sortAt: ph.takenAt ?? ph.createdAt,
        key: `photo-${ph.id}`,
      })),
    ];
    items.sort(
      (a, b) =>
        new Date(a.sortAt).getTime() - new Date(b.sortAt).getTime(),
    );

    const byDay = new Map<string, FeedItem[]>();
    for (const it of items) {
      const k = dayKey(it.sortAt);
      const arr = byDay.get(k);
      if (arr) arr.push(it);
      else byDay.set(k, [it]);
    }
    return Array.from(byDay.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [places, expenses, photos, trip.startDate]);

  const placesById = useMemo(() => {
    const m = new Map<number, Place>();
    for (const p of places) m.set(p.id, p);
    return m;
  }, [places]);

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-zinc-500">아직 기록이 없습니다.</p>
        <p className="mt-1 text-sm text-zinc-400">
          위의 버튼으로 장소·지출·사진을 추가해보세요.
        </p>
      </div>
    );
  }

  function handleSaved() {
    setEditingKey(null);
    onChanged();
  }

  return (
    <div className="flex flex-col gap-8">
      {groups.map(([day, items]) => (
        <section key={day} className="flex flex-col gap-3">
          <div className="sticky top-0 z-10 -mx-1 bg-zinc-50/95 px-1 py-1 backdrop-blur dark:bg-zinc-950/95">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
              {formatDayHeader(day, trip.startDate)}
            </h3>
          </div>
          <ul className="flex flex-col gap-2">
            {items.map((it) =>
              editingKey === it.key ? (
                <li key={it.key}>
                  <EditFormFor
                    item={it}
                    trip={trip}
                    places={places}
                    onSaved={handleSaved}
                    onCancel={() => setEditingKey(null)}
                  />
                </li>
              ) : (
                <FeedRow
                  key={it.key}
                  item={it}
                  placesById={placesById}
                  tripId={trip.id}
                  onEdit={() => setEditingKey(it.key)}
                  onChanged={onChanged}
                />
              ),
            )}
          </ul>
        </section>
      ))}
    </div>
  );
}

function EditFormFor({
  item,
  trip,
  places,
  onSaved,
  onCancel,
}: {
  item: FeedItem;
  trip: Trip;
  places: Place[];
  onSaved: () => void;
  onCancel: () => void;
}) {
  if (item.kind === "place") {
    return (
      <PlaceForm
        trip={trip}
        mode={{ kind: "edit", place: item.data }}
        onSaved={onSaved}
        onCancel={onCancel}
      />
    );
  }
  if (item.kind === "expense") {
    return (
      <ExpenseForm
        trip={trip}
        places={places}
        mode={{ kind: "edit", expense: item.data }}
        onSaved={onSaved}
        onCancel={onCancel}
      />
    );
  }
  return (
    <PhotoForm
      trip={trip}
      places={places}
      mode={{ kind: "edit", photo: item.data }}
      onSaved={onSaved}
      onCancel={onCancel}
    />
  );
}

function FeedRow({
  item,
  placesById,
  tripId,
  onEdit,
  onChanged,
}: {
  item: FeedItem;
  placesById: Map<number, Place>;
  tripId: number;
  onEdit: () => void;
  onChanged: () => void;
}) {
  async function handleDelete() {
    const labels: Record<FeedItem["kind"], string> = {
      place: "장소",
      expense: "지출",
      photo: "사진",
    };
    if (!confirm(`이 ${labels[item.kind]}을(를) 삭제하시겠습니까?`)) return;
    const path =
      item.kind === "place"
        ? `/trips/${tripId}/places/${item.data.id}`
        : item.kind === "expense"
          ? `/trips/${tripId}/expenses/${item.data.id}`
          : `/trips/${tripId}/photos/${item.data.id}`;
    try {
      await api.del(path);
      onChanged();
    } catch (err) {
      alert((err as ApiError).message);
    }
  }

  const time = formatTimeShort(item.sortAt);

  return (
    <li className="group flex gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
      <div className="flex w-14 shrink-0 flex-col items-start gap-1 text-xs">
        <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {time}
        </span>
        <KindBadge
          kind={item.kind}
          category={item.kind === "expense" ? item.data.category : undefined}
        />
      </div>
      <div className="min-w-0 flex-1">
        {item.kind === "place" && <PlaceCard place={item.data} />}
        {item.kind === "expense" && (
          <ExpenseCard
            expense={item.data}
            placeName={
              item.data.placeId
                ? placesById.get(item.data.placeId)?.name ?? null
                : null
            }
          />
        )}
        {item.kind === "photo" && (
          <PhotoCard
            photo={item.data}
            placeName={
              item.data.placeId
                ? placesById.get(item.data.placeId)?.name ?? null
                : null
            }
          />
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1 self-start text-xs opacity-0 transition group-hover:opacity-100">
        <button
          type="button"
          onClick={onEdit}
          className="text-indigo-600 hover:underline dark:text-indigo-400"
        >
          수정
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="text-zinc-400 hover:text-red-600"
        >
          삭제
        </button>
      </div>
    </li>
  );
}

function KindBadge({
  kind,
  category,
}: {
  kind: FeedItem["kind"];
  category?: Expense["category"];
}) {
  if (kind === "place") {
    return (
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
        📍 장소
      </span>
    );
  }
  if (kind === "expense") {
    const meta = category ? CATEGORY_META[category] : CATEGORY_META.other;
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
        {meta.icon} {meta.label}
      </span>
    );
  }
  return (
    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-700 dark:bg-sky-950 dark:text-sky-300">
      📷 사진
    </span>
  );
}

function PlaceCard({ place }: { place: Place }) {
  return (
    <div>
      <h4 className="font-medium">{place.name}</h4>
      {place.address && (
        <p className="mt-0.5 text-sm text-zinc-500">{place.address}</p>
      )}
      {place.memo && (
        <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
          {place.memo}
        </p>
      )}
    </div>
  );
}

function ExpenseCard({
  expense,
  placeName,
}: {
  expense: Expense;
  placeName: string | null;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-base font-semibold">
          {parseFloat(expense.amount).toLocaleString("en-US", {
            maximumFractionDigits: 2,
          })}{" "}
          <span className="text-xs text-zinc-500">{expense.currency}</span>
        </span>
        {placeName && (
          <span className="truncate text-xs text-zinc-500">@ {placeName}</span>
        )}
      </div>
      {expense.description && (
        <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
          {expense.description}
        </p>
      )}
    </div>
  );
}

function PhotoCard({
  photo,
  placeName,
}: {
  photo: Photo;
  placeName: string | null;
}) {
  return (
    <div className="flex gap-3">
      <a
        href={`${API_BASE_URL}${photo.filePath}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block shrink-0"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${API_BASE_URL}${photo.filePath}`}
          alt={photo.caption ?? photo.originalName}
          className="h-20 w-20 rounded-md object-cover"
        />
      </a>
      <div className="min-w-0 flex-1 self-center">
        <p className="truncate text-sm font-medium">
          {photo.caption ?? photo.originalName}
        </p>
        <p className="mt-0.5 text-xs text-zinc-500">
          {(photo.size / 1024).toFixed(0)} KB
          {placeName && ` · @ ${placeName}`}
        </p>
      </div>
    </div>
  );
}
