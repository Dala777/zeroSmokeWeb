import { Request, Response } from 'express';
import { Message, IMessage } from '../models/interfaces';

// Obtener todos los mensajes
export const getAllMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error al obtener los mensajes' });
  }
};

// Obtener un mensaje por ID
export const getMessageById = async (req: Request, res: Response): Promise<void> => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      res.status(404).json({ message: 'Mensaje no encontrado' });
      return;
    }
    res.status(200).json(message);
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ message: 'Error al obtener el mensaje' });
  }
};

// Crear un nuevo mensaje
export const createMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const newMessage = new Message({
      ...req.body,
      status: 'new',
      createdAt: new Date()
    });
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ message: 'Error al crear el mensaje' });
  }
};

// Actualizar un mensaje
export const updateMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    
    if (!updatedMessage) {
      res.status(404).json({ message: 'Mensaje no encontrado' });
      return;
    }
    
    res.status(200).json(updatedMessage);
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ message: 'Error al actualizar el mensaje' });
  }
};

// Eliminar un mensaje
export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedMessage = await Message.findByIdAndDelete(req.params.id);
    
    if (!deletedMessage) {
      res.status(404).json({ message: 'Mensaje no encontrado' });
      return;
    }
    
    res.status(200).json({ message: 'Mensaje eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Error al eliminar el mensaje' });
  }
};