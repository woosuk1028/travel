"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/trips");
  }, [user, loading, router]);

  if (loading) return <p className="text-zinc-500">로딩중...</p>;

  return (
    <section className="flex flex-col items-center gap-8 py-16 text-center">
      <div className="text-6xl">🗺️</div>
      <div className="flex flex-col items-center gap-3">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          여행을 기록하세요
        </h1>
        <p className="max-w-md text-zinc-600 dark:text-zinc-400">
          일정, 다녀온 장소, 지출, 사진을 시간순 피드로 한눈에.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/signup"
          className="rounded-md bg-indigo-600 px-5 py-2.5 font-medium text-white transition hover:bg-indigo-700"
        >
          시작하기
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-zinc-300 bg-white px-5 py-2.5 transition hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-500"
        >
          로그인
        </Link>
      </div>
    </section>
  );
}
