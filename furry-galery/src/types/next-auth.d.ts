import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Rozšíření typu User pro NextAuth
   */
  interface User {
    username?: string;
    isAdmin?: boolean;
  }

  /**
   * Rozšíření typu Session.user pro NextAuth
   */
  interface Session {
    user: {
      id: string;
      username?: string;
      isAdmin?: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  /**
   * Rozšíření typu JWT pro NextAuth
   */
  interface JWT {
    username?: string;
    isAdmin?: boolean;
  }
} 