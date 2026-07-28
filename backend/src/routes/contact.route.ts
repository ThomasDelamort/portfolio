import { Router } from "express";
import { submitContact } from "../controllers/contactController.js";

const router = Router();
router.post("/", submitContact);

export default router;
