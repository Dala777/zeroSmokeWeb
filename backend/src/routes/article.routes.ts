// src/routes/article.routes.ts
import { Router } from 'express';
import * as articleController from '../controllers/article.controller';
import { verifyToken, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// Rutas públicas
router.get('/', articleController.getAllArticles);
router.get('/:id', articleController.getArticleById);

// Rutas protegidas por autenticación y rol de administrador
router.post('/', [verifyToken, isAdmin], articleController.createArticle);
router.put('/:id', [verifyToken, isAdmin], articleController.updateArticle);
router.delete('/:id', [verifyToken, isAdmin], articleController.deleteArticle);

export default router;