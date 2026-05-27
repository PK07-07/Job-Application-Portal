import express from 'express';
import { body } from 'express-validator';
import { createJob, getJobs, getMyJobs, updateJob, deleteJob } from '../controllers/jobController.js'; 
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

// ── Validation rules for creating a job ────────────────
const jobValidation = [
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('description').trim().isLength({ min: 50 }).withMessage('Description must be at least 50 characters'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('locationType').isIn(['remote', 'onsite', 'hybrid']).withMessage('Invalid location type'),
  body('jobType').isIn(['full-time', 'part-time', 'contract', 'internship', 'freelance']).withMessage('Invalid job type'),
  body('experienceLevel').isIn(['entry', 'mid', 'senior', 'lead', 'executive']).withMessage('Invalid experience level'),
  body('salaryMin').optional().isNumeric().withMessage('Minimum salary must be a number'),
  body('salaryMax').optional().isNumeric().withMessage('Maximum salary must be a number'),
];

// ── Static Routes ──────────────────────────────────────

// 1. Private Employer Route: Get only the jobs posted by the logged-in user
router.get('/me', protect, requireRole('employer'), getMyJobs);

// 2. Public route: Anyone can view open jobs (used by Seekers)
router.get('/', getJobs);

// 3. Protected route: Only logged-in employers can post jobs
router.post(
  '/',
  protect,                   // Must be logged in
  requireRole('employer'),   // Must be an employer
  jobValidation,             // Data validation
  createJob                  // Save to database
);


// ── Dynamic Routes (MUST BE AT THE BOTTOM) ─────────────

// 4. Update and Delete specific jobs by ID
router.put('/:id', protect, requireRole('employer'), updateJob);
router.delete('/:id', protect, requireRole('employer'), deleteJob);

export default router;