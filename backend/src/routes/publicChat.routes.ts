import express from 'express'
import { postPublicChat } from '../controllers/publicChat.controller'

const router = express.Router()

router.post('/', postPublicChat)

router.all('/', (_req, res) => {
  res.status(405).json({
    success: false,
    message: 'Método no permitido. Usa POST /api/chat/public con { message }.',
  })
})

export default router
