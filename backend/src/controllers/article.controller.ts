import type { Request, Response } from "express"
import { Article } from "../models/Article"

export const getAllArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category, status } = req.query
    const filter: Record<string, unknown> = {}

    if (search && typeof search === "string") {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ]
    }
    if (category && typeof category === "string" && category !== "all") {
      filter.category = category
    }
    if (status && typeof status === "string" && status !== "all") {
      filter.status = status
    }

    const articles = await Article.find(filter).sort({ createdAt: -1 })
    res.status(200).json(articles)
  } catch (error) {
    console.error("Error al obtener artículos:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

export const getPublishedArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.query
    const filter: Record<string, unknown> = { status: "published" }
    if (category && typeof category === "string" && category !== "all") {
      filter.category = category
    }
    const articles = await Article.find(filter).sort({ createdAt: -1 })
    res.status(200).json(articles)
  } catch (error) {
    console.error("Error al obtener artículos publicados:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

export const getArticleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const article = await Article.findById(req.params.id)
    if (!article) {
      res.status(404).json({ message: "Artículo no encontrado" })
      return
    }
    res.status(200).json(article)
  } catch (error) {
    console.error("Error al obtener artículo:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

export const createArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const newArticle = new Article({ ...req.body, authorId: (req as any).userId || req.body.authorId })
    const savedArticle = await newArticle.save()
    res.status(201).json(savedArticle)
  } catch (error) {
    console.error("Error al crear artículo:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

export const updateArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true },
    )
    if (!updatedArticle) {
      res.status(404).json({ message: "Artículo no encontrado" })
      return
    }
    res.status(200).json(updatedArticle)
  } catch (error) {
    console.error("Error al actualizar artículo:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

export const deleteArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedArticle = await Article.findByIdAndDelete(req.params.id)
    if (!deletedArticle) {
      res.status(404).json({ message: "Artículo no encontrado" })
      return
    }
    res.status(200).json({ message: "Artículo eliminado con éxito" })
  } catch (error) {
    console.error("Error al eliminar artículo:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}
