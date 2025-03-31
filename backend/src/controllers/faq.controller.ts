import { Request, Response } from 'express';
import { faqs } from '../config/mockData';

export const getAllFaqs = (req: Request, res: Response) => {
  const { category } = req.query;
  
  let filteredFaqs = [...faqs];
  
  // Filtrar por categoría si se proporciona
  if (category) {
    filteredFaqs = filteredFaqs.filter(f => f.category === category);
  }
  
  res.status(200).json(filteredFaqs);
};

export const getFaqById = (req: Request, res: Response) => {
  const faqId = parseInt(req.params.id);
  const faq = faqs.find(f => f.id === faqId);

  if (!faq) {
    return res.status(404).json({ message: 'FAQ no encontrada' });
  }

  res.status(200).json(faq);
};

export const createFaq = (req: Request, res: Response) => {
  const { question, answer, category } = req.body;
  
  // Generar ID
  const newId = faqs.length > 0 ? Math.max(...faqs.map(f => f.id)) + 1 : 1;
  
  // Crear nueva FAQ
  const newFaq = {
    id: newId,
    question,
    answer,
    category,
    createdAt: new Date()
  };
  
  faqs.push(newFaq);
  
  res.status(201).json(newFaq);
};

export const updateFaq = (req: Request, res: Response) => {
  const faqId = parseInt(req.params.id);
  const { question, answer, category } = req.body;
  
  // Buscar FAQ
  const faqIndex = faqs.findIndex(f => f.id === faqId);
  
  if (faqIndex === -1) {
    return res.status(404).json({ message: 'FAQ no encontrada' });
  }
  
  // Actualizar FAQ
  const faq = faqs[faqIndex];
  
  if (question) faq.question = question;
  if (answer) faq.answer = answer;
  if (category) faq.category = category;
  
  faq.updatedAt = new Date();
  
  res.status(200).json(faq);
};

export const deleteFaq = (req: Request, res: Response) => {
  const faqId = parseInt(req.params.id);
  
  // Buscar FAQ
  const faqIndex = faqs.findIndex(f => f.id === faqId);
  
  if (faqIndex === -1) {
    return res.status(404).json({ message: 'FAQ no encontrada' });
  }
  
  // Eliminar FAQ
  const deletedFaq = faqs.splice(faqIndex, 1)[0];
  
  res.status(200).json(deletedFaq);
};