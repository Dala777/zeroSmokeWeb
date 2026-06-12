import express from 'express';
import {
  getAllArticles,
  getPublishedArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle
} from '../controllers/article.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Rutas públicas
router.get('/published', getPublishedArticles);
router.get('/', getAllArticles);
router.get('/:id', getArticleById);

// Rutas protegidas
router.post('/', authMiddleware, createArticle);
router.put('/:id', authMiddleware, updateArticle);
router.delete('/:id', authMiddleware, deleteArticle);

export default router;
