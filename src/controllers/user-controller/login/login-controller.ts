import type { Request, Response } from "express";
import { prisma } from "../../../configs/prisma.js";
import bcrypt from "bcryptjs";
import jw from "jsonwebtoken";

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    // validasi input
    if (!email || !password) {
      res.status(400).json({ message: "Email dan password wajib diisi" });
      return;
    }

    // cari user berdasarkan email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (!existingUser) {
      res.status(400).json({ message: "Email atau password salah" });
      return;
    }
    if (!existingUser.password) {
      res.status(400).json({ message: "User has no password set" });
      return;
    }
    // cek password
    const isValidPassword = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isValidPassword) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    // Generate JWT token
    const accesstoken = jw.sign(
      {
        id: existingUser.id,
        username: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
      },
      process.env.JWT_SECRET!
    );

    if (!accesstoken) {
      res.status(500).json({ message: "Failed to generate token" });
      return;
    }

    res
      .cookie("accessToken", accesstoken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none", // PENTING kalau beda domain
        path: "/", // supaya dikirim ke semua path
      })
      .status(200)
      .json({ message: "Login success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}
