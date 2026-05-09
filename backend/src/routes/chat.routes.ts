import express from 'express'
import { postChat } from '../controllers/chat.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = express.Router()

// Endpoint de chat con Groq
router.post('/', authMiddleware, postChat)

router.all('/', (_req, res) => {
  res.status(405).json({
    success: false,
    message: 'Método no permitido. Usa POST /api/chat con { message }.',
  })
})

export default router
