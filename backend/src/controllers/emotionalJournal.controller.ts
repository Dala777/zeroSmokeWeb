import type { Request, Response } from "express"
import EmotionalJournal from "../models/EmotionalJournal"

interface AuthRequest extends Request {
  userId?: string
}

export const createEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId
    if (!userId) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" })
      return
    }

    const { date, mood, intensity, triggers, notes, tags } = req.body

    const entry = new EmotionalJournal({
      userId,
      date: date || new Date(),
      mood: mood || "neutro",
      intensity: Math.min(Math.max(Number(intensity) || 5, 1), 10),
      triggers: triggers || "",
      notes: notes || "",
      tags: Array.isArray(tags) ? tags : [],
    })

    await entry.save()

    console.log("[emotional-journal] entry created", { userId, mood, entryId: entry._id })

    res.status(201).json({
      success: true,
      message: "Entrada emocional guardada",
      data: entry,
    })
  } catch (err) {
    const error = err as Error
    console.error("[emotional-journal] Error creating entry:", error)
    res.status(500).json({ success: false, message: "Error al guardar entrada", error: error.message })
  }
}

export const getEntries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId
    if (!userId) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" })
      return
    }

    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200)
    const skip = Math.max(Number(req.query.skip) || 0, 0)

    const entries = await EmotionalJournal.find({ userId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)

    const total = await EmotionalJournal.countDocuments({ userId })

    res.status(200).json({
      success: true,
      data: entries,
      total,
      limit,
      skip,
    })
  } catch (err) {
    const error = err as Error
    console.error("[emotional-journal] Error getting entries:", error)
    res.status(500).json({ success: false, message: "Error al obtener entradas", error: error.message })
  }
}

export const getRecentEntries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId
    if (!userId) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" })
      return
    }

    const days = Math.min(Math.max(Number(req.query.days) || 7, 1), 90)
    const since = new Date()
    since.setDate(since.getDate() - days)

    const entries = await EmotionalJournal.find({
      userId,
      date: { $gte: since },
    }).sort({ date: -1 })

    res.status(200).json({
      success: true,
      data: entries,
      count: entries.length,
      since,
    })
  } catch (err) {
    const error = err as Error
    console.error("[emotional-journal] Error getting recent entries:", error)
    res.status(500).json({ success: false, message: "Error al obtener entradas recientes", error: error.message })
  }
}
