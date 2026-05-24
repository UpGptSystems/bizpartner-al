import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyAccessToken } from '../services/jwt.service';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { env } from '../config/env';

let io: SocketIOServer;

export function getIO(): SocketIOServer {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

export function initializeSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Auth middleware
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication required'));

      const payload = verifyAccessToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, firstName: true, lastName: true, avatar: true, role: true, isActive: true },
      });

      if (!user || !user.isActive) return next(new Error('User not found'));

      (socket as any).user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    logger.info(`Socket connected: ${user.id} (${socket.id})`);

    // Join personal room
    socket.join(`user:${user.id}`);

    socket.on('join:conversation', async (conversationId: string) => {
      try {
        const participant = await prisma.conversationParticipant.findUnique({
          where: { conversationId_userId: { conversationId, userId: user.id } },
        });
        if (participant) {
          socket.join(`conversation:${conversationId}`);
          socket.emit('joined:conversation', conversationId);
        }
      } catch (err) {
        logger.error('Join conversation error:', err);
      }
    });

    socket.on('leave:conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('message:send', async (data: { conversationId: string; content: string; type?: string }) => {
      try {
        const { conversationId, content, type = 'TEXT' } = data;

        const participant = await prisma.conversationParticipant.findUnique({
          where: { conversationId_userId: { conversationId, userId: user.id } },
        });
        if (!participant) return;

        const message = await prisma.message.create({
          data: { content, type, senderId: user.id, conversationId },
          include: {
            sender: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          },
        });

        await prisma.conversation.update({
          where: { id: conversationId },
          data: { lastMessage: content, lastMessageAt: new Date() },
        });

        io.to(`conversation:${conversationId}`).emit('message:new', message);
      } catch (err) {
        logger.error('Send message error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing:start', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('typing:start', { userId: user.id, conversationId });
    });

    socket.on('typing:stop', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('typing:stop', { userId: user.id, conversationId });
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${user.id}`);
    });
  });

  logger.info('✅ Socket.io initialized');
  return io;
}
