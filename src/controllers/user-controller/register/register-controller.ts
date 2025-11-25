import type { Request, Response } from "express";

import bcrypt from "bcryptjs";
import { prisma } from "../../../configs/prisma.js";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // validasi input
    if (!name || !email || !password) {
      res.status(400).json({ message: "Semua field wajib diisi" });
      return;
    }

    // cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: "Email sudah digunakan" });
      return;
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // simpan user baru
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER", // default
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    res.status(201).json({
      message: "Registrasi berhasil",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan pada server", error });
  }
};
