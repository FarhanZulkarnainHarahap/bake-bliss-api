import express from "express";
import { register } from "../controllers/user-controller/register/register-controller.js";

const router = express.Router();

// endpoint: POST /api/auth/register
router.post("/register", register);

export default router;
