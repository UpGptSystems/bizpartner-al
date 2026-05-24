import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { uploadMultipleImages } from '../services/upload.service';
import { createNotification } from '../services/notification.service';
import slugify from 'slugify';

function generateSlug(title: string): string {
  return slugify(title, { lower: true, strict: true }) + '-' + Date.now();
}

export async function getListings(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      type, category, city, minPrice, maxPrice, search,
      page = '1', limit = '20', sortBy = 'createdAt', sortOrder = 'desc',
      featured, premium, jobType, propertyType, deal,
    } = req.query as Record<string, string>;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where: any = { status: 'ACTIVE' };

    if (type) where.type = type;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (featured === 'true') where.isFeatured = true;
    if (premium === 'true') where.isPremium = true;
    if (category) where.category = { slug: category };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search.toLowerCase() } },
      ];
    }
    if (jobType && where.type === 'JOB') {
      where.jobDetails = { jobType };
    }
    if (propertyType && where.type === 'REAL_ESTATE') {
      where.propertyDetails = { propertyType };
    }
    if (deal && where.type === 'REAL_ESTATE') {
      where.propertyDetails = { ...where.propertyDetails, deal };
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: { select: { id: true, name: true, slug: true, icon: true } },
          user: { select: { id: true, firstName: true, lastName: true, avatar: true, isVerified: true } },
          jobDetails: true,
          propertyDetails: true,
          _count: { select: { favorites: true } },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        listings,
        pagination: {
          page: parseInt(page),
          limit: take,
          total,
          pages: Math.ceil(total / take),
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getListing(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;

    const listing = await prisma.listing.findUnique({
      where: { slug },
      include: {
        category: true,
        user: {
          select: {
            id: true, firstName: true, lastName: true, avatar: true,
            isVerified: true, company: true, phone: true, email: true,
            createdAt: true,
            _count: { select: { listings: true, receivedReviews: true } },
          },
        },
        jobDetails: true,
        propertyDetails: true,
        _count: { select: { favorites: true, applications: true } },
      },
    });

    if (!listing) throw new AppError('Listing not found', 404);
    if (listing.status !== 'ACTIVE' && listing.userId !== req.user?.userId) {
      throw new AppError('Listing not available', 404);
    }

    // Increment view count
    await prisma.listing.update({
      where: { id: listing.id },
      data: { views: { increment: 1 } },
    });

    // Track analytics
    if (req.user?.userId) {
      await prisma.analyticsEvent.create({
        data: {
          event: 'VIEW',
          listingId: listing.id,
          userId: req.user.userId,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
        },
      }).catch(() => {});
    }

    res.json({ success: true, data: listing });
  } catch (err) {
    next(err);
  }
}

export async function createListing(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const {
      title, description, type, categoryId, price, priceUnit, currency,
      location, city, country, tags, jobDetails, propertyDetails,
    } = req.body;

    const files = req.files as Express.Multer.File[];
    let images: string[] = [];
    if (files?.length) {
      images = await uploadMultipleImages(files, 'listings');
    }

    const slug = generateSlug(title);

    const listing = await prisma.listing.create({
      data: {
        title,
        slug,
        description,
        type,
        categoryId,
        userId,
        price: price ? parseFloat(price) : null,
        priceUnit,
        currency: currency || 'USD',
        location,
        city,
        country: country || 'Albania',
        tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
        images,
        status: 'PENDING',
        jobDetails: jobDetails ? {
          create: typeof jobDetails === 'string' ? JSON.parse(jobDetails) : jobDetails,
        } : undefined,
        propertyDetails: propertyDetails ? {
          create: typeof propertyDetails === 'string' ? JSON.parse(propertyDetails) : propertyDetails,
        } : undefined,
      },
      include: {
        category: true,
        jobDetails: true,
        propertyDetails: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Listing created and pending review',
      data: listing,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateListing(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { title, description, price, priceUnit, location, city, tags, jobDetails, propertyDetails } = req.body;

    const existing = await prisma.listing.findUnique({ where: { id } });
    if (!existing) throw new AppError('Listing not found', 404);
    if (existing.userId !== userId && !['ADMIN', 'SUPER_ADMIN'].includes(req.user!.role)) {
      throw new AppError('Forbidden', 403);
    }

    const files = req.files as Express.Multer.File[];
    let newImages: string[] = [];
    if (files?.length) {
      newImages = await uploadMultipleImages(files, 'listings');
    }

    const listing = await prisma.listing.update({
      where: { id },
      data: {
        title,
        description,
        price: price ? parseFloat(price) : undefined,
        priceUnit,
        location,
        city,
        tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : undefined,
        images: newImages.length ? [...existing.images, ...newImages] : undefined,
        status: 'PENDING',
        jobDetails: jobDetails ? { update: typeof jobDetails === 'string' ? JSON.parse(jobDetails) : jobDetails } : undefined,
        propertyDetails: propertyDetails ? { update: typeof propertyDetails === 'string' ? JSON.parse(propertyDetails) : propertyDetails } : undefined,
      },
      include: { category: true, jobDetails: true, propertyDetails: true },
    });

    res.json({ success: true, message: 'Listing updated', data: listing });
  } catch (err) {
    next(err);
  }
}

export async function deleteListing(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new AppError('Listing not found', 404);
    if (listing.userId !== userId && !['ADMIN', 'SUPER_ADMIN'].includes(req.user!.role)) {
      throw new AppError('Forbidden', 403);
    }

    await prisma.listing.delete({ where: { id } });
    res.json({ success: true, message: 'Listing deleted' });
  } catch (err) {
    next(err);
  }
}

export async function getMyListings(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { page = '1', limit = '20', status } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = { userId };
    if (status) where.status = status;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { name: true, slug: true } },
          _count: { select: { favorites: true, applications: true } },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        listings,
        pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function toggleFavorite(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const existing = await prisma.favorite.findUnique({
      where: { userId_listingId: { userId, listingId: id } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return res.json({ success: true, message: 'Removed from favorites', isFavorited: false });
    }

    await prisma.favorite.create({ data: { userId, listingId: id } });
    res.json({ success: true, message: 'Added to favorites', isFavorited: true });
  } catch (err) {
    next(err);
  }
}

export async function getFavorites(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        listing: {
          include: {
            category: { select: { name: true, slug: true, icon: true } },
            user: { select: { firstName: true, lastName: true, isVerified: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: favorites.map((f) => f.listing) });
  } catch (err) {
    next(err);
  }
}

export async function getFeaturedListings(req: Request, res: Response, next: NextFunction) {
  try {
    const listings = await prisma.listing.findMany({
      where: { status: 'ACTIVE', isFeatured: true },
      take: 12,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true, slug: true, icon: true } },
        user: { select: { firstName: true, lastName: true, avatar: true, isVerified: true } },
        _count: { select: { favorites: true } },
      },
    });

    res.json({ success: true, data: listings });
  } catch (err) {
    next(err);
  }
}
