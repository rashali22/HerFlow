import express from 'express';
import { getInsights } from '../controllers/insightController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Require JWT authentication

router.get('/', getInsights);

export default router;
