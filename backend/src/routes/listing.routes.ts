import { Router } from 'express';
import {
  getListings, getListing, createListing, updateListing, deleteListing,
  getMyListings, toggleFavorite, getFavorites, getFeaturedListings,
} from '../controllers/listing.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { upload } from '../services/upload.service';
import { uploadLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.get('/', optionalAuth, getListings);
router.get('/featured', getFeaturedListings);
router.get('/me', authenticate, getMyListings);
router.get('/favorites', authenticate, getFavorites);
router.get('/:slug', optionalAuth, getListing);

router.post('/', authenticate, uploadLimiter, upload.array('images', 10), createListing);
router.put('/:id', authenticate, uploadLimiter, upload.array('images', 10), updateListing);
router.delete('/:id', authenticate, deleteListing);

router.post('/:id/favorite', authenticate, toggleFavorite);

export default router;
