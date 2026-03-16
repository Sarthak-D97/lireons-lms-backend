"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { AuthTokenResponse } from "@lireons/shared-types";

// Expose writeStoredSession by re-exporting the helper via a thin wrapper
// so we avoid duplicating the storage key constant.
function writeOAuthSession(auth: AuthTokenResponse) {
  if (typeof window === "undefined") return;
  const STORAGE_KEY = "lireons_auth_session";
  const AUTH_CHANGED_EVENT = "lireons-auth-changed";
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ auth }));
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const encoded = params.get("session");

    if (!encoded) {
      router.replace("/login?error=oauth_failed");
      return;
    }

    try {
      const auth = JSON.parse(
        Buffer.from(encoded, "base64").toString("utf-8"),
      ) as AuthTokenResponse;

      if (!auth.access_token || !auth.user?.email) {
        throw new Error("Incomplete OAuth session data");
      }

      writeOAuthSession(auth);
      router.replace("/onboarding");
    } catch {
      router.replace("/login?error=oauth_failed");
    }
  }, [router]);

  return (
    <div className="bg-slate-950 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto" />
        <p className="mt-4 text-slate-400">Completing sign-in&hellip;</p>
      </div>
    </div>
  );
}
