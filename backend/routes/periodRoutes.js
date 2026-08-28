import express from 'express';
import {
  getPeriods,
  getPeriodById,
  createPeriod,
  updatePeriod,
  deletePeriod,
} from '../controllers/periodController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All period routes require JWT authentication

router.route('/').get(getPeriods).post(createPeriod);
router.route('/:id').get(getPeriodById).put(updatePeriod).delete(deletePeriod);

export default router;
