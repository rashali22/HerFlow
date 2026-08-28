import express from 'express';
import { getNextPeriodPrediction } from '../controllers/predictionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Require JWT authentication

router.get('/next-period', getNextPeriodPrediction);

export default router;
