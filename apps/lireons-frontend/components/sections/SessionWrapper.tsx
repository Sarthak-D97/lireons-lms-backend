"use client";
import { SessionProvider } from "@/lib/session";

export const SessionWrapper = ({ children }: { children: React.ReactNode }) => {
    return <SessionProvider>{children}</SessionProvider>;
}
