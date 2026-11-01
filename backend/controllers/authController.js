import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
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

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  setRefreshTokenCookie(res, refreshToken);

  res.status(statusCode).json({
    success: true,
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isMfaEnabled: user.isMfaEnabled,
      ...(user.role === 'employer'
        ? { companyName: user.companyName, companyWebsite: user.companyWebsite }
        : { bio: user.bio, skills: user.skills, resume: user.resume }),
    },
  });
};

// ── POST /api/auth/register ────────────────────────────
export const register = async (req, res) => {
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
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, errors: messages });
    }
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// ── POST /api/auth/login (with Multi-Factor Authentication TOTP support) ─
export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password, role, totpCode } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password +mfaSecret');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

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

    // ── MFA Verification Check ─────────────────────────────
    if (user.isMfaEnabled) {
      if (!totpCode) {
        return res.status(200).json({
          success: false,
          mfaRequired: true,
          message: 'Multi-factor authentication code required. Please enter 6-digit TOTP code from Google or Microsoft Authenticator.',
        });
      }

      // Verify the 6-digit TOTP token against stored secret
      const verified = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: totpCode,
        window: 1, // Allow 30-sec clock drift
      });

      if (!verified) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired multi-factor authentication code. Please try again.',
        });
      }
    }

    await sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// ── POST /api/auth/mfa/setup (Generate QR code & TOTP Secret) ─
export const setupMfa = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+mfaSecret');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Generate RFC 6238 TOTP Secret
    const secret = speakeasy.generateSecret({
      name: `JobPortal (${user.email})`,
      issuer: 'Job Application Portal',
    });

    user.mfaSecret = secret.base32;
    await user.save({ validateBeforeSave: false });

    // Generate QR Code data URL
    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      message: 'MFA setup initiated. Scan the QR code or enter manual secret in Google/Microsoft Authenticator.',
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
    });
  } catch (err) {
    console.error('MFA setup error:', err);
    res.status(500).json({ success: false, message: 'Failed to initiate MFA setup' });
  }
};

// ── POST /api/auth/mfa/verify (Activate MFA after user verifies first code) ─
export const verifyAndEnableMfa = async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: 'TOTP 6-digit code is required' });
  }

  try {
    const user = await User.findById(req.user._id).select('+mfaSecret');
    if (!user || !user.mfaSecret) {
      return res.status(400).json({ success: false, message: 'MFA not initiated. Call /mfa/setup first.' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ success: false, message: 'Invalid verification code. Could not activate MFA.' });
    }

    user.isMfaEnabled = true;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Multi-factor authentication (TOTP) successfully activated for your account!',
    });
  } catch (err) {
    console.error('MFA verify error:', err);
    res.status(500).json({ success: false, message: 'Failed to verify MFA' });
  }
};

// ── POST /api/auth/refresh ─────────────────────────────
export const refreshAccessToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ success: false, message: 'No refresh token' });

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      clearRefreshTokenCookie(res);
      return res.status(403).json({ success: false, message: 'Refresh token invalid or reused' });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });
    setRefreshTokenCookie(res, newRefreshToken);

    res.json({ success: true, accessToken: newAccessToken });
  } catch (err) {
    clearRefreshTokenCookie(res);
    res.status(403).json({ success: false, message: 'Invalid refresh token' });
  }
};

// ── POST /api/auth/logout ──────────────────────────────
export const logout = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    await User.findOneAndUpdate({ refreshToken: token }, { refreshToken: null }, { new: false });
  }
  clearRefreshTokenCookie(res);
  res.json({ success: true, message: 'Logged out successfully' });
};

// ── GET /api/auth/me ───────────────────────────────────
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user: user.profile });
};
