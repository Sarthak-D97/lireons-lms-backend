"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled app error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-slate-300 text-sm">
          The app hit an unexpected error. Try again, and if it persists, refresh the page.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-medium"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={() => window.location.assign("/")}
            className="rounded-md border border-slate-700 hover:bg-slate-800 px-4 py-2 text-sm font-medium"
          >
            Go home
          </button>
        </div>
      </div>
    </div>
  );
}
