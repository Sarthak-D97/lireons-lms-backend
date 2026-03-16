import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import type { AuthTokenResponse, AuthUserProfile } from "@lireons/shared-types";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import GithubProvider from "next-auth/providers/github";
import LinkedInProvider from "next-auth/providers/linkedin";
import Credentials from "next-auth/providers/credentials";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account && account.provider !== "credentials") {
        try {
          // Sync OAuth user with NestJS backend
          const res = await fetch(`${API_URL}/api/auth/oauth-callback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              provider: account.provider,
              email: user.email,
              name: user.name,
            }),
          });

          if (!res.ok) {
            console.error("Failed to sync OAuth user with backend");
            return false;
          }

          const data = (await res.json()) as AuthTokenResponse;
          // Store the backend JWT in the user object for use in jwt callback
          (user as any).backendToken = data.access_token;
          (user as any).backendUser = data.user;
          console.log("✅ OAuth user synced with backend:", user.email);
        } catch (error) {
          console.error("Error syncing OAuth user:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = (user as any).backendUser?.id || user.id;
        token.email = user.email;
        token.name = user.name;
        token.number = (user as any).backendUser?.number || (user as any).number;
        token.orgtype = (user as any).backendUser?.orgtype || (user as any).orgtype;
        token.ownerId = (user as any).backendUser?.ownerId || (user as any).ownerId;
        token.backendToken = (user as any).backendToken;
      }

      if (trigger === "update" && session?.userdatas) {
        token.number = session.userdatas.number;
        token.orgtype = session.userdatas.orgtype;
        token.ownerId = session.userdatas.ownerId;
      }

      return token;
    },

    async session({ session, token }) {
      session.userdatas = {
        name: token.name,
        email: token.email,
        number: token.number,
        orgtype: token.orgtype,
        ownerId: token.ownerId,
      };

      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID || "",
      clientSecret: process.env.FACEBOOK_SECRET || "",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID || "",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.warn("⚠️ [Auth] Missing credentials");
          return null;
        }

        try {
          // Call NestJS backend for authentication
          const res = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!res.ok) {
            console.warn(`⚠️ [Auth] Login failed for: ${credentials.email}`);
            return null;
          }

          const data = (await res.json()) as AuthTokenResponse;

          const backendUser: AuthUserProfile = data.user;

          return {
            id: backendUser.id,
            email: backendUser.email,
            name: backendUser.name,
            number: backendUser.number,
            orgtype: backendUser.orgtype,
            ownerId: backendUser.ownerId,
            backendToken: data.access_token,
          };
        } catch (err) {
          console.error("🔥 [Auth] Authorization Error:", err);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);