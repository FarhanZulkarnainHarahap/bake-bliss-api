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
const routers = express.Router();

// CREATE
routers
  .route("/")
  .get(getAllProducts)
  .post(
    fileUpload.fields([
      { name: "imagePreview", maxCount: 3 },
      { name: "imageContent", maxCount: 3 },
    ]),
    verifyToken,
    roleGuard("ADMIN"),
    createOneProduct
  );

routers
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

export default routers;
