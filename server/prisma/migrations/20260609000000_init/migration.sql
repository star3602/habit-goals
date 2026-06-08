-- PostgreSQL production migration for Railway.
-- The default schema.prisma remains SQLite for local development; Railway uses schema.postgres.prisma.

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Goal" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Checkin" (
  "id" TEXT NOT NULL,
  "goal_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Checkin_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "Goal_user_id_idx" ON "Goal"("user_id");
CREATE INDEX "Checkin_user_id_idx" ON "Checkin"("user_id");
CREATE INDEX "Checkin_goal_id_idx" ON "Checkin"("goal_id");
CREATE UNIQUE INDEX "Checkin_goal_id_user_id_date_key" ON "Checkin"("goal_id", "user_id", "date");

ALTER TABLE "Goal"
  ADD CONSTRAINT "Goal_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Checkin"
  ADD CONSTRAINT "Checkin_goal_id_fkey"
  FOREIGN KEY ("goal_id") REFERENCES "Goal"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Checkin"
  ADD CONSTRAINT "Checkin_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
