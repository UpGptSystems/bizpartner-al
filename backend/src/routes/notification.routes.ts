import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth.middleware';
import { markNotificationsRead, getUnreadCount } from '../services/notification.service';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const { page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where: { userId } }),
      getUnreadCount(userId),
    ]);

    res.json({
      success: true,
      data: { notifications, total, unreadCount, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
});

router.put('/read', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const { ids } = req.body;
    await markNotificationsRead(userId, ids);
    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (err) {
    next(err);
  }
});

router.get('/unread-count', async (req, res, next) => {
  try {
    const count = await getUnreadCount(req.user!.userId);
    res.json({ success: true, data: { count } });
  } catch (err) {
    next(err);
  }
});

export default router;
