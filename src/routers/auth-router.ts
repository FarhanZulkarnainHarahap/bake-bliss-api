import express from "express";
import { register } from "../controllers/user-controller/register/register-controller.js";
import { login } from "../controllers/user-controller/login/login-controller.js";

const router = express.Router();

// endpoint: POST /api/auth/register
router.route("/register").post(register);
router.route("/login").post(login);

export default router;
