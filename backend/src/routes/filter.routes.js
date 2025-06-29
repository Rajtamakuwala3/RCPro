import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getRCBookByVehicleNo, searchByInsuranceMonth, searchByFitnessExpMonth, searchByCylinderExpMonth } from "../controllers/filterHandler.controller.js";
// import router from "./ocrHandler.routes.js";

const router = Router()

router.route("/fetchtinsurencedata").get(verifyJWT, searchByInsuranceMonth)
router.route("/fetchfitnessdata").get(verifyJWT, searchByFitnessExpMonth)
router.route("/fetchbycylindermonth").get(verifyJWT, searchByCylinderExpMonth)
router.route("/fetchbyvehicleno/:vehicleNo").get(verifyJWT, getRCBookByVehicleNo)

export default router;
