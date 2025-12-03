import type { Request, Response } from "express";
import fs from "fs";
import { prisma } from "../../configs/prisma.js";
import { cloudinary } from "../../configs/cloudinary.js";

type MulterRequest = Request & {
  file?: Express.Multer.File;
};

// Upload file local → Cloudinary
async function uploadToCloudinary(filePath: string) {
  return cloudinary.uploader.upload(filePath, {
    folder: "bake-bliss/products",
  });
}

// Remove file local setelah upload
function deleteLocalFile(filePath: string) {
  fs.unlink(filePath, (err) => {
    if (err) console.log("Failed to delete local file:", err);
  });
}

// ================================================
// POST /api/products — Create Product
// ================================================
export async function createProduct(req: MulterRequest, res: Response) {
  try {
    const { name, description, price } = req.body;

    if (!name || !price) {
      res.status(400).json({ message: "name dan price wajib diisi" });
      return;
    }

    let imageUrl: string | null = null;

    if (req.file) {
      const upload = await uploadToCloudinary(req.file.path);
      imageUrl = upload.secure_url;

      deleteLocalFile(req.file.path);
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        imageUrl,
      },
    });

    res.status(201).json({
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: "Server error", error });
  }
}

// ================================================
// GET ALL /api/products
// ================================================
export async function getAllProducts(_req: Request, res: Response) {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      message: "Products fetched",
      data: products,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Server error", error });
  }
}

// ================================================
// GET ONE /api/products/:id
// ================================================
export async function getProductById(req: Request, res: Response) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    if (!product) {
      res.status(404).json({ message: "Produk tidak ditemukan" });
      return;
    }

    res.status(200).json({
      message: "Product fetched",
      data: product,
    });
  } catch (error) {
    console.error("Get product by id error:", error);
    res.status(500).json({ message: "Server error", error });
  }
}

// ================================================
// PUT /api/products/:id — Update Product
// ================================================
export async function updateProduct(req: MulterRequest, res: Response) {
  try {
    const { name, description, price } = req.body;

    const existing = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    let imageUrl = existing.imageUrl;

    if (req.file) {
      const upload = await uploadToCloudinary(req.file.path);
      imageUrl = upload.secure_url;

      deleteLocalFile(req.file.path);
    }

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name: name ?? existing.name,
        description: description ?? existing.description,
        price: price ? Number(price) : existing.price,
        imageUrl,
      },
    });

    res.status(200).json({
      message: "Product updated",
      data: updated,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Server error", error });
  }
}

// ================================================
// DELETE /api/products/:id
// ================================================
export async function deleteProduct(req: Request, res: Response) {
  try {
    const existing = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    await prisma.product.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Server error", error });
  }
}
