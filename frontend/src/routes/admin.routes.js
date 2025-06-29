import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { registerAdmin, loginAdmin } from "../controllers/admin.controller.js";

const router = Router();

router.route("/register").post(registerAdmin);
router.route("/login").post(loginAdmin);

export default router;