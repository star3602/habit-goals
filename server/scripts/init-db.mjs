import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe("PRAGMA foreign_keys = ON");

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "email" TEXT NOT NULL UNIQUE,
      "password_hash" TEXT NOT NULL,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Goal" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "user_id" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "description" TEXT,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Goal_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "User" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Checkin" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "goal_id" TEXT NOT NULL,
      "user_id" TEXT NOT NULL,
      "date" TEXT NOT NULL,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Checkin_goal_id_fkey"
        FOREIGN KEY ("goal_id") REFERENCES "Goal" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "Checkin_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "User" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);

  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "Goal_user_id_idx" ON "Goal" ("user_id")');
  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "Checkin_user_id_idx" ON "Checkin" ("user_id")');
  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "Checkin_goal_id_idx" ON "Checkin" ("goal_id")');
  await prisma.$executeRawUnsafe(
    'CREATE UNIQUE INDEX IF NOT EXISTS "Checkin_goal_id_user_id_date_key" ON "Checkin" ("goal_id", "user_id", "date")'
  );

  console.log("SQLite database is ready.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
