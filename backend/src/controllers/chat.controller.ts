import type { Request, Response } from 'express'
import { chatService } from '../services/chat.service'
import ChatMessage from '../models/ChatMessage'

interface AuthRequest extends Request {
  userId?: string
}

const MAX_HISTORY = 20

export const postChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) {
      res.status(401).json({ success: false, message: 'Usuario no autenticado' })
      return
    }

    const { message, history } = req.body

    if (!message || typeof message !== 'string' || message.trim() === '') {
      res.status(400).json({ success: false, message: 'El mensaje es requerido' })
      return
    }

    const userHistory = Array.isArray(history) ? history : []
    const result = await chatService.sendMessage(userId, message.trim(), userHistory)

    await ChatMessage.create({ userId, role: 'user', content: message.trim() })
    await ChatMessage.create({ userId, role: 'assistant', content: result.reply })

    const totalMessages = await ChatMessage.countDocuments({ userId })
    if (totalMessages > MAX_HISTORY * 2) {
      const oldest = await ChatMessage.find({ userId })
        .sort({ createdAt: 1 })
        .limit(totalMessages - MAX_HISTORY * 2)
      const ids = oldest.map((m) => m._id)
      await ChatMessage.deleteMany({ _id: { $in: ids } })
    }

    console.log("[chat] Message saved", { userId })

    res.status(200).json({
      success: true,
      reply: result.reply,
      response: result.reply,
      model: result.model,
      fallback: result.fallback,
    })
  } catch (error: any) {
    console.error('Error en /api/chat:', error)
    res.status(200).json({
      success: true,
      reply: 'No pude conectar con el asistente en este momento, pero estoy aqui para ayudarte. Si tienes un antojo, prueba respirar lento 60 segundos, toma agua y abre una actividad corta del plan.',
      response: 'No pude conectar con el asistente en este momento, pero estoy aqui para ayudarte. Si tienes un antojo, prueba respirar lento 60 segundos, toma agua y abre una actividad corta del plan.',
      fallback: true,
    })
  }
}
