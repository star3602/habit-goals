import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/auth.js";

export type AuthUser = {
  id: string;
  email: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header("Authorization");

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing Authorization bearer token." });
  }

  try {
    const token = header.slice("Bearer ".length);
    const payload = verifyToken(token);
    req.user = { id: payload.userId, email: payload.email };
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}
