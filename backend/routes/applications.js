import express from 'express';
import { applyForJob, getMyApplications, getJobApplicants ,updateApplicationStatus,deleteApplication} from '../controllers/applicationController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

// ── Seeker Routes ──────────────────────────────────────
router.post('/:jobId', protect, requireRole('seeker'), applyForJob);
router.get('/me', protect, requireRole('seeker'), getMyApplications);

router.delete('/:id', protect,requireRole('seeker'), deleteApplication);

// ── Employer Routes ────────────────────────────────────
router.get('/job/:jobId', protect, requireRole('employer'), getJobApplicants);
router.patch('/:id/status', protect, requireRole('employer'), updateApplicationStatus);

export default router;