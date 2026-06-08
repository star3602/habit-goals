import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/prisma.js", () => {
  const users = new Map<string, any>();

  return {
    prisma: {
      user: {
        findUnique: vi.fn(async ({ where }: { where: { email: string } }) => users.get(where.email) ?? null),
        create: vi.fn(async ({ data }: { data: { email: string; password_hash: string } }) => {
          const user = {
            id: "user-1",
            email: data.email,
            password_hash: data.password_hash,
            created_at: new Date("2026-01-01T00:00:00.000Z")
          };
          users.set(data.email, user);
          return user;
        })
      },
      __reset: () => users.clear()
    }
  };
});

import { createApp } from "../src/app.js";
import { prisma } from "../src/prisma.js";

describe("auth routes", () => {
  beforeEach(() => {
    (prisma as any).__reset();
  });

  it("registers and logs in a user", async () => {
    const app = createApp();

    const register = await request(app)
      .post("/api/auth/register")
      .send({ email: "Demo@Example.com", password: "password123" })
      .expect(201);

    expect(register.body.token).toEqual(expect.any(String));
    expect(register.body.user.email).toBe("demo@example.com");
    expect(register.body.user.password_hash).toBeUndefined();

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "demo@example.com", password: "password123" })
      .expect(200);

    expect(login.body.token).toEqual(expect.any(String));
    expect(login.body.user.id).toBe("user-1");
  });
});
