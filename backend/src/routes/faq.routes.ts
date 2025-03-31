// src/routes/faq.routes.ts
import { Router } from 'express';
import * as faqController from '../controllers/faq.controller';
import { verifyToken, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// Rutas públicas
router.get('/', faqController.getAllFaqs);
router.get('/:id', faqController.getFaqById);

// Rutas protegidas por autenticación y rol de administrador
router.post('/', [verifyToken, isAdmin], faqController.createFaq);
router.put('/:id', [verifyToken, isAdmin], faqController.updateFaq);
router.delete('/:id', [verifyToken, isAdmin], faqController.deleteFaq);

export default router;