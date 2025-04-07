import type { Request, Response } from "express";
import { Message } from "../models/Message";

// Obtener todos los mensajes
export const getAllMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Obtener un mensaje por ID
export const getMessageById = async (req: Request, res: Response): Promise<void> => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      res.status(404).json({ message: "Mensaje no encontrado" });
      return;
    }
    res.status(200).json(message);
  } catch (error) {
    console.error("Error al obtener mensaje:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Crear un nuevo mensaje
export const createMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const newMessage = new Message(req.body);
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Error al crear mensaje:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Actualizar un mensaje
export const updateMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date(), reply: req.body.reply }, // Agregar el campo reply
      { new: true },
    );
    if (!updatedMessage) {
      res.status(404).json({ message: "Mensaje no encontrado" });
      return;
    }
    res.status(200).json(updatedMessage);
  } catch (error) {
    console.error("Error al actualizar mensaje:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Eliminar un mensaje
export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedMessage = await Message.findByIdAndDelete(req.params.id);
    if (!deletedMessage) {
      res.status(404).json({ message: "Mensaje no encontrado" });
      return;
    }
    res.status(200).json({ message: "Mensaje eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar mensaje:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
