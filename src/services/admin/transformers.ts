import type { Prisma } from "@/generated/prisma";

export const toNumber = (
  value: Prisma.Decimal | number | string | null | undefined,
): number => {
  if (value == null) {
    return 0;
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return Number(value);
};
