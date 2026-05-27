import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  refreshAccessToken,
  logout,
  getMe,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// ── Validation rules ───────────────────────────────────
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 60 }).withMessage('Name must be 2–60 characters'),

  body('email')
    .trim()
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),

  body('role')
    .isIn(['seeker', 'employer']).withMessage('Role must be seeker or employer'),

  // Employer-only validations
  body('companyName')
    .if(body('role').equals('employer'))
    .notEmpty().withMessage('Company name is required for employers')
    .isLength({ max: 100 }).withMessage('Company name cannot exceed 100 characters'),

  body('companyWebsite')
    .optional({ checkFalsy: true })
    .isURL().withMessage('Company website must be a valid URL'),
];

const loginValidation = [
  body('email')
    .trim()
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),

  body('role')
    .isIn(['seeker', 'employer']).withMessage('Role must be seeker or employer'),
];

// ── Routes ─────────────────────────────────────────────
router.post('/register', registerValidation, register);
router.post('/login',    loginValidation,    login);
router.post('/refresh',  refreshAccessToken);
router.post('/logout',   logout);
router.get('/me',        protect, getMe);

export default router;