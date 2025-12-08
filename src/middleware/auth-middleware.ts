import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CustomJwtPayload } from "../types/expres.js"; // Pastikan Anda menyimpan CLIENT_ID di .env

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    res.status(401).json({ message: "Unauthorized: Token not found" });
    return;
  }

  try {
    const payload = jwt.verify(
      accessToken,
      process.env.JWT_SECRET!
    ) as CustomJwtPayload;
    if (!payload) {
      res.status(401).json({ message: "Token verification failed" });
      return;
    }
    // Optional: kamu bisa validasi `provider` kalau mau
    req.user = payload;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
  }
}

export function roleGuard(...roles: string[]) {
  return async function (req: Request, res: Response, next: NextFunction) {
    const user = req.user;

    if (roles.includes(user?.role)) {
      next();
      return;
    }

    res.status(403).json({ message: "Unauthorized access" });
  };
}
