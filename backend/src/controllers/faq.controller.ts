import type { Request, Response } from "express"
import { FAQ } from "../models/FAQ"

export const getAllFaqs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query
    let filter: Record<string, unknown> = {}
    if (search && typeof search === "string") {
      filter = {
        $or: [
          { question: { $regex: search, $options: "i" } },
          { answer: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ],
      }
    }
    const faqs = await FAQ.find(filter).sort({ order: 1, createdAt: -1 })
    res.status(200).json(faqs)
  } catch (error) {
    console.error("Error al obtener FAQs:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

export const getActiveFaqs = async (req: Request, res: Response): Promise<void> => {
  try {
    const faqs = await FAQ.find({ status: "active" }).sort({ order: 1, category: 1 })
    res.status(200).json(faqs)
  } catch (error) {
    console.error("Error al obtener FAQs activas:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

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

export const createFaq = async (req: Request, res: Response): Promise<void> => {
  try {
    const maxOrder = await FAQ.findOne().sort({ order: -1 }).select("order")
    const newFaq = new FAQ({
      ...req.body,
      order: (maxOrder?.order ?? 0) + 1,
      status: req.body.status || "active",
    })
    const savedFaq = await newFaq.save()
    res.status(201).json(savedFaq)
  } catch (error) {
    console.error("Error al crear FAQ:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

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

export const toggleFaqStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const faq = await FAQ.findById(req.params.id)
    if (!faq) {
      res.status(404).json({ message: "FAQ no encontrada" })
      return
    }
    faq.status = faq.status === "active" ? "inactive" : "active"
    faq.updatedAt = new Date()
    await faq.save()
    res.status(200).json(faq)
  } catch (error) {
    console.error("Error al cambiar estado de FAQ:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

export const reorderFaqs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { faqIds } = req.body as { faqIds: string[] }
    if (!Array.isArray(faqIds)) {
      res.status(400).json({ message: "Se requiere un array de IDs" })
      return
    }
    const updates = faqIds.map((id, index) => ({
      updateOne: { filter: { _id: id }, update: { $set: { order: index, updatedAt: new Date() } } },
    }))
    await FAQ.bulkWrite(updates)
    res.status(200).json({ message: "Orden actualizado correctamente" })
  } catch (error) {
    console.error("Error al reordenar FAQs:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}
