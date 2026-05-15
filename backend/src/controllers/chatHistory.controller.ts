import type { Request, Response } from "express"
import ChatMessage from "../models/ChatMessage"

interface AuthRequest extends Request {
  userId?: string
}

export const getChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId
    if (!userId) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" })
      return
    }

    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100)

    const messages = await ChatMessage.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)

    const history = messages
      .reverse()
      .map((m) => ({ role: m.role, text: m.content }))

    res.status(200).json({ success: true, data: history })
  } catch (err) {
    const error = err as Error
    console.error("[chat/history] Error getting history:", error)
    res.status(500).json({ success: false, message: "Error al obtener historial", error: error.message })
  }
}

export const deleteChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId
    if (!userId) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" })
      return
    }

    await ChatMessage.deleteMany({ userId })

    console.log("[chat/history] History deleted", { userId })

    res.status(200).json({ success: true, message: "Historial eliminado" })
  } catch (err) {
    const error = err as Error
    console.error("[chat/history] Error deleting history:", error)
    res.status(500).json({ success: false, message: "Error al eliminar historial", error: error.message })
  }
}
