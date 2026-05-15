import type { Request, Response } from "express"
import RiskSnapshot from "../models/RiskSnapshot"
import { calculateRisk } from "../services/risk.service"

interface AuthRequest extends Request {
  userId?: string
}

export const getTodayRisk = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId
    if (!userId) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" })
      return
    }

    const today = new Date()
    const year = today.getFullYear()
    const month = `${today.getMonth() + 1}`.padStart(2, "0")
    const day = `${today.getDate()}`.padStart(2, "0")
    const dateKey = `${year}-${month}-${day}`

    let snapshot = await RiskSnapshot.findOne({ userId, dateKey })

    if (!snapshot) {
      const risk = await calculateRisk(userId)
      snapshot = await RiskSnapshot.findOneAndUpdate(
        { userId, dateKey },
        {
          userId,
          dateKey,
          riskLevel: risk.level,
          riskScore: risk.score,
          factors: risk.factors,
        },
        { upsert: true, new: true },
      )
    }

    res.status(200).json({
      success: true,
      data: snapshot,
    })
  } catch (err) {
    const error = err as Error
    console.error("[risk] Error getting today risk:", error)
    res.status(500).json({ success: false, message: "Error al obtener riesgo", error: error.message })
  }
}
