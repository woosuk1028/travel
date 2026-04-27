"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ExpensesTab } from "@/components/trip/ExpensesTab";
import { PhotosTab } from "@/components/trip/PhotosTab";
import { PlacesTab } from "@/components/trip/PlacesTab";
import { TripHeader } from "@/components/trip/TripHeader";
import { api, ApiError } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import type { Place, Trip } from "@/lib/types";

type TabKey = "places" | "expenses" | "photos";

const TABS: { key: TabKey; label: string }[] = [
  { key: "places", label: "장소" },
  { key: "expenses", label: "지출" },
  { key: "photos", label: "사진" },
];

export default function TripDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth();
  const tripId = parseInt(params.id, 10);

  const [trip, setTrip] = useState<Trip | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("places");

  useEffect(() => {
    if (!user || Number.isNaN(tripId)) return;
    api
      .get<Trip>(`/trips/${tripId}`)
      .then(setTrip)
      .catch((err: ApiError) => {
        if (err.status === 404) {
          setError("여행을 찾을 수 없습니다.");
        } else {
          setError(err.message);
        }
      });
    api
      .get<Place[]>(`/trips/${tripId}/places`)
      .then(setPlaces)
      .catch(() => {});
  }, [user, tripId]);

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

  return (
    <article className="flex flex-col gap-6">
      <TripHeader trip={trip} onChanged={setTrip} />

      <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition ${
              tab === t.key
                ? "border-b-2 border-black text-black dark:border-white dark:text-white"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "places" && (
        <PlacesTab tripId={tripId} onPlacesChange={setPlaces} />
      )}
      {tab === "expenses" && (
        <ExpensesTab tripId={tripId} places={places} />
      )}
      {tab === "photos" && <PhotosTab tripId={tripId} places={places} />}
    </article>
  );
}
