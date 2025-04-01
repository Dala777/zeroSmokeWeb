import { Request, Response } from 'express';
import { Article, IArticle } from '../models/interfaces';

// Obtener todos los artículos
export const getAllArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.status(200).json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ message: 'Error al obtener los artículos' });
  }
};

// Obtener un artículo por ID
export const getArticleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      res.status(404).json({ message: 'Artículo no encontrado' });
      return;
    }
    res.status(200).json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ message: 'Error al obtener el artículo' });
  }
};

// Crear un nuevo artículo
export const createArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const newArticle = new Article(req.body);
    const savedArticle = await newArticle.save();
    res.status(201).json(savedArticle);
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ message: 'Error al crear el artículo' });
  }
};

// Actualizar un artículo
export const updateArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    
    if (!updatedArticle) {
      res.status(404).json({ message: 'Artículo no encontrado' });
      return;
    }
    
    res.status(200).json(updatedArticle);
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ message: 'Error al actualizar el artículo' });
  }
};

// Eliminar un artículo
export const deleteArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedArticle = await Article.findByIdAndDelete(req.params.id);
    
    if (!deletedArticle) {
      res.status(404).json({ message: 'Artículo no encontrado' });
      return;
    }
    
    res.status(200).json({ message: 'Artículo eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ message: 'Error al eliminar el artículo' });
  }
};