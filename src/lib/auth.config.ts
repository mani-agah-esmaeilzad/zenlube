import { PrismaAdapter } from "@auth/prisma-adapter";
import type { AdapterUser } from "next-auth/adapters";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./prisma";
import { config } from "./config";
import { normalizeIranPhone } from "@/lib/phone";
import { verifyOtpCode } from "@/services/otp";

type RoleAwareToken = JWT & { role?: string | null; adminExpiresAt?: number };

type JwtCallbackParams = {
  token: RoleAwareToken;
  user?: AdapterUser | null;
};

type SessionCallbackParams = {
  session: Session & {
    user: Session["user"] & { id?: string; role?: string | null; adminExpiresAt?: number };
  };
  token: RoleAwareToken & { sub?: string };
};

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt" as const,
    maxAge: 60 * 60 * 24, // 24 hours for standard sessions
  },
  secret: config.NEXTAUTH_SECRET,
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        phone: { label: "شماره موبایل", type: "text" },
        otpCode: { label: "کد تایید", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials.otpCode) {
          return null;
        }

        try {
          await verifyOtpCode(credentials.phone, credentials.otpCode, "account");
        } catch {
          return null;
        }

        const normalizedPhone = normalizeIranPhone(credentials.phone);
        const user = await prisma.user.findFirst({
          where: {
            phone: normalizedPhone,
          },
        });

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: JwtCallbackParams) {
      if (user) {
        const userWithRole = user as AdapterUser & { role?: string | null };
        token.role = userWithRole.role ?? token.role;
        if (token.role === "ADMIN") {
          token.adminExpiresAt = Math.floor(Date.now() / 1000) + 15 * 60; // 15 minute admin session window
        }
      }

      if (token.role === "ADMIN" && token.adminExpiresAt && token.adminExpiresAt < Math.floor(Date.now() / 1000)) {
        delete token.role;
        delete token.adminExpiresAt;
      }

      return token;
    },
    async session({ session, token }: SessionCallbackParams) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      if (typeof token.role === "string") {
        session.user.role = token.role;
      }
      if (typeof token.adminExpiresAt === "number") {
        session.user.adminExpiresAt = token.adminExpiresAt;
      }
      return session;
    },
  },
};
