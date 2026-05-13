"use client";

import Link from "next/link";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RootError({ error, reset }: ErrorProps) {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-16 md:px-8">
      <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gray-500">Something Went Wrong</p>
        <h1 className="mb-3 text-3xl font-semibold text-gray-900">We hit an unexpected error</h1>
        <p className="mb-8 text-gray-600">
          {error.message || "Please try again or return to the shop."}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="rounded bg-gray-900 px-5 py-2 text-white transition hover:bg-gray-800"
          >
            Try again
          </button>
          <Link
            href="/shop"
            className="rounded border border-gray-300 px-5 py-2 text-gray-700 transition hover:bg-gray-100"
          >
            Go to shop
          </Link>
        </div>
      </div>
    </main>
  );
}
