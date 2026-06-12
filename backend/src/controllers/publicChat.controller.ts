import type { Request, Response } from 'express'
import { publicChatService } from '../services/publicChat.service'

export const postPublicChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body

    if (!message || typeof message !== 'string' || message.trim() === '') {
      res.status(400).json({ success: false, message: 'El mensaje es requerido' })
      return
    }

    const userHistory = Array.isArray(history) ? history : []
    const result = await publicChatService.sendMessage(message.trim(), userHistory)

    res.status(200).json({
      success: true,
      reply: result.reply,
      model: result.model,
      fallback: result.fallback,
    })
  } catch (error: any) {
    console.error('Error en /api/chat/public:', error)
    res.status(200).json({
      success: true,
      reply: 'Lo siento, no pude conectar con el asistente en este momento. Por favor, intenta de nuevo mas tarde. Mientras tanto, te recomiendo visitar nuestra seccion de preguntas frecuentes o realizar nuestro test de dependencia.',
      fallback: true,
    })
  }
}
