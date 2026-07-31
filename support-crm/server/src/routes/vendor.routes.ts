import { Router } from "express";
import { vendorController } from "../controllers/vendor.controller";
import { validateBody } from "../middleware/validate";
import { createVendorSchema } from "../validators/vendor.validator";

export const vendorRouter = Router();

vendorRouter.get("/", vendorController.list);
vendorRouter.post("/", validateBody(createVendorSchema), vendorController.create);
