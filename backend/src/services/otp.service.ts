import { prisma } from '../config/database';
import crypto from 'crypto';

export function generateOtpCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function createOtp(userId: string, type: string): Promise<string> {
  // Invalidate previous OTPs of same type
  await prisma.otpCode.updateMany({
    where: { userId, type, used: false },
    data: { used: true },
  });

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await prisma.otpCode.create({
    data: { code, userId, type, expiresAt },
  });

  return code;
}

export async function verifyOtp(userId: string, code: string, type: string): Promise<boolean> {
  const otp = await prisma.otpCode.findFirst({
    where: {
      userId,
      code,
      type,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!otp) return false;

  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { used: true },
  });

  return true;
}
