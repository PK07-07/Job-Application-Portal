import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from '../utils/tokenUtils.js';

// ── Helper: send tokens in response ───────────────────
const sendTokenResponse = async (user, statusCode, res) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Persist hashed refresh token in DB
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Send refresh token as HttpOnly cookie
  setRefreshTokenCookie(res, refreshToken);

  res.status(statusCode).json({
    success: true,
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      ...(user.role === 'employer'
        ? { companyName: user.companyName, companyWebsite: user.companyWebsite }
        : { bio: user.bio, skills: user.skills, resume: user.resume }),
    },
  });
};

// ── POST /api/auth/register ────────────────────────────
export const register = async (req, res) => {
  // express-validator errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, password, role, companyName, companyWebsite, companySize } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const userData = { name, email, password, role };
    if (role === 'employer') {
      userData.companyName = companyName;
      userData.companyWebsite = companyWebsite;
      userData.companySize = companySize;
    }

    const user = await User.create(userData);
    await sendTokenResponse(user, 201, res);
  } catch (err) {
    // Mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, errors: messages });
    }
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// ── POST /api/auth/login ───────────────────────────────
export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password, role } = req.body;

  try {
    // Explicitly select password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Role mismatch (employer trying to log in on seeker portal, etc.)
    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `This account is registered as a ${user.role}. Please use the correct login portal.`,
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated' });
    }

    await sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// ── POST /api/auth/refresh ─────────────────────────────
export const refreshAccessToken = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ success: false, message: 'No refresh token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    // Find user and verify the stored refresh token matches
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      clearRefreshTokenCookie(res);
      return res.status(403).json({ success: false, message: 'Refresh token invalid or reused' });
    }

    // Issue new pair (token rotation)
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });
    setRefreshTokenCookie(res, newRefreshToken);

    res.json({ success: true, accessToken: newAccessToken });
  } catch (err) {
    clearRefreshTokenCookie(res);
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ success: false, message: 'Refresh token expired, please login again' });
    }
    res.status(403).json({ success: false, message: 'Invalid refresh token' });
  }
};

// ── POST /api/auth/logout ──────────────────────────────
export const logout = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    // Invalidate stored token
    await User.findOneAndUpdate(
      { refreshToken: token },
      { refreshToken: null },
      { new: false }
    );
  }

  clearRefreshTokenCookie(res);
  res.json({ success: true, message: 'Logged out successfully' });
};

// ── GET /api/auth/me ───────────────────────────────────
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user: user.profile });
};