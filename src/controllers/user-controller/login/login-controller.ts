import type { Request, Response } from "express";
import prisma from "../../../configs/prisma.js";
import bcrypt from "bcryptjs";

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    // validasi input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email dan password wajib diisi" });
    }

    // cari user berdasarkan email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Email atau password salah" });
    }
    // cek password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Email atau password salah" });
    }

    // login berhasil
    res.status(200).json({
      message: "Login berhasil",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}
