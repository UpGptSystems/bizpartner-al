import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { AppError } from '../middleware/error.middleware';
import { createNotification } from '../services/notification.service';

const stripe = new Stripe(env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' as any });

export async function getPlans(req: Request, res: Response, next: NextFunction) {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
    res.json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
}

export async function createCheckoutSession(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { planId } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan?.stripePriceId) throw new AppError('Plan not found', 404);

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: `${user.firstName} ${user.lastName}`,
        metadata: { userId },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${env.CLIENT_URL}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.CLIENT_URL}/pricing?payment=canceled`,
      metadata: { userId, planId },
    });

    res.json({ success: true, data: { sessionId: session.id, url: session.url } });
  } catch (err) {
    next(err);
  }
}

export async function createPaymentIntent(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { amount, currency = 'usd', description } = req.body;

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: { userId, description },
    });

    res.json({
      success: true,
      data: { clientSecret: intent.client_secret, paymentIntentId: intent.id },
    });
  } catch (err) {
    next(err);
  }
}

export async function stripeWebhook(req: Request, res: Response, next: NextFunction) {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET || '');
  } catch {
    return res.status(400).send('Webhook signature verification failed');
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, planId } = session.metadata!;

        const plan = await prisma.plan.findUnique({ where: { id: planId } });
        if (!plan) break;

        const now = new Date();
        const end = new Date(now);
        end.setMonth(end.getMonth() + 1);

        await prisma.subscription.create({
          data: {
            userId,
            planId,
            stripeSubscriptionId: session.subscription as string,
            status: 'ACTIVE',
            currentPeriodStart: now,
            currentPeriodEnd: end,
          },
        });

        await prisma.payment.create({
          data: {
            userId,
            amount: (session.amount_total || 0) / 100,
            currency: session.currency?.toUpperCase() || 'USD',
            status: 'COMPLETED',
            provider: 'STRIPE',
            providerPaymentId: session.payment_intent as string,
            description: `Subscription: ${plan.name}`,
          },
        });

        await createNotification({
          userId,
          type: 'PAYMENT_SUCCESS',
          title: 'Payment Successful',
          body: `Your ${plan.name} subscription is now active!`,
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { status: 'EXPIRED', canceledAt: new Date() },
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const sub = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: invoice.subscription as string },
        });
        if (sub) {
          await createNotification({
            userId: sub.userId,
            type: 'PAYMENT_FAILED',
            title: 'Payment Failed',
            body: 'Your subscription payment failed. Please update your payment method.',
          });
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
}

export async function getMyPayments(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: payments });
  } catch (err) {
    next(err);
  }
}

export async function getMySubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: subscription });
  } catch (err) {
    next(err);
  }
}
