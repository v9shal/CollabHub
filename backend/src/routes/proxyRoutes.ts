import express from "express";
import { executeRequest } from "../controller/proxy.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/", protect, executeRequest);

export default router;