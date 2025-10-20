import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth.config";

type RouteHandler = (options: typeof authOptions) => {
  GET: (...args: unknown[]) => Promise<Response>;
  POST: (...args: unknown[]) => Promise<Response>;
};

const handler = (NextAuth as unknown as RouteHandler)(authOptions);

export const { GET, POST } = handler;
