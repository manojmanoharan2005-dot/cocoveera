import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import {
  getMyNotifications,
  markNotificationRead,
  createNotification,
  deleteNotification,
  getAllNotificationsAdmin,
} from '../controllers/notificationController.js';

const router = express.Router();

router.route('/').post(protect, admin, createNotification).get(protect, admin, getAllNotificationsAdmin);
router.route('/me').get(protect, getMyNotifications);
router.route('/:id/read').patch(protect, markNotificationRead);
router.route('/:id').delete(protect, admin, deleteNotification);

export default router;
