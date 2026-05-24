import { prisma } from '../config/database';
import { NotificationType } from '@prisma/client';
import { getIO } from '../socket/socket';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export async function createNotification(params: CreateNotificationParams) {
  const notification = await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      data: (params.data || {}) as any,
    },
  });

  // Emit via socket
  try {
    const io = getIO();
    io.to(`user:${params.userId}`).emit('notification', notification);
  } catch (_) {}

  return notification;
}

export async function markNotificationsRead(userId: string, notificationIds?: string[]) {
  const where = notificationIds
    ? { userId, id: { in: notificationIds } }
    : { userId, isRead: false };

  await prisma.notification.updateMany({ where, data: { isRead: true } });
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, isRead: false } });
}
