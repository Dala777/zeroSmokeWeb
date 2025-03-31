import { Request, Response } from 'express';
import { articles, users } from '../config/mockData';

export const getAllArticles = (req: Request, res: Response) => {
  const { status } = req.query;
  
  let filteredArticles = [...articles];
  
  // Filtrar por estado si se proporciona
  if (status && (status === 'published' || status === 'draft')) {
    filteredArticles = filteredArticles.filter(a => a.status === status);
  }
  
  // Ordenar por fecha de creación (más reciente primero)
  filteredArticles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  
  res.status(200).json(filteredArticles);
};

export const getArticleById = (req: Request, res: Response) => {
  const articleId = parseInt(req.params.id);
  const article = articles.find(a => a.id === articleId);

  if (!article) {
    return res.status(404).json({ message: 'Artículo no encontrado' });
  }

  res.status(200).json(article);
};

export const createArticle = (req: Request, res: Response) => {
  const { title, excerpt, content, image, status = 'draft', tags = [] } = req.body;
  const authorId = req.user.id;
  
  // Buscar autor
  const author = users.find(u => u.id === authorId);
  
  if (!author) {
    return res.status(404).json({ message: 'Autor no encontrado' });
  }
  
  // Generar ID
  const newId = articles.length > 0 ? Math.max(...articles.map(a => a.id)) + 1 : 1;
  
  // Crear nuevo artículo
  const newArticle = {
    id: newId,
    title,
    excerpt,
    content,
    image,
    status: status as 'published' | 'draft',
    authorId,
    author: author.fullName,
    createdAt: new Date(),
    tags
  };
  
  articles.push(newArticle);
  
  res.status(201).json(newArticle);
};

export const updateArticle = (req: Request, res: Response) => {
  const articleId = parseInt(req.params.id);
  const { title, excerpt, content, image, status, tags } = req.body;
  
  // Buscar artículo
  const articleIndex = articles.findIndex(a => a.id === articleId);
  
  if (articleIndex === -1) {
    return res.status(404).json({ message: 'Artículo no encontrado' });
  }
  
  // Actualizar artículo
  const article = articles[articleIndex];
  
  if (title) article.title = title;
  if (excerpt !== undefined) article.excerpt = excerpt;
  if (content) article.content = content;
  if (image !== undefined) article.image = image;
  if (status) article.status = status;
  if (tags) article.tags = tags;
  
  article.updatedAt = new Date();
  
  res.status(200).json(article);
};

export const deleteArticle = (req: Request, res: Response) => {
  const articleId = parseInt(req.params.id);
  
  // Buscar artículo
  const articleIndex = articles.findIndex(a => a.id === articleId);
  
  if (articleIndex === -1) {
    return res.status(404).json({ message: 'Artículo no encontrado' });
  }
  
  // Eliminar artículo
  const deletedArticle = articles.splice(articleIndex, 1)[0];
  
  res.status(200).json(deletedArticle);
};