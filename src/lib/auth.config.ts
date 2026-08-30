import { PrismaAdapter } from "@auth/prisma-adapter";
import type { AdapterUser } from "next-auth/adapters";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import prisma from "./prisma";
import { buildPhoneAccountEmail, isPhoneAccountEmail } from "./account-email";
import { config } from "./config";
import { authorizeOtpAccount } from "./otp-auth";
import { OtpVerificationError, verifyOtpCodeAndRun } from "@/services/otp";

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
        const user = await authorizeOtpAccount(
          {
            phone: credentials?.phone,
            otpCode: credentials?.otpCode,
          },
          {
            authenticateOtp: async ({ normalizedPhone, normalizedCode, phoneCandidates }) => {
              try {
                return await verifyOtpCodeAndRun(
                  normalizedPhone,
                  normalizedCode,
                  "account",
                  async (transaction) => {
                    const matchingUsers = await transaction.user.findMany({
                      where: { phone: { in: phoneCandidates } },
                      select: { id: true, email: true, name: true, phone: true, role: true },
                    });
                    const existingUser = phoneCandidates
                      .map((candidatePhone) => matchingUsers.find((candidate) => candidate.phone === candidatePhone))
                      .find((candidate) => candidate !== undefined);

                    if (existingUser) {
                      return {
                        id: existingUser.id,
                        email: existingUser.email,
                        name: existingUser.name,
                        role: existingUser.role,
                      };
                    }

                    return transaction.user.upsert({
                      where: { phone: normalizedPhone },
                      update: {},
                      create: {
                        email: buildPhoneAccountEmail(normalizedPhone),
                        phone: normalizedPhone,
                      },
                      select: { id: true, email: true, name: true, role: true },
                    });
                  },
                );
              } catch (error) {
                if (error instanceof OtpVerificationError) {
                  return null;
                }
                throw error;
              }
            },
          },
        );

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
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Credentials",
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

        if (!user || user.role !== "ADMIN" || !user.password) {
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
      if (isPhoneAccountEmail(session.user.email)) {
        session.user.email = null;
      }
      return session;
    },
  },
};
