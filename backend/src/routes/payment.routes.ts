import { Router } from 'express';
import {
  getPlans, createCheckoutSession, createPaymentIntent,
  stripeWebhook, getMyPayments, getMySubscription,
} from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';
import express from 'express';

const router = Router();

// Webhook needs raw body
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), stripeWebhook);

router.get('/plans', getPlans);
router.get('/my-payments', authenticate, getMyPayments);
router.get('/my-subscription', authenticate, getMySubscription);
router.post('/checkout', authenticate, createCheckoutSession);
router.post('/payment-intent', authenticate, createPaymentIntent);

export default router;
