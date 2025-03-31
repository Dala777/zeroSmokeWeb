import { Request, Response } from 'express';
import { messages } from '../config/mockData';

export const getAllMessages = (req: Request, res: Response) => {
  const { status } = req.query;
  
  let filteredMessages = [...messages];
  
  // Filtrar por estado si se proporciona
  if (status && (status === 'new' || status === 'read' || status === 'answered')) {
    filteredMessages = filteredMessages.filter(m => m.status === status);
  }
  
  // Ordenar por fecha de creación (más reciente primero)
  filteredMessages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  
  res.status(200).json(filteredMessages);
};

export const getMessageById = (req: Request, res: Response) => {
  const messageId = parseInt(req.params.id);
  const message = messages.find(m => m.id === messageId);

  if (!message) {
    return res.status(404).json({ message: 'Mensaje no encontrado' });
  }
  
  // Si el mensaje es nuevo, marcarlo como leído
  if (message.status === 'new') {
    message.status = 'read';
    message.updatedAt = new Date();
  }

  res.status(200).json(message);
};

export const createMessage = (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;
  
  // Generar ID
  const newId = messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 1;
  
  // Crear nuevo mensaje
  const newMessage = {
    id: newId,
    name,
    email,
    subject,
    message,
    status: 'new' as 'new' | 'read' | 'answered',
    createdAt: new Date()
  };
  
  messages.push(newMessage);
  
  res.status(201).json(newMessage);
};

export const updateMessage = (req: Request, res: Response) => {
  const messageId = parseInt(req.params.id);
  const { status } = req.body;
  
  // Buscar mensaje
  const messageIndex = messages.findIndex(m => m.id === messageId);
  
  if (messageIndex === -1) {
    return res.status(404).json({ message: 'Mensaje no encontrado' });
  }
  
  // Actualizar mensaje
  const message = messages[messageIndex];
  
  if (status) message.status = status;
  message.updatedAt = new Date();
  
  res.status(200).json(message);
};

export const respondToMessage = (req: Request, res: Response) => {
  const messageId = parseInt(req.params.id);
  const { responseText } = req.body;
  
  // Buscar mensaje
  const messageIndex = messages.findIndex(m => m.id === messageId);
  
  if (messageIndex === -1) {
    return res.status(404).json({ message: 'Mensaje no encontrado' });
  }
  
  // Actualizar mensaje
  const message = messages[messageIndex];
  message.status = 'answered';
  message.updatedAt = new Date();
  
  // Aquí se implementaría el envío de email con la respuesta
  // Para la presentación, simplemente simulamos que se envió
  console.log(`Enviando respuesta a ${message.email}: ${responseText}`);
  
  res.status(200).json(message);
};

export const deleteMessage = (req: Request, res: Response) => {
  const messageId = parseInt(req.params.id);
  
  // Buscar mensaje
  const messageIndex = messages.findIndex(m => m.id === messageId);
  
  if (messageIndex === -1) {
    return res.status(404).json({ message: 'Mensaje no encontrado' });
  }
  
  // Eliminar mensaje
  const deletedMessage = messages.splice(messageIndex, 1)[0];
  
  res.status(200).json(deletedMessage);
};