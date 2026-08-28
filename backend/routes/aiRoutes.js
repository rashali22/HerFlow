import express from 'express';
import { chat } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Require JWT authentication

router.post('/chat', chat);

export default router;
