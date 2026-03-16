// next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import type { AuthUserProfile } from "@lireons/shared-types";

declare module "next-auth" {
  // 1. Extend the User type (returned from authorize)
  interface User {
    number?: string | null;
    orgtype?: string | null;
    ownerId?: string | null;
    backendToken?: string;
    backendUser?: AuthUserProfile;
  }

  // 2. Extend the Session type (used in frontend)
  interface Session {
    userdatas: {
      name?: string | null;
      email?: string | null;
      number?: string | null;
      orgtype?: string | null;
      ownerId?: string | null;
    };
    user: DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  // 3. Extend the JWT type (used in middleware/callbacks)
  interface JWT {
    id?: string;
    number?: string;
    orgtype?: string;
    ownerId?: string | null;
    backendToken?: string;
  }
}
