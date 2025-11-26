import type { Request, Response } from "express";
import { prisma } from "../../../configs/prisma.js";
import { verifyToken } from "../../../middleware/auth-middleware.js";
import { CustomJwtPayload } from "@/types/expres.js";
import jwt from "jsonwebtoken";

export async function getUserProfile(req: Request, res: Response) {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      res.status(401).json({ message: "Unauthorized. No token provided." });
      return;
    }

    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_SECRET!
    ) as CustomJwtPayload;
    if (!decoded || !decoded.id) {
      res.status(401).json({ message: "Unauthorized. Invalid token." });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.status(200).json({
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err });
  }
}

export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      message: "Users fetched successfully",
      data: users,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err });
  }
}

export async function getUserById(req: Request, res: Response) {
  try {
    const userId = req.params.id;

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
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.status(200).json({
      message: "User fetched successfully",
      data: user,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
}
export async function deleteUserById(req: Request, res: Response) {
  try {
    const userId = req.params.id;

    const user = await prisma.user.delete({
      where: { id: userId },
    });

    res.status(200).json({
      message: "User deleted successfully",
      data: user,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
}
