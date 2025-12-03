import express from "express";
import { fileUpload } from "../middleware/file-upload-middleware.js";
import { verifyToken } from "../middleware/auth-middleware.js";

import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product-controller/product-controller.js";

const router = express.Router();

// GET all
router.get("/", verifyToken, getAllProducts);

// CREATE
router.post(
  "/",
  verifyToken,
  fileUpload.single("image"), // ← pakai diskStorage upload
  createProduct
);

// GET by ID
router.get("/:id", verifyToken, getProductById);

// UPDATE
router.put(
  "/:id",
  verifyToken,
  fileUpload.single("image"), // optional update image
  updateProduct
);

// DELETE
router.delete("/:id", verifyToken, deleteProduct);

export default router;
