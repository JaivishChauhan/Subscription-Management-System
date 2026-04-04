import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

/**
 * Extended NextAuth type declarations.
 * Adds the `role` field to User, Session, and JWT for RBAC enforcement.
 */

declare module "next-auth" {
  interface User extends DefaultUser {
    role: string;
  }

  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: string;
  }
}
