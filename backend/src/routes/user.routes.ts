// src/routes/user.routes.ts
import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { verifyToken, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// Rutas protegidas por autenticación y rol de administrador
router.get('/', [verifyToken, isAdmin], userController.getAllUsers);
router.post('/', [verifyToken, isAdmin], userController.createUser);
router.get('/:id', [verifyToken, isAdmin], userController.getUserById);
router.put('/:id', [verifyToken, isAdmin], userController.updateUser);
router.delete('/:id', [verifyToken, isAdmin], userController.deleteUser);

export default router;