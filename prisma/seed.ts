import { PrismaClient, Role } from "../src/generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

function requiredEnv(name: string, fallback: string) {
  const value = process.env[name]?.trim();
  if (value) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error(`${name} is required for production seeding.`);
  }
  return fallback;
}

async function main() {
  const email = requiredEnv("ADMIN_EMAIL", "admin@oilbar.ir");
  const phone = process.env.ADMIN_PHONE?.trim() || "09982221311";
  const name = process.env.ADMIN_NAME?.trim() || "مدیر اویل‌بار";
  const password = requiredEnv("ADMIN_PASSWORD", "Admin@123");
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      phone,
      password: passwordHash,
      role: Role.ADMIN,
    },
    create: {
      email,
      name,
      phone,
      password: passwordHash,
      role: Role.ADMIN,
    },
  });

  console.log(`Seeded Oilbar admin user: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
