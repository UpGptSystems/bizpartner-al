import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { createNotification } from '../services/notification.service';

export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    const [
      totalUsers, totalListings, totalRevenue, activeListings,
      pendingListings, newUsersThisMonth, recentListings, topCategories,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.listing.count({ where: { status: 'PENDING' } }),
      prisma.user.count({
        where: { createdAt: { gte: new Date(new Date().setDate(1)) } },
      }),
      prisma.listing.findMany({
        where: { status: 'PENDING' },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          category: { select: { name: true } },
        },
      }),
      prisma.category.findMany({
        include: { _count: { select: { listings: true } } },
        orderBy: { listings: { _count: 'desc' } },
        take: 5,
      }),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalListings,
          totalRevenue: totalRevenue._sum.amount || 0,
          activeListings,
          pendingListings,
          newUsersThisMonth,
        },
        recentListings,
        topCategories,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = '1', limit = '20', search, role } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, phone: true, firstName: true, lastName: true,
          avatar: true, role: true, isActive: true, isVerified: true,
          createdAt: true, lastLoginAt: true,
          _count: { select: { listings: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: { users, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateUserStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { isActive, role } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { isActive, role },
      select: { id: true, isActive: true, role: true, email: true, firstName: true },
    });

    res.json({ success: true, message: 'User updated', data: user });
  } catch (err) {
    next(err);
  }
}

export async function getAdminListings(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = '1', limit = '20', status, type } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          category: { select: { name: true } },
          _count: { select: { favorites: true } },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    res.json({
      success: true,
      data: { listings, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } },
    });
  } catch (err) {
    next(err);
  }
}

export async function approveListing(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { isFeatured, isPremium } = req.body;

    const listing = await prisma.listing.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        publishedAt: new Date(),
        isFeatured: isFeatured || false,
        isPremium: isPremium || false,
        rejectedReason: null,
      },
      include: { user: true },
    });

    await createNotification({
      userId: listing.userId,
      type: 'LISTING_APPROVED',
      title: 'Listing Approved!',
      body: `Your listing "${listing.title}" has been approved and is now live.`,
      data: { listingId: listing.id, slug: listing.slug },
    });

    res.json({ success: true, message: 'Listing approved', data: listing });
  } catch (err) {
    next(err);
  }
}

export async function rejectListing(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const listing = await prisma.listing.update({
      where: { id },
      data: { status: 'REJECTED', rejectedReason: reason },
      include: { user: true },
    });

    await createNotification({
      userId: listing.userId,
      type: 'LISTING_REJECTED',
      title: 'Listing Rejected',
      body: `Your listing "${listing.title}" was rejected. Reason: ${reason}`,
      data: { listingId: listing.id },
    });

    res.json({ success: true, message: 'Listing rejected', data: listing });
  } catch (err) {
    next(err);
  }
}

export async function getAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to } = req.query as Record<string, string>;
    const startDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = to ? new Date(to) : new Date();

    const [events, revenueByDay, userGrowth] = await Promise.all([
      prisma.analyticsEvent.groupBy({
        by: ['event'],
        _count: { event: true },
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      prisma.payment.groupBy({
        by: ['createdAt'],
        _sum: { amount: true },
        where: { status: 'COMPLETED', createdAt: { gte: startDate, lte: endDate } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.user.groupBy({
        by: ['createdAt'],
        _count: { id: true },
        where: { createdAt: { gte: startDate, lte: endDate } },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    res.json({
      success: true,
      data: { events, revenueByDay, userGrowth },
    });
  } catch (err) {
    next(err);
  }
}
