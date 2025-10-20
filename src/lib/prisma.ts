import { PrismaClient } from "../generated/prisma";

declare global {
  var cachedPrisma: PrismaClient | undefined;
}

const prisma =
  global.cachedPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.cachedPrisma = prisma;
}

export default prisma;
