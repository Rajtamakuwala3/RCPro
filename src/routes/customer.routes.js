import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { customerHandler } from "../controllers/customer.controller.js";

const router = Router();

router.route("/create").post(verifyJWT, customerHandler);

export default router;
