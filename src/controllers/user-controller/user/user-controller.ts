import type { Request, Response } from "express";
import prisma from "../../../configs/prisma.js";
import {
  AuthRequest,
  verifyToken,
} from "../../../middleware/auth-middleware.js";

export async function getUserProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id; // dari token

    if (!userId) {
      return res.status(400).json({ message: "User ID not found in token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err });
  }
}
