import { Router } from 'express';
import {
  register, login, logout, refreshToken, verifyEmail, sendEmailOtp,
  forgotPassword, resetPassword, getMe, updateProfile, changePassword,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authLimiter, otpLimiter } from '../middleware/rateLimit.middleware';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';

const router = Router();

const registerSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    email: z.string().email().optional(),
    phone: z.string().min(8).max(15).optional(),
    password: z.string().min(8),
  }).refine((d) => d.email || d.phone, { message: 'Email or phone required' }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

const passwordSchema = z.object({
  body: z.object({ password: z.string().min(8) }),
});

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.post('/verify-email', authenticate, otpLimiter, verifyEmail);
router.post('/send-email-otp', authenticate, otpLimiter, sendEmailOtp);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

export default router;
