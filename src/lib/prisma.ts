import { PrismaClient } from "../generated/prisma";

import { config } from "./config";

declare global {
  var cachedPrisma: PrismaClient | undefined;
}

const prisma =
  global.cachedPrisma ??
  new PrismaClient({
    log: config.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: config.DATABASE_URL,
        ...(config.DATABASE_DIRECT_URL ? { directUrl: config.DATABASE_DIRECT_URL } : {}),
      },
    },
  });

if (config.NODE_ENV !== "production") {
  global.cachedPrisma = prisma;
}

export default prisma;
