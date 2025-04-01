import express from 'express';
import {
  getAllFAQs,
  getFAQById,
  createFAQ,
  updateFAQ,
  deleteFAQ
} from '../controllers/faq.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Rutas públicas
router.get('/', getAllFAQs);
router.get('/:id', getFAQById);

// Rutas protegidas (solo admin)
router.post('/', authMiddleware, createFAQ);
router.put('/:id', authMiddleware, updateFAQ);
router.delete('/:id', authMiddleware, deleteFAQ);

export default router;