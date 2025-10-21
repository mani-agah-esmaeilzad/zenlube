import { PrismaAdapter } from "@auth/prisma-adapter";
import type { AdapterUser } from "next-auth/adapters";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import prisma from "./prisma";

type JwtCallbackParams = {
  token: JWT & { role?: string | null };
  user?: AdapterUser | null;
};

type SessionCallbackParams = {
  session: Session & { user: Session["user"] & { id?: string; role?: string | null } };
  token: JWT & { sub?: string; role?: string | null };
};

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "ایمیل", type: "email" },
        password: { label: "رمز عبور", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user?.password) {
          return null;
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
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
      return session;
    },
  },
};
