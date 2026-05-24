import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../config/logger';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: parseInt(env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: env.SMTP_FROM || '"BizPartner AL" <noreply@bizpartner.al>',
      ...options,
    });
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw error;
  }
}

export async function sendVerificationEmail(email: string, code: string, firstName: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: 'Verify your email - BizPartner AL',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #6366f1; font-size: 28px; margin: 0;">BizPartner AL</h1>
        </div>
        <h2 style="font-size: 22px; margin-bottom: 16px;">Hello, ${firstName}!</h2>
        <p style="color: #a1a1aa; margin-bottom: 24px;">Please verify your email address using the code below:</p>
        <div style="background: #1a1a2e; border: 1px solid #6366f1; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #6366f1;">${code}</span>
        </div>
        <p style="color: #a1a1aa; font-size: 14px;">This code expires in 15 minutes. If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, code: string, firstName: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: 'Reset your password - BizPartner AL',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #6366f1; font-size: 28px; margin: 0;">BizPartner AL</h1>
        </div>
        <h2 style="font-size: 22px; margin-bottom: 16px;">Password Reset Request</h2>
        <p style="color: #a1a1aa; margin-bottom: 24px;">Hi ${firstName}, use this code to reset your password:</p>
        <div style="background: #1a1a2e; border: 1px solid #ef4444; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #ef4444;">${code}</span>
        </div>
        <p style="color: #a1a1aa; font-size: 14px;">This code expires in 15 minutes.</p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(email: string, firstName: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: 'Welcome to BizPartner AL!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #6366f1; font-size: 28px; margin: 0;">BizPartner AL</h1>
        </div>
        <h2 style="font-size: 22px; margin-bottom: 16px;">Welcome, ${firstName}! 🎉</h2>
        <p style="color: #a1a1aa; margin-bottom: 24px;">Your account has been verified. Start exploring jobs, real estate, and more on BizPartner AL.</p>
        <a href="${env.CLIENT_URL}" style="display: inline-block; background: #6366f1; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">Explore Now</a>
      </div>
    `,
  });
}
