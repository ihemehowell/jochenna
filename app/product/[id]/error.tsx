"use client";

import Link from "next/link";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ProductError({ error, reset }: ErrorProps) {
  return (
    <main className="px-4 py-10 md:px-8">
      <div className="mx-auto max-w-3xl rounded-lg border border-gray-200 bg-white p-8 text-center">
        <h2 className="mb-3 text-2xl font-semibold text-gray-900">Product page failed to load</h2>
        <p className="mb-8 text-gray-600">{error.message || "Please retry or return to the catalog."}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="rounded bg-gray-900 px-5 py-2 text-white transition hover:bg-gray-800"
          >
            Retry
          </button>
          <Link
            href="/shop"
            className="rounded border border-gray-300 px-5 py-2 text-gray-700 transition hover:bg-gray-100"
          >
            Back to shop
          </Link>
        </div>
      </div>
    </main>
  );
}
