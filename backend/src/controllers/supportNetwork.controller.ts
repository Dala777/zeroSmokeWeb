import type { Request, Response } from "express"
import SupportContact from "../models/SupportContact"

interface AuthRequest extends Request {
  userId?: string
}

export const getContacts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId
    if (!userId) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" })
      return
    }

    const contacts = await SupportContact.find({ userId }).sort({ isEmergency: -1, createdAt: -1 })

    res.status(200).json({
      success: true,
      data: contacts,
    })
  } catch (err) {
    const error = err as Error
    console.error("[support-network] Error getting contacts:", error)
    res.status(500).json({ success: false, message: "Error al obtener contactos", error: error.message })
  }
}

export const createContact = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId
    if (!userId) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" })
      return
    }

    const { name, relationship, phone, email, isEmergency } = req.body

    if (!name || !phone) {
      res.status(400).json({ success: false, message: "Nombre y teléfono son requeridos" })
      return
    }

    const contact = new SupportContact({
      userId,
      name,
      relationship: relationship || "otro",
      phone,
      email: email || "",
      isEmergency: Boolean(isEmergency),
    })

    await contact.save()

    console.log("[support-network] contact created", { userId, name, contactId: contact._id })

    res.status(201).json({
      success: true,
      message: "Contacto agregado a la red de apoyo",
      data: contact,
    })
  } catch (err) {
    const error = err as Error
    console.error("[support-network] Error creating contact:", error)
    res.status(500).json({ success: false, message: "Error al agregar contacto", error: error.message })
  }
}

export const deleteContact = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId
    if (!userId) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" })
      return
    }

    const { id } = req.params

    const contact = await SupportContact.findOne({ _id: id, userId })
    if (!contact) {
      res.status(404).json({ success: false, message: "Contacto no encontrado" })
      return
    }

    await contact.deleteOne()

    console.log("[support-network] contact deleted", { userId, contactId: id })

    res.status(200).json({
      success: true,
      message: "Contacto eliminado",
    })
  } catch (err) {
    const error = err as Error
    console.error("[support-network] Error deleting contact:", error)
    res.status(500).json({ success: false, message: "Error al eliminar contacto", error: error.message })
  }
}
