/**
 * File: backend/routes/chatRoutes.js
 * Purpose: Defines the API endpoints and routing logic for chat requests.
 */
import express from 'express';
import { handleChat } from '../controllers/chatController.js';

const router = express.Router();

router.post('/', handleChat);

export default router;
