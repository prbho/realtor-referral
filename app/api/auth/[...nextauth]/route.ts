// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { encode, decode } from "next-auth/jwt";
import { checkRateLimit, recordAttempt, clearAttempts } from "@/lib/rateLimit";

const DEFAULT_MAX_AGE = 24 * 60 * 60; // 1 day
const REMEMBER_ME_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials");
          return null;
        }

        const email = credentials.email.trim().toLowerCase();
        const identifier = `login:${email}`;

        const rateCheck = await checkRateLimit(identifier);
        if (!rateCheck.allowed) {
          throw new Error(
            `Too many login attempts. Try again in ${rateCheck.retryAfterMinutes} minutes.`
          );
        }

        try {
          const user = await prisma.user.findUnique({ where: { email } });

          if (!user || !user.password) {
            await recordAttempt(identifier);
            console.log("❌ User not found or no password set");
            return null;
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!passwordMatch) {
            await recordAttempt(identifier);
            console.log("❌ Password mismatch");
            return null;
          }

          if (!user.emailVerified) {
            throw new Error("EmailNotVerified");
          }

          await clearAttempts(identifier);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            rememberMe: credentials.rememberMe === "true",
          };
        } catch (error) {
          if (error instanceof Error && error.message === "EmailNotVerified") {
            throw error;
          }
          console.error("❌ Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role ?? "";
        token.id = user.id;
        token.rememberMe = user.rememberMe;
      }
      if (trigger === "update" && session?.image !== undefined) {
        token.picture = session.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.image = token.picture as string | null;
      }
      return session;
    },
  },
  jwt: {
    // Custom encode lets us vary the token's expiry per sign-in based on "remember me"
    encode: async ({ secret, token }) => {
      const effectiveMaxAge = token?.rememberMe
        ? REMEMBER_ME_MAX_AGE
        : DEFAULT_MAX_AGE;
      return encode({ secret, token, maxAge: effectiveMaxAge });
    },
    decode: async ({ secret, token }) => {
      return decode({ secret, token: token! });
    },
  },
  session: {
    strategy: "jwt",
    maxAge: REMEMBER_ME_MAX_AGE,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
