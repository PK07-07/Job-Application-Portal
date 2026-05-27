import express from 'express';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { protect, requireRole } from '../middleware/auth.js'; //  Import requireRole

const router = express.Router();

//  Add requireRole('seeker') to ensure only candidates can manage these specific metrics
router.get('/profile', protect, requireRole('seeker'), getProfile);
router.put('/profile', protect, requireRole('seeker'), updateProfile);

export default router;