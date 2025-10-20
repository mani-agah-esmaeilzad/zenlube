import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth.config";

export async function getAppSession(): Promise<Session | null> {
  const getSession = getServerSession as unknown as (options: typeof authOptions) => Promise<Session | null>;
  return getSession(authOptions);
}
