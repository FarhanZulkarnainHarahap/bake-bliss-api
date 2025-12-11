import express from "express";
import { fileUpload } from "../middleware/file-upload-middleware.js";
import { roleGuard, verifyToken } from "../middleware/auth-middleware.js";

import {
  createOneProduct,
  deleteOneProduct,
  getAllProducts,
  getOneProductById,
  UpdateProduct,
} from "../controllers/product-controller/product-controller.js";
const router = express.Router();

import multer from "multer";
const upload = multer({ dest: "./public/assets/product" });

// CREATE
router
  .route("/")
  .get(getAllProducts)
  .post(
    verifyToken,
    roleGuard("ADMIN"),
    upload.fields([
      { name: "imagePreview", maxCount: 3 },
      { name: "imageContent", maxCount: 3 },
    ]),
    createOneProduct
  );

router
  .route("/:id")
  .get(getOneProductById)
  .put(
    verifyToken,
    roleGuard("ADMIN"),
    fileUpload.fields([
      { name: "imagePreview", maxCount: 3 },
      { name: "imageContent", maxCount: 3 },
    ]),
    UpdateProduct
  )
  .delete(verifyToken, roleGuard("ADMIN"), deleteOneProduct);

export default router;
