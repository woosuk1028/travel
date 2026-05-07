import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white/60 dark:border-zinc-800 dark:bg-zinc-950/60">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-6 py-4 text-xs text-zinc-500 sm:flex-row">
        <span>© TripLog</span>
        <nav className="flex items-center gap-3">
          <Link
            href="/privacy"
            className="hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            개인정보처리방침
          </Link>
          <span aria-hidden>·</span>
          <Link
            href="/terms"
            className="hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            이용약관
          </Link>
        </nav>
      </div>
    </footer>
  );
}
