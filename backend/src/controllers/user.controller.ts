import type { Request, Response } from "express"
import bcrypt from "bcryptjs"
import { User } from "../models/User"

// Obtener todos los usuarios
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 })
    res.status(200).json(users)
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Obtener un usuario por ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select("-password")
    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" })
      return
    }
    res.status(200).json(user)
  } catch (error) {
    console.error("Error al obtener usuario:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Crear un nuevo usuario
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      res.status(400).json({ message: "El usuario ya existe" })
      return
    }

    // Crear nuevo usuario
    const newUser = new User({
      name,
      email,
      password,
      role: role || "user",
      status: "active",
      createdAt: new Date(),
    })

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10)
    newUser.password = await bcrypt.hash(password, salt)

    // Guardar usuario
    const savedUser = await newUser.save()

    res.status(201).json({
      user: {
        _id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        status: savedUser.status,
      },
    })
  } catch (error) {
    console.error("Error al crear usuario:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Actualizar un usuario
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, status } = req.body
    const userId = req.params.id

    // Verificar si el usuario existe
    const user = await User.findById(userId)
    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" })
      return
    }

    // Preparar datos de actualización
    const updateData: any = {
      name: name || user.name,
      email: email || user.email,
      role: role || user.role,
      status: status || user.status,
      updatedAt: new Date(),
    }

    // Si se proporciona una nueva contraseña, encriptarla
    if (password) {
      const salt = await bcrypt.genSalt(10)
      updateData.password = await bcrypt.hash(password, salt)
    }

    // Actualizar usuario
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password")

    res.status(200).json(updatedUser)
  } catch (error) {
    console.error("Error al actualizar usuario:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Eliminar un usuario
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id)
    if (!deletedUser) {
      res.status(404).json({ message: "Usuario no encontrado" })
      return
    }
    res.status(200).json({ message: "Usuario eliminado con éxito" })
  } catch (error) {
    console.error("Error al eliminar usuario:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

