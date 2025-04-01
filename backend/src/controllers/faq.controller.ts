import { Request, Response } from 'express';
import { FAQ, IFAQ } from '../models/interfaces';

// Obtener todas las FAQs
export const getAllFAQs = async (req: Request, res: Response): Promise<void> => {
  try {
    const faqs = await FAQ.find().sort({ createdAt: -1 });
    res.status(200).json(faqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ message: 'Error al obtener las FAQs' });
  }
};

// Obtener una FAQ por ID
export const getFAQById = async (req: Request, res: Response): Promise<void> => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      res.status(404).json({ message: 'FAQ no encontrada' });
      return;
    }
    res.status(200).json(faq);
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    res.status(500).json({ message: 'Error al obtener la FAQ' });
  }
};

// Crear una nueva FAQ
export const createFAQ = async (req: Request, res: Response): Promise<void> => {
  try {
    const newFAQ = new FAQ(req.body);
    const savedFAQ = await newFAQ.save();
    res.status(201).json(savedFAQ);
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({ message: 'Error al crear la FAQ' });
  }
};

// Actualizar una FAQ
export const updateFAQ = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedFAQ = await FAQ.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    
    if (!updatedFAQ) {
      res.status(404).json({ message: 'FAQ no encontrada' });
      return;
    }
    
    res.status(200).json(updatedFAQ);
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({ message: 'Error al actualizar la FAQ' });
  }
};

// Eliminar una FAQ
export const deleteFAQ = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedFAQ = await FAQ.findByIdAndDelete(req.params.id);
    
    if (!deletedFAQ) {
      res.status(404).json({ message: 'FAQ no encontrada' });
      return;
    }
    
    res.status(200).json({ message: 'FAQ eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({ message: 'Error al eliminar la FAQ' });
  }
};