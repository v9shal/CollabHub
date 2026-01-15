import express from "express";
import {
  createCollection,
  getAllCollections,
  getCollectionById,
  updateCollection,
  deleteCollection,
} from "../controller/collection.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/", protect, createCollection);

router.get("/", protect, getAllCollections);

router.get("/:id", protect, getCollectionById);

router.put("/:id", protect, updateCollection);
router.delete("/:id", protect, deleteCollection);

export default router;