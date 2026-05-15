import type { Request, Response } from "express"
import RewardUnlock from "../models/RewardUnlock"
import UserGamification from "../models/UserGamification"

interface AuthRequest extends Request {
  userId?: string
}

const REWARDS_CATALOG: Record<string, { title: string; cost: number; description: string }> = {
  avatar_premium: {
    title: "Avatar Premium",
    cost: 100,
    description: "Desbloquea un avatar exclusivo para tu perfil.",
  },
  tema_naturaleza: {
    title: "Tema Naturaleza",
    cost: 150,
    description: "Cambia el tema de la app a un diseño inspirado en la naturaleza.",
  },
  tema_oscuro: {
    title: "Tema Oscuro",
    cost: 100,
    description: "Activa el modo oscuro en toda la aplicación.",
  },
  insignia_oro: {
    title: "Insignia Oro",
    cost: 250,
    description: "Una insignia especial para mostrar en tu perfil.",
  },
  chatbot_motivador: {
    title: "Chatbot Motivador",
    cost: 200,
    description: "Desbloquea mensajes motivacionales especiales del chatbot.",
  },
  fondo_relajante: {
    title: "Fondo Relajante",
    cost: 150,
    description: "Un fondo visual relajante para la aplicación.",
  },
}

export const getRewards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId
    if (!userId) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" })
      return
    }

    const unlocks = await RewardUnlock.find({ userId })
    const unlockedCodes = new Set(unlocks.map((u) => u.rewardCode))

    const gamification = await UserGamification.findOne({ userId })
    const points = gamification?.motivationPoints || 0

    const rewards = Object.entries(REWARDS_CATALOG).map(([code, info]) => ({
      code,
      title: info.title,
      description: info.description,
      cost: info.cost,
      isUnlocked: unlockedCodes.has(code),
      unlockedAt: unlocks.find((u) => u.rewardCode === code)?.unlockedAt || null,
    }))

    res.status(200).json({
      success: true,
      data: rewards,
      points,
    })
  } catch (err) {
    const error = err as Error
    console.error("[rewards] Error getting rewards:", error)
    res.status(500).json({ success: false, message: "Error al obtener recompensas", error: error.message })
  }
}

export const unlockReward = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId
    if (!userId) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" })
      return
    }

    const { code } = req.params
    const reward = REWARDS_CATALOG[code]

    if (!reward) {
      res.status(404).json({ success: false, message: "Recompensa no encontrada" })
      return
    }

    const existing = await RewardUnlock.findOne({ userId, rewardCode: code })
    if (existing) {
      res.status(400).json({ success: false, message: "Ya tienes esta recompensa desbloqueada" })
      return
    }

    const gamification = await UserGamification.findOne({ userId })
    const points = gamification?.motivationPoints || 0

    if (points < reward.cost) {
      res.status(400).json({
        success: false,
        message: `No tienes suficientes puntos. Necesitas ${reward.cost} MP, tienes ${points} MP`,
      })
      return
    }

    gamification!.motivationPoints -= reward.cost
    await gamification!.save()

    const unlock = new RewardUnlock({
      userId,
      rewardCode: code,
      pointsSpent: reward.cost,
    })
    await unlock.save()

    console.log("[rewards] reward unlocked", { userId, code, cost: reward.cost, remainingPoints: gamification!.motivationPoints })

    res.status(200).json({
      success: true,
      message: `¡${reward.title} desbloqueado!`,
      data: {
        code,
        title: reward.title,
        unlockedAt: unlock.unlockedAt,
        pointsSpent: reward.cost,
        remainingPoints: gamification!.motivationPoints,
      },
    })
  } catch (err) {
    const error = err as Error
    console.error("[rewards] Error unlocking reward:", error)
    res.status(500).json({ success: false, message: "Error al desbloquear recompensa", error: error.message })
  }
}
