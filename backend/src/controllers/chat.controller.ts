import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

export async function getConversations(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: { some: { userId } },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatar: true, isVerified: true } },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { content: true, createdAt: true, senderId: true, type: true },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    const formatted = conversations.map((conv) => {
      const otherParticipants = conv.participants.filter((p) => p.userId !== userId);
      const myParticipant = conv.participants.find((p) => p.userId === userId);
      const unreadCount = 0; // Could be computed separately

      return {
        ...conv,
        otherParticipants: otherParticipants.map((p) => p.user),
        lastMessage: conv.messages[0] || null,
        unreadCount,
        lastReadAt: myParticipant?.lastReadAt,
      };
    });

    res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
}

export async function getOrCreateConversation(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { recipientId, listingId } = req.body;

    if (userId === recipientId) {
      throw new AppError('Cannot create conversation with yourself', 400);
    }

    // Check if conversation already exists between these two users
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: recipientId } } },
          { isGroup: false },
        ],
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          },
        },
      },
    });

    if (existing) {
      return res.json({ success: true, data: existing });
    }

    const conversation = await prisma.conversation.create({
      data: {
        listingId,
        participants: {
          create: [{ userId }, { userId: recipientId }],
        },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          },
        },
      },
    });

    res.status(201).json({ success: true, data: conversation });
  } catch (err) {
    next(err);
  }
}

export async function getMessages(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { conversationId } = req.params;
    const { cursor, limit = '30' } = req.query as Record<string, string>;

    // Verify participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!participant) throw new AppError('Not a participant of this conversation', 403);

    const where: any = { conversationId, isDeleted: false };
    if (cursor) where.createdAt = { lt: new Date(cursor) };

    const messages = await prisma.message.findMany({
      where,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });

    // Mark messages as read
    await prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { lastReadAt: new Date() },
    });

    res.json({
      success: true,
      data: {
        messages: messages.reverse(),
        hasMore: messages.length === parseInt(limit),
        nextCursor: messages.length ? messages[0].createdAt.toISOString() : null,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function sendMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { conversationId } = req.params;
    const { content, type = 'TEXT' } = req.body;

    const participant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!participant) throw new AppError('Not a participant', 403);

    const message = await prisma.message.create({
      data: {
        content,
        type,
        senderId: userId,
        conversationId,
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessage: content, lastMessageAt: new Date() },
    });

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
}
