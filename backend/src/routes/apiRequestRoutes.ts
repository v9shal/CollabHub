import express from 'express';
import {createRequest,getRequest,updateRequest,deleteReq} from '../controller/request.js'
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/api/collections/:collectionId/requests", protect, createRequest);
router.get("/api/collections/:collectionId/requests",protect,getRequest);
router.put("/api/requests/:requestId",protect,updateRequest);
router.delete("/api/requests/:requestId",deleteReq)

export default router;