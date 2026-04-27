"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { PushToggle } from "./PushToggle";

export function Nav() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-semibold tracking-tight"
        >
          <span className="text-xl">✈️</span>
          <span>여행 일지</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <Link
                href="/trips"
                className="hidden text-zinc-700 hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400 sm:inline"
              >
                내 여행
              </Link>
              <span className="hidden text-zinc-400 sm:inline">·</span>
              <span className="hidden text-zinc-600 dark:text-zinc-400 sm:inline">
                {user.name}
              </span>
              <PushToggle />
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-zinc-700 transition hover:border-zinc-500 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:bg-zinc-900"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-zinc-700 hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-indigo-600 px-3 py-1.5 font-medium text-white transition hover:bg-indigo-700"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
