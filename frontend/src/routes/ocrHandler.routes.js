import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { ocrHandler } from "../controllers/OCRHandler.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/imagetotext").post(verifyJWT,upload.single("image"),ocrHandler);

export default router;


