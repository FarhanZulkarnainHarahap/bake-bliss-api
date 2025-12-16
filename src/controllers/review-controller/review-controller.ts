import type { Request, Response } from "express";
import { prisma } from "../../configs/prisma.js";

function toIntOrNull(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

export async function createReview(req: Request, res: Response) {
  try {
    const { productId, message, name } = req.body as {
      productId?: string;
      message?: string;
      name?: string;
      rating?: unknown;
    };

    const rating = toIntOrNull((req.body as { rating?: unknown }).rating);

    if (!productId || !message || !name) {
      res
        .status(400)
        .json({ message: "productId, name, dan message wajib diisi" });
    } else if (rating !== null && (rating < 1 || rating > 5)) {
      res.status(400).json({ message: "rating harus 1 - 5" });
    } else {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, name: true },
      });

      if (!product) {
        res.status(404).json({ message: "Product tidak ditemukan" });
      } else {
        const review = await prisma.review.create({
          data: {
            productId,
            name: name.trim(),
            message: message.trim(),
            rating,
          },
          include: {
            product: { select: { id: true, name: true } },
          },
        });

        res
          .status(201)
          .json({ message: "Review berhasil dibuat", data: review });
      }
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ message: "Internal server error", error: message });
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
      });

      res.status(200).json({ message: "OK", data: reviews });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ message: "Internal server error", error: message });
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
          product: { select: { id: true, name: true } },
        },
      });

      if (!review) {
        res.status(404).json({ message: "Review tidak ditemukan" });
      } else {
        res.status(200).json({ message: "OK", data: review });
      }
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ message: "Internal server error", error: message });
  }
}

export async function updateReview(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const { message, name } = req.body as {
      message?: string;
      name?: string;
      rating?: unknown;
    };

    const ratingRaw = (req.body as { rating?: unknown }).rating;
    const rating = ratingRaw === undefined ? undefined : toIntOrNull(ratingRaw);

    if (!id) {
      res.status(400).json({ message: "id wajib" });
    } else if (!message && !name && ratingRaw === undefined) {
      res.status(400).json({
        message: "Minimal update salah satu: name / message / rating",
      });
    } else if (
      rating !== undefined &&
      rating !== null &&
      (rating < 1 || rating > 5)
    ) {
      res.status(400).json({ message: "rating harus 1 - 5" });
    } else {
      const existing = await prisma.review.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!existing) {
        res.status(404).json({ message: "Review tidak ditemukan" });
      } else {
        const updated = await prisma.review.update({
          where: { id },
          data: {
            name: name ? name.trim() : undefined,
            message: message ? message.trim() : undefined,
            // jika ratingRaw dikirim tapi kosong -> null
            rating: ratingRaw === undefined ? undefined : rating,
          },
        });

        res
          .status(200)
          .json({ message: "Review berhasil diupdate", data: updated });
      }
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ message: "Internal server error", error: message });
  }
}

export async function deleteReview(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "id wajib" });
    } else {
      const existing = await prisma.review.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!existing) {
        res.status(404).json({ message: "Review tidak ditemukan" });
      } else {
        await prisma.review.delete({ where: { id } });
        res.status(200).json({ message: "Review berhasil dihapus" });
      }
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ message: "Internal server error", error: message });
  }
}
