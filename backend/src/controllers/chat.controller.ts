import type { Request, Response } from 'express'
import { geminiService } from '../services/gemini.service'

export const postChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body

    if (!message || typeof message !== 'string' || message.trim() === '') {
      res.status(400).json({ success: false, message: 'El mensaje es requerido' })
      return
    }

    const userHistory = Array.isArray(history) ? history : []

    // Llamar a Gemini
    const geminiResult = await geminiService.sendMessage({ message, history: userHistory })

    res.status(200).json({
      success: true,
      response: geminiResult.text,
      model: process.env.GEMINI_MODEL || 'gpt-4o-mini',
      meta: geminiResult.rawResponse,
    })
  } catch (error: any) {
    console.error('Error en /api/chat:', error)
    res.status(500).json({
      success: false,
      message: 'Error generando respuesta de IA',
      details: error?.message || 'sin details',
    })
  }
}
