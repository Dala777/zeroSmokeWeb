import type { Request, Response } from "express"
import { Message } from "../models/Message"
import { emailService } from "../services/email.service"

// Obtener todos los mensajes
export const getAllMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 })
    res.status(200).json(messages)
  } catch (error) {
    console.error("Error al obtener mensajes:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Obtener un mensaje por ID
export const getMessageById = async (req: Request, res: Response): Promise<void> => {
  try {
    const message = await Message.findById(req.params.id)
    if (!message) {
      res.status(404).json({ message: "Mensaje no encontrado" })
      return
    }
    res.status(200).json(message)
  } catch (error) {
    console.error("Error al obtener mensaje:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Crear un nuevo mensaje
export const createMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Recibiendo mensaje:", req.body)

    // Validar datos requeridos
    const { name, email, subject, message } = req.body

    if (!name || !email || !subject || !message) {
      res.status(400).json({ message: "Todos los campos son requeridos" })
      return
    }

    // Crear nuevo mensaje
    const newMessage = new Message({
      name,
      email,
      subject,
      message,
      status: "new",
      createdAt: new Date(),
    })

    // Guardar en la base de datos
    const savedMessage = await newMessage.save()
    console.log("Mensaje guardado:", savedMessage)

    res.status(201).json(savedMessage)
  } catch (error) {
    console.error("Error al crear mensaje:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Actualizar un mensaje
export const updateMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true },
    )
    if (!updatedMessage) {
      res.status(404).json({ message: "Mensaje no encontrado" })
      return
    }
    res.status(200).json(updatedMessage)
  } catch (error) {
    console.error("Error al actualizar mensaje:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Eliminar un mensaje
export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedMessage = await Message.findByIdAndDelete(req.params.id)
    if (!deletedMessage) {
      res.status(404).json({ message: "Mensaje no encontrado" })
      return
    }
    res.status(200).json({ message: "Mensaje eliminado con éxito" })
  } catch (error) {
    console.error("Error al eliminar mensaje:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Responder a un mensaje
export const replyToMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { replyText } = req.body

    if (!replyText || replyText.trim() === "") {
      res.status(400).json({ message: "El texto de la respuesta es requerido" })
      return
    }

    // Buscar el mensaje
    const message = await Message.findById(id)
    if (!message) {
      res.status(404).json({ message: "Mensaje no encontrado" })
      return
    }

    // Enviar correo electrónico
    await emailService.sendMessageReply(message.email, message.subject, replyText)

    // Actualizar el estado del mensaje a "answered"
    const updatedMessage = await Message.findByIdAndUpdate(
      id,
      {
        status: "answered",
        updatedAt: new Date(),
      },
      { new: true },
    )

    res.status(200).json({
      message: "Respuesta enviada con éxito",
      data: updatedMessage,
    })
  } catch (error) {
    console.error("Error al responder mensaje:", error)
    res.status(500).json({ message: "Error al enviar la respuesta" })
  }
}

