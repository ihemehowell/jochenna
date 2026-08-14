"use client";

import Link from "next/link";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ProductError({ error, reset }: ErrorProps) {
  return (
    <main className="px-4 py-10 md:px-8">
      <div className="mx-auto max-w-3xl rounded-lg border border-hairline bg-white p-8 text-center">
        <h2 className="mb-3 text-2xl font-semibold text-ink">Product page failed to load</h2>
        <p className="mb-8 text-ink-soft">{error.message || "Please retry or return to the catalog."}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="rounded bg-ink px-5 py-2 text-white transition hover:bg-ink"
          >
            Retry
          </button>
          <Link
            href="/shop"
            className="rounded border border-hairline px-5 py-2 text-ink transition hover:bg-paper"
          >
            Back to shop
          </Link>
        </div>
      </div>
    </main>
  );
}
