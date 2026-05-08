"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BudgetPanel } from "@/components/trip/BudgetPanel";
import { ExpenseForm } from "@/components/trip/ExpenseForm";
import { Feed } from "@/components/trip/Feed";
import { PhotoForm } from "@/components/trip/PhotoForm";
import { PlaceForm } from "@/components/trip/PlaceForm";
import { SharePanel } from "@/components/trip/SharePanel";
import { TripHeader } from "@/components/trip/TripHeader";
import { api, ApiError } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import type { Expense, Photo, Place, Trip } from "@/lib/types";

type FormKind = "place" | "expense" | "photo" | null;

export default function TripDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth();
  const tripId = parseInt(params.id, 10);

  const [trip, setTrip] = useState<Trip | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState<FormKind>(null);

  const refreshAll = useCallback(async () => {
    if (!Number.isFinite(tripId)) return;
    try {
      const [t, ps, es, phs] = await Promise.all([
        api.get<Trip>(`/trips/${tripId}`),
        api.get<Place[]>(`/trips/${tripId}/places`),
        api.get<Expense[]>(`/trips/${tripId}/expenses`),
        api.get<Photo[]>(`/trips/${tripId}/photos`),
      ]);
      setTrip(t);
      setPlaces(ps);
      setExpenses(es);
      setPhotos(phs);
    } catch (err) {
      const e = err as ApiError;
      setError(e.status === 404 ? "여행을 찾을 수 없습니다." : e.message);
    }
  }, [tripId]);

  useEffect(() => {
    if (!user) return;
    void refreshAll();
    const interval = setInterval(refreshAll, 10_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshAll();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [user, refreshAll]);

  if (authLoading || !user) return <p className="text-zinc-500">로딩중...</p>;
  if (Number.isNaN(tripId)) {
    return <p className="text-sm text-red-600">잘못된 주소입니다.</p>;
  }
  if (error) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={() => router.replace("/trips")}
          className="self-start rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700"
        >
          목록으로
        </button>
      </div>
    );
  }
  if (!trip) return <p className="text-zinc-500">불러오는 중...</p>;

  function onCreated() {
    setOpenForm(null);
    void refreshAll();
  }

  const isOwner = trip.role === "owner";

  return (
    <article className="flex flex-col gap-6">
      <TripHeader trip={trip} onChanged={setTrip} />

      {isOwner && (
        <SharePanel
          trip={trip}
          onCodeChanged={(code) => setTrip({ ...trip, shareCode: code })}
        />
      )}

      <BudgetPanel trip={trip} expenses={expenses} />

      <AddBar
        openForm={openForm}
        onToggle={(k) => setOpenForm((cur) => (cur === k ? null : k))}
      />

      {openForm === "place" && (
        <PlaceForm
          trip={trip}
          onSaved={onCreated}
          onCancel={() => setOpenForm(null)}
        />
      )}
      {openForm === "expense" && (
        <ExpenseForm
          trip={trip}
          places={places}
          onSaved={onCreated}
          onCancel={() => setOpenForm(null)}
        />
      )}
      {openForm === "photo" && (
        <PhotoForm
          trip={trip}
          places={places}
          onSaved={onCreated}
          onCancel={() => setOpenForm(null)}
        />
      )}

      <Feed
        trip={trip}
        places={places}
        expenses={expenses}
        photos={photos}
        onChanged={refreshAll}
      />
    </article>
  );
}

function AddBar({
  openForm,
  onToggle,
}: {
  openForm: FormKind;
  onToggle: (k: Exclude<FormKind, null>) => void;
}) {
  const buttons: { kind: Exclude<FormKind, null>; icon: string; label: string }[] =
    [
      { kind: "place", icon: "📍", label: "장소" },
      { kind: "expense", icon: "💸", label: "지출" },
      { kind: "photo", icon: "📷", label: "사진" },
    ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {buttons.map((b) => {
        const active = openForm === b.kind;
        return (
          <button
            key={b.kind}
            type="button"
            onClick={() => onToggle(b.kind)}
            className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition ${
              active
                ? "border-indigo-500 bg-indigo-600 text-white shadow-sm"
                : "border-zinc-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700 dark:hover:bg-indigo-950"
            }`}
          >
            <span>{b.icon}</span>
            <span>{active ? "닫기" : `+ ${b.label}`}</span>
          </button>
        );
      })}
    </div>
  );
}
