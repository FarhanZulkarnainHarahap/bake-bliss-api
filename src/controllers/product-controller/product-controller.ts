import type { Request, Response } from "express";
import fs from "fs/promises";
import { prisma } from "../../configs/prisma.js";
import { cloudinary } from "../../configs/cloudinary-config.js";

export async function createOneProduct(req: Request, res: Response) {
  try {
    const { name, description, price } = req.body;
    const files = req.files as {
      [key: string]: Express.Multer.File[];
    };

    if (!name || !description || !price || !files) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const imagePreviewData: { url: string }[] = [];
    const imageContentData: { url: string }[] = [];

    for (const key in files) {
      for (const el of files[key]) {
        const result = await cloudinary.uploader.upload(el.path, {
          folder: "bake-bliss/products",
        });

        const img = { url: result.secure_url };

        if (key === "imagePreview") {
          imagePreviewData.push(img);
        } else if (key === "imageContent") {
          imageContentData.push(img);
        }

        await fs.unlink(el.path);
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        productImages: {
          create: [
            ...imagePreviewData.map((image) => ({
              ImagePreview: { create: image },
            })),
            ...imageContentData.map((image) => ({
              ImageContent: { create: image },
            })),
          ],
        },
      },
    });
    if (!product) {
      res.status(400).json({ mesage: "ada data yang kosong" });
    }
    res.status(201).json({ message: "product was Created", data: product });
    console.log("Created product", product);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to create product" });
  }
}

/**
 * GET ALL PRODUCTS
 */
export async function getAllProducts(req: Request, res: Response) {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        productImages: {
          include: {
            ImagePreview: true,
            ImageContent: true,
          },
        },
      },
    });

    res.status(200).json({
      message: "Success get all products",
      data: products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get products" });
  }
}

/**
 * GET ONE PRODUCT BY ID
 */
export async function getOneProductById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        productImages: {
          include: {
            ImagePreview: true,
            ImageContent: true,
          },
        },
      },
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.status(200).json({
      message: "Success get product",
      data: product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get product" });
  }
}

/**
 * UPDATE PRODUCT (update basic fields + optional tambah gambar baru)
 * Route contoh: PUT /products/:id
 * Body: name?, description?, price?
 * Files: imagePreview?, imageContent? (opsional, seperti create)
 */
export async function UpdateProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, description, price } = req.body;
    const files = req.files as
      | {
          [key: string]: Express.Multer.File[];
        }
      | undefined;

    // cek apakah product ada
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // handle file jika ada (tambah images baru, tidak menghapus yang lama)
    const imagePreviewData: { url: string }[] = [];
    const imageContentData: { url: string }[] = [];

    if (files) {
      for (const key in files) {
        for (const el of files[key]) {
          const result = await cloudinary.uploader.upload(el.path, {
            folder: "Events-mini-project",
          });

          const img = { url: result.secure_url };

          if (key === "imagePreview") {
            imagePreviewData.push(img);
          } else if (key === "imageContent") {
            imageContentData.push(img);
          }

          await fs.unlink(el.path);
        }
      }
    }

    const productImagesCreateData =
      imagePreviewData.length === 0 && imageContentData.length === 0
        ? undefined
        : [
            ...imagePreviewData.map((image) => ({
              url: image.url,
              ImagePreview: {
                create: {
                  url: image.url,
                },
              },
            })),
            ...imageContentData.map((image) => ({
              url: image.url,
              ImageContent: {
                create: {
                  url: image.url,
                },
              },
            })),
          ];

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: name ?? existingProduct.name,
        description: description ?? existingProduct.description,
        price:
          price !== undefined ? Number(price) : Number(existingProduct.price),
        productImages: productImagesCreateData
          ? {
              create: productImagesCreateData,
            }
          : undefined,
      },
      include: {
        productImages: {
          include: {
            ImagePreview: true,
            ImageContent: true,
          },
        },
      },
    });

    res.status(200).json({
      message: "Product updated",
      data: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update product" });
  }
}

/**
 * DELETE ONE PRODUCT
 * (delete productImages dulu, baru product)
 * Route: DELETE /products/:id
 */
export async function deleteOneProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // cek ada atau tidak
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        productImages: true,
      },
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // hapus semua ProductImage yang terkait
    await prisma.productImage.deleteMany({
      where: { productId: id },
    });

    // hapus product
    await prisma.product.delete({
      where: { id },
    });

    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete product" });
  }
}
