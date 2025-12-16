import type { Request, Response } from "express";
import { prisma } from "../../configs/prisma.js";

export async function createReview(req: Request, res: Response) {
  try {
    const { productId, message, rating, userId } = req.body;

    // kalau kamu punya auth middleware, biasanya userId dari req.user
    const authorId = (req as any).user?.id || userId;

    if (!productId || !message) {
      res.status(400).json({ message: "productId dan message wajib diisi" });
    } else if (!authorId) {
      res
        .status(401)
        .json({ message: "Unauthorized (userId tidak ditemukan)" });
    } else if (
      rating !== undefined &&
      (Number(rating) < 1 || Number(rating) > 5)
    ) {
      res.status(400).json({ message: "rating harus 1 - 5" });
    } else {
      // pastikan product ada
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true },
      });

      if (!product) {
        res.status(404).json({ message: "Product tidak ditemukan" });
      } else {
        const review = await prisma.review.create({
          data: {
            productId,
            userId: authorId,
            message,
            rating: rating === undefined ? null : Number(rating),
          },
          include: {
            user: { select: { id: true, name: true, email: true } },
            product: { select: { id: true, name: true } },
          },
        });

        res
          .status(201)
          .json({ message: "Review berhasil dibuat", data: review });
      }
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error?.message });
  }
}

export async function getReviewsByProduct(req: Request, res: Response) {
  try {
    const { productId } = req.params;

    if (!productId) {
      res.status(400).json({ message: "productId wajib" });
    } else {
      const reviews = await prisma.review.findMany({
        where: { productId },
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true } },
        },
      });

      res.status(200).json({ message: "OK", data: reviews });
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error?.message });
  }
}

export async function getReviewById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "id wajib" });
    } else {
      const review = await prisma.review.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, name: true } },
          product: { select: { id: true, name: true } },
        },
      });

      if (!review) {
        res.status(404).json({ message: "Review tidak ditemukan" });
      } else {
        res.status(200).json({ message: "OK", data: review });
      }
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error?.message });
  }
}

export async function updateReview(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { message, rating } = req.body;

    const authUserId = (req as any).user?.id; // kalau ada auth
    const isRatingProvided = rating !== undefined;

    if (!id) {
      res.status(400).json({ message: "id wajib" });
    } else if (!message && !isRatingProvided) {
      res
        .status(400)
        .json({ message: "Minimal update salah satu: message atau rating" });
    } else if (isRatingProvided && (Number(rating) < 1 || Number(rating) > 5)) {
      res.status(400).json({ message: "rating harus 1 - 5" });
    } else {
      const existing = await prisma.review.findUnique({
        where: { id },
        select: { id: true, userId: true },
      });

      if (!existing) {
        res.status(404).json({ message: "Review tidak ditemukan" });
      } else if (authUserId && existing.userId !== authUserId) {
        res.status(403).json({ message: "Forbidden: bukan pemilik review" });
      } else {
        const updated = await prisma.review.update({
          where: { id },
          data: {
            message: message ?? undefined,
            rating: isRatingProvided ? Number(rating) : undefined,
          },
          include: {
            user: { select: { id: true, name: true } },
          },
        });

        res
          .status(200)
          .json({ message: "Review berhasil diupdate", data: updated });
      }
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error?.message });
  }
}

export async function deleteReview(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const authUserId = (req as any).user?.id; // kalau ada auth

    if (!id) {
      res.status(400).json({ message: "id wajib" });
    } else {
      const existing = await prisma.review.findUnique({
        where: { id },
        select: { id: true, userId: true },
      });

      if (!existing) {
        res.status(404).json({ message: "Review tidak ditemukan" });
      } else if (authUserId && existing.userId !== authUserId) {
        res.status(403).json({ message: "Forbidden: bukan pemilik review" });
      } else {
        await prisma.review.delete({ where: { id } });
        res.status(200).json({ message: "Review berhasil dihapus" });
      }
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error?.message });
  }
}
