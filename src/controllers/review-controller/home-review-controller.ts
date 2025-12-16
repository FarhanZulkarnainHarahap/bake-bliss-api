import type { Request, Response } from "express";
import { prisma } from "../../configs/prisma.js";

function toIntOrNull(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function toBoolOrUndefined(value: unknown): boolean | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return undefined;
}

// ✅ Public: ambil review yang tampil di home
export async function getPublishedHomeReviews(_req: Request, res: Response) {
  try {
    const reviews = await prisma.homeReview.findMany({
      where: { isPublished: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        text: true,
        rating: true,
        order: true,
        createdAt: true,
      },
    });

    res.status(200).json({ message: "OK", data: reviews });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ message: "Internal server error", error: msg });
  }
}

// ✅ Admin: list semua (published + draft)
export async function getAllHomeReviews(_req: Request, res: Response) {
  try {
    const reviews = await prisma.homeReview.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    res.status(200).json({ message: "OK", data: reviews });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ message: "Internal server error", error: msg });
  }
}

export async function createHomeReview(req: Request, res: Response) {
  try {
    const body = req.body as {
      name?: string;
      text?: string;
      rating?: unknown;
      order?: unknown;
      isPublished?: unknown;
    };

    const name = body.name?.trim();
    const text = body.text?.trim();
    const rating = toIntOrNull(body.rating);
    const order = toIntOrNull(body.order);
    const isPublished = toBoolOrUndefined(body.isPublished);

    if (!name || !text) {
      res.status(400).json({ message: "name dan text wajib diisi" });
      return;
    }

    if (rating !== null && (rating < 1 || rating > 5)) {
      res.status(400).json({ message: "rating harus 1 - 5" });
      return;
    }

    const created = await prisma.homeReview.create({
      data: {
        name,
        text,
        rating,
        order: order ?? 0,
        isPublished: isPublished ?? true,
      },
    });

    res
      .status(201)
      .json({ message: "Home review berhasil dibuat", data: created });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ message: "Internal server error", error: msg });
  }
}

export async function updateHomeReview(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const body = req.body as {
      name?: string;
      text?: string;
      rating?: unknown;
      order?: unknown;
      isPublished?: unknown;
    };

    if (!id) {
      res.status(400).json({ message: "id wajib" });
      return;
    }

    const ratingRaw = body.rating;
    const orderRaw = body.order;

    const rating = ratingRaw === undefined ? undefined : toIntOrNull(ratingRaw);
    const order = orderRaw === undefined ? undefined : toIntOrNull(orderRaw);
    const isPublished = toBoolOrUndefined(body.isPublished);

    if (rating !== undefined && rating !== null && (rating < 1 || rating > 5)) {
      res.status(400).json({ message: "rating harus 1 - 5" });
      return;
    }

    const existing = await prisma.homeReview.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      res.status(404).json({ message: "Home review tidak ditemukan" });
      return;
    }

    const updated = await prisma.homeReview.update({
      where: { id },
      data: {
        name: body.name?.trim() || undefined,
        text: body.text?.trim() || undefined,
        rating,
        order: order ?? undefined,
        isPublished,
      },
    });

    res
      .status(200)
      .json({ message: "Home review berhasil diupdate", data: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ message: "Internal server error", error: msg });
  }
}

export async function deleteHomeReview(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "id wajib" });
      return;
    }

    const existing = await prisma.homeReview.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      res.status(404).json({ message: "Home review tidak ditemukan" });
      return;
    }

    await prisma.homeReview.delete({ where: { id } });
    res.status(200).json({ message: "Home review berhasil dihapus" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ message: "Internal server error", error: msg });
  }
}
