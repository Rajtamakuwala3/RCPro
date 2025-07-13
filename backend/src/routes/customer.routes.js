import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { NewCustomerHandler, ExistingCustomerHandler } from "../controllers/customer.controller.js";

const router = Router();

router.route("/create").post(verifyJWT, NewCustomerHandler);
router.route("/search").get(verifyJWT, ExistingCustomerHandler);

export default router;
