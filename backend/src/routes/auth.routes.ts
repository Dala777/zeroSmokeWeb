import express from 'express';
import { login, getProfile, register } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Rutas públicas
router.post('/login', login);
router.post('/register', register); // Solo para desarrollo

// Rutas protegidas
router.get('/profile', authMiddleware, getProfile);

export default router;