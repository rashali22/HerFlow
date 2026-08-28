import express from 'express';
import {
  getFlows,
  createOrUpdateFlow,
  updateFlow,
  deleteFlow,
} from '../controllers/flowController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All flow routes require JWT authentication

router.route('/').get(getFlows).post(createOrUpdateFlow);
router.route('/:id').put(updateFlow).delete(deleteFlow);

export default router;
