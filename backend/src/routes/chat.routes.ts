import express from 'express'
import { postChat } from '../controllers/chat.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = express.Router()

// Endpoint de chat con Gemini, se puede proteger con authMiddleware
router.post('/', authMiddleware, postChat)

export default router
