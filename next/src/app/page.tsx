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
    <section className="flex flex-col items-start gap-6 py-12">
      <h1 className="text-4xl font-semibold tracking-tight">
        여행을 기록하세요
      </h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        일정, 다녀온 장소, 지출, 사진을 한 곳에 모아두고 다시 꺼내보세요.
      </p>
      <div className="flex gap-3">
        <Link
          href="/signup"
          className="rounded-md bg-black px-4 py-2 text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          시작하기
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-zinc-300 px-4 py-2 transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          로그인
        </Link>
      </div>
    </section>
  );
}
