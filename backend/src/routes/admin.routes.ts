import { Router } from 'express';
import {
  getDashboardStats, getUsers, updateUserStatus,
  getAdminListings, approveListing, rejectListing, getAnalytics,
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN'));

router.get('/stats', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.get('/listings', getAdminListings);
router.put('/listings/:id/approve', approveListing);
router.put('/listings/:id/reject', rejectListing);

export default router;
