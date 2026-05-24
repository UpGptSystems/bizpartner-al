import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import {
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  validateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
} from '../services/jwt.service';
import { createOtp, verifyOtp } from '../services/otp.service';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from '../services/email.service';
import { AppError } from '../middleware/error.middleware';

function tokenResponse(user: any, accessToken: string, refreshToken: string) {
  return {
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
    },
    accessToken,
    refreshToken,
  };
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (existing) {
      throw new AppError('Email or phone already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: 'VIEWER',
      },
    });

    if (email) {
      const code = await createOtp(user.id, 'EMAIL_VERIFY');
      await sendVerificationEmail(email, code, firstName);
    }

    const accessToken = generateAccessToken({ userId: user.id, role: user.role, email: user.email || '' });
    const refreshToken = generateRefreshToken();
    await saveRefreshToken(user.id, refreshToken);

    res.status(201).json({
      success: true,
      message: 'Account created. Please verify your email.',
      data: tokenResponse(user, accessToken, refreshToken),
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account has been suspended', 403);
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new AppError('Invalid credentials', 401);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const accessToken = generateAccessToken({ userId: user.id, role: user.role, email: user.email || '' });
    const refreshToken = generateRefreshToken();
    await saveRefreshToken(user.id, refreshToken);

    res.json({
      success: true,
      message: 'Login successful',
      data: tokenResponse(user, accessToken, refreshToken),
    });
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken: token } = req.body;
    if (!token) throw new AppError('Refresh token required', 400);

    const stored = await validateRefreshToken(token);
    if (!stored) throw new AppError('Invalid or expired refresh token', 401);

    await revokeRefreshToken(token);

    const accessToken = generateAccessToken({
      userId: stored.user.id,
      role: stored.user.role,
      email: stored.user.email || '',
    });
    const newRefreshToken = generateRefreshToken();
    await saveRefreshToken(stored.user.id, newRefreshToken);

    res.json({
      success: true,
      data: { accessToken, refreshToken: newRefreshToken },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken: token } = req.body;
    if (token) await revokeRefreshToken(token);

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { code } = req.body;
    const userId = req.user!.userId;

    const isValid = await verifyOtp(userId, code, 'EMAIL_VERIFY');
    if (!isValid) throw new AppError('Invalid or expired verification code', 400);

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true, isVerified: true },
    });

    await sendWelcomeEmail(user.email!, user.firstName);

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    next(err);
  }
}

export async function sendEmailOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.email) throw new AppError('No email on file', 400);

    const code = await createOtp(userId, 'EMAIL_VERIFY');
    await sendVerificationEmail(user.email, code, user.firstName);

    res.json({ success: true, message: 'Verification code sent' });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    // Return same message regardless to prevent email enumeration
    if (user) {
      const code = await createOtp(user.id, 'PASSWORD_RESET');
      await sendPasswordResetEmail(email, code, user.firstName);
    }

    res.json({ success: true, message: 'If the email exists, a reset code has been sent' });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, code, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError('Invalid request', 400);

    const isValid = await verifyOtp(user.id, code, 'PASSWORD_RESET');
    if (!isValid) throw new AppError('Invalid or expired reset code', 400);

    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    await revokeAllUserTokens(user.id);

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true, email: true, phone: true, firstName: true, lastName: true,
        avatar: true, role: true, isEmailVerified: true, isPhoneVerified: true,
        isVerified: true, bio: true, website: true, company: true, location: true,
        createdAt: true,
        _count: {
          select: { listings: true, favorites: true, reviews: true },
        },
      },
    });

    if (!user) throw new AppError('User not found', 404);

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const { firstName, lastName, bio, website, company, location, phone } = req.body;
    const userId = req.user!.userId;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName, bio, website, company, location, phone },
      select: {
        id: true, email: true, phone: true, firstName: true, lastName: true,
        avatar: true, role: true, bio: true, website: true, company: true, location: true,
      },
    });

    res.json({ success: true, message: 'Profile updated', data: user });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.password) throw new AppError('No password set', 400);

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new AppError('Current password is incorrect', 400);

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    await revokeAllUserTokens(userId);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
}
