// src/routes/message.routes.ts
import { Router } from 'express';
import * as messageController from '../controllers/message.controller';
import { verifyToken, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// Ruta pública para crear mensajes (formulario de contacto)
router.post('/', messageController.createMessage);

// Rutas protegidas por autenticación y rol de administrador
router.get('/', [verifyToken, isAdmin], messageController.getAllMessages);
router.get('/:id', [verifyToken, isAdmin], messageController.getMessageById);
router.put('/:id', [verifyToken, isAdmin], messageController.updateMessage);
router.post('/:id/respond', [verifyToken, isAdmin], messageController.respondToMessage);
router.delete('/:id', [verifyToken, isAdmin], messageController.deleteMessage);

export default router;