import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { db, user, eq } from "@/db";
import { AuthOptions } from "next-auth";

// Rozšíření typů pro NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string | null;
      isAdmin?: boolean | null;
    };
  }
  interface User {
    username?: string;
    isAdmin?: boolean;
    isActive?: boolean;
  }
}

export const authOptions: AuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Uživatelské jméno nebo email", type: "text" },
        password: { label: "Heslo", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // Vyhledání uživatele podle uživatelského jména nebo emailu
        const result = await db
          .select()
          .from(user)
          .where(
            // Podpora přihlášení pomocí uživatelského jména nebo emailu
            eq(user.username, credentials.username) || 
            eq(user.email, credentials.username)
          )
          .limit(1);

        const foundUser = result[0];

        if (!foundUser || !foundUser.passwordHash) {
          return null;
        }

        // Ověření hesla
        const isValid = await bcrypt.compare(
          credentials.password,
          foundUser.passwordHash
        );

        if (!isValid) {
          return null;
        }

        // Pokud není uživatel aktivní, zabráníme přihlášení
        if (!foundUser.isActive) {
          return null;
        }

        // Vrátíme uživatelský objekt podle formátu NextAuth
        return {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          username: foundUser.username,
          isAdmin: foundUser.isAdmin,
        };
      },
    }),
    // Zde můžete přidat další poskytovatele jako GitHub, Google, apod.
  ],
  secret: process.env.NEXTAUTH_SECRET || "tajný-klíč-pro-vývoj-nepoužívat-v-produkci",
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 dní
  },
  callbacks: {
    // Přidáme vlastní pole do tokenu JWT
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    // Přidáme vlastní pole do session objektu
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub;
        session.user.username = token.username;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 