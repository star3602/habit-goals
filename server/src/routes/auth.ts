import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { signToken } from "../utils/auth.js";

const router = Router();

const credentialsSchema = z.object({
  email: z.string().email().transform((email) => email.toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

function publicUser(user: { id: string; email: string; created_at: Date }) {
  return {
    id: user.id,
    email: user.email,
    created_at: user.created_at
  };
}

router.post("/register", async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid registration data.", errors: parsed.error.flatten() });
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return res.status(409).json({ message: "Email is already registered." });
  }

  const password_hash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      password_hash
    }
  });

  const token = signToken({ userId: user.id, email: user.email });
  return res.status(201).json({ token, user: publicUser(user) });
});

router.post("/login", async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid login data.", errors: parsed.error.flatten() });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const passwordMatches = await bcrypt.compare(parsed.data.password, user.password_hash);
  if (!passwordMatches) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const token = signToken({ userId: user.id, email: user.email });
  return res.json({ token, user: publicUser(user) });
});

export { router as authRouter };
