// src/routes/auth.routes.ts
import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

// Ruta para login
router.post('/login', authController.login);

// Ruta para obtener perfil del usuario autenticado
router.get('/profile', verifyToken, authController.getProfile);

export default router;