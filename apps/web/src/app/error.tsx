"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="mb-3 font-display text-2xl font-semibold text-[var(--ink)]">
        This page could not be shown
      </h1>
      <p className="mb-6 text-sm leading-relaxed text-[var(--ink-soft)]">
        {error?.message?.trim() ||
          "An unexpected error occurred. You can try again or return to the dashboard — your locally saved farms and reports should still be available."}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" className="btn btn-primary" onClick={reset}>
          Try again
        </button>
        <Link href="/" className="btn btn-ghost">
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
