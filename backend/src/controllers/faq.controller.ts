import type { Request, Response } from "express"
import { FAQ } from "../models/FAQ"

// Obtener todas las FAQs
export const getAllFaqs = async (req: Request, res: Response): Promise<void> => {
  try {
    const faqs = await FAQ.find().sort({ category: 1, createdAt: -1 })
    res.status(200).json(faqs)
  } catch (error) {
    console.error("Error al obtener FAQs:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Obtener una FAQ por ID
export const getFaqById = async (req: Request, res: Response): Promise<void> => {
  try {
    const faq = await FAQ.findById(req.params.id)
    if (!faq) {
      res.status(404).json({ message: "FAQ no encontrada" })
      return
    }
    res.status(200).json(faq)
  } catch (error) {
    console.error("Error al obtener FAQ:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Crear una nueva FAQ
export const createFaq = async (req: Request, res: Response): Promise<void> => {
  try {
    const newFaq = new FAQ(req.body)
    const savedFaq = await newFaq.save()
    res.status(201).json(savedFaq)
  } catch (error) {
    console.error("Error al crear FAQ:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Actualizar una FAQ
export const updateFaq = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedFaq = await FAQ.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: new Date() }, { new: true })
    if (!updatedFaq) {
      res.status(404).json({ message: "FAQ no encontrada" })
      return
    }
    res.status(200).json(updatedFaq)
  } catch (error) {
    console.error("Error al actualizar FAQ:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Eliminar una FAQ
export const deleteFaq = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedFaq = await FAQ.findByIdAndDelete(req.params.id)
    if (!deletedFaq) {
      res.status(404).json({ message: "FAQ no encontrada" })
      return
    }
    res.status(200).json({ message: "FAQ eliminada con éxito" })
  } catch (error) {
    console.error("Error al eliminar FAQ:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

