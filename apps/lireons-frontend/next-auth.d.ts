// next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  // 1. Extend the User type (returned from authorize)
  interface User {
    number?: string;
    orgtype?: string;
  }

  // 2. Extend the Session type (used in frontend)
  interface Session {
    userdatas: {
      name?: string | null;
      email?: string | null;
      number?: string | null;
      orgtype?: string | null;
    };
    user: DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  // 3. Extend the JWT type (used in middleware/callbacks)
  interface JWT {
    number?: string;
    orgtype?: string;
  }
}
