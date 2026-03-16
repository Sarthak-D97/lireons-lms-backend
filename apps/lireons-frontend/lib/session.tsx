"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AuthTokenResponse } from "@lireons/shared-types";

const API_URL = process.env.NEST_PUBLIC_API_URL || "http://localhost:4000";
const STORAGE_KEY = "lireons_auth_session";
const AUTH_CHANGED_EVENT = "lireons-auth-changed";

type SessionData = {
  userdatas: {
    name?: string | null;
    email?: string | null;
    number?: string | null;
    orgtype?: string | null;
    ownerId?: string | null;
  };
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  backendToken?: string;
  refreshToken?: string;
  expires?: string;
};

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

type SessionContextValue = {
  data: SessionData | null;
  status: SessionStatus;
  update: (patch: Partial<SessionData>) => Promise<SessionData | null>;
};

type StoredSession = {
  auth: AuthTokenResponse;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function readStoredSession(): StoredSession | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function writeStoredSession(value: StoredSession | null) {
  if (typeof window === "undefined") return;

  if (!value) {
    window.localStorage.removeItem(STORAGE_KEY);
  } else {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  }

  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

function mapAuthToSession(auth: AuthTokenResponse): SessionData {
  return {
    userdatas: {
      name: auth.user.name,
      email: auth.user.email,
      number: auth.user.number,
      orgtype: auth.user.orgtype,
      ownerId: auth.user.ownerId,
    },
    user: {
      id: auth.user.id,
      name: auth.user.name,
      email: auth.user.email,
      image: null,
    },
    backendToken: auth.access_token,
    refreshToken: auth.refresh_token,
    expires: auth.access_token_expires_at,
  };
}

function isAccessTokenExpired(auth: AuthTokenResponse): boolean {
  const expiresAt = Date.parse(auth.access_token_expires_at);
  if (Number.isNaN(expiresAt)) return false;
  return Date.now() >= expiresAt - 15_000;
}

async function refreshAuth(refreshToken: string): Promise<AuthTokenResponse | null> {
  const response = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as AuthTokenResponse;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SessionData | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      const stored = readStoredSession();
      if (!stored?.auth) {
        if (active) {
          setData(null);
          setStatus("unauthenticated");
        }
        return;
      }

      if (!isAccessTokenExpired(stored.auth)) {
        if (active) {
          setData(mapAuthToSession(stored.auth));
          setStatus("authenticated");
        }
        return;
      }

      const refreshed = await refreshAuth(stored.auth.refresh_token);
      if (!active) return;

      if (!refreshed) {
        writeStoredSession(null);
        setData(null);
        setStatus("unauthenticated");
        return;
      }

      writeStoredSession({ auth: refreshed });
      setData(mapAuthToSession(refreshed));
      setStatus("authenticated");
    };

    hydrate();

    const listener = () => {
      const stored = readStoredSession();
      if (!stored?.auth) {
        setData(null);
        setStatus("unauthenticated");
        return;
      }

      setData(mapAuthToSession(stored.auth));
      setStatus("authenticated");
    };

    window.addEventListener(AUTH_CHANGED_EVENT, listener);

    return () => {
      active = false;
      window.removeEventListener(AUTH_CHANGED_EVENT, listener);
    };
  }, []);

  const update = useCallback(async (patch: Partial<SessionData>) => {
    const stored = readStoredSession();
    if (!stored?.auth) return null;

    const mergedAuth: AuthTokenResponse = {
      ...stored.auth,
      user: {
        ...stored.auth.user,
        name: patch.userdatas?.name ?? patch.user?.name ?? stored.auth.user.name,
        email: patch.userdatas?.email ?? patch.user?.email ?? stored.auth.user.email,
        number: patch.userdatas?.number ?? stored.auth.user.number,
        orgtype: patch.userdatas?.orgtype ?? stored.auth.user.orgtype,
        ownerId: patch.userdatas?.ownerId ?? stored.auth.user.ownerId,
      },
    };

    writeStoredSession({ auth: mergedAuth });
    const next = mapAuthToSession(mergedAuth);
    setData(next);
    setStatus("authenticated");
    return next;
  }, []);

  const value = useMemo(
    () => ({ data, status, update }),
    [data, status, update],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used inside SessionProvider");
  }

  return context;
}

export async function signIn(
  provider: string,
  options?: {
    email?: string;
    password?: string;
    redirect?: boolean;
    callbackUrl?: string;
  },
) {
  if (provider !== "credentials") {
    return {
      ok: false,
      status: 400,
      error: "Social login is disabled. Use email and password.",
      url: null,
    };
  }

  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: options?.email,
      password: options?.password,
    }),
  });

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: "CredentialsSignin",
      url: null,
    };
  }

  const auth = (await response.json()) as AuthTokenResponse;
  writeStoredSession({ auth });

  if (options?.redirect !== false && options?.callbackUrl && typeof window !== "undefined") {
    window.location.assign(options.callbackUrl);
  }

  return {
    ok: true,
    status: response.status,
    error: undefined,
    url: options?.callbackUrl || null,
  };
}

export async function signOut(options?: { callbackUrl?: string }) {
  const stored = readStoredSession();

  if (stored?.auth?.refresh_token) {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: stored.auth.refresh_token }),
      });
    } catch {

    }
  }

  writeStoredSession(null);

  if (options?.callbackUrl && typeof window !== "undefined") {
    window.location.assign(options.callbackUrl);
  }
}
