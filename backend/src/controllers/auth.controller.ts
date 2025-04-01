import type { Request, Response } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { User } from "../models/User"

// Interface para el payload del token
interface TokenPayload {
  id: string
  role: "user" | "admin"
}

// Login de usuario
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    // Verificar si el usuario existe
    const user = await User.findOne({ email })
    if (!user) {
      res.status(401).json({ message: "Credenciales inválidas" })
      return
    }

    // Verificar si la contraseña es correcta
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      res.status(401).json({ message: "Credenciales inválidas" })
      return
    }

    // Actualizar último login
    user.lastLogin = new Date()
    await user.save()

    // Crear una versión simple del payload
    const payload: TokenPayload = {
      id: user._id.toString(),
      role: user.role,
    }

    // Definir el secreto como string
    const jwtSecret: string = process.env.JWT_SECRET || "your_jwt_secret"

    // Usar try/catch específico para la generación del token
    try {
      const token = jwt.sign(payload, jwtSecret)

      res.status(200).json({
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      })
    } catch (signError) {
      console.error("Error al firmar el token:", signError)
      res.status(500).json({ message: "Error en la generación del token" })
    }
  } catch (error) {
    console.error("Error en login:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Registro de usuario
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body

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
      role: "user",
      status: "active",
      createdAt: new Date(),
    })

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10)
    newUser.password = await bcrypt.hash(password, salt)

    // Guardar usuario
    const savedUser = await newUser.save()

    // Crear una versión simple del payload
    const payload: TokenPayload = {
      id: savedUser._id.toString(),
      role: savedUser.role,
    }

    // Definir el secreto como string
    const jwtSecret: string = process.env.JWT_SECRET || "your_jwt_secret"

    // Usar try/catch específico para la generación del token
    try {
      const token = jwt.sign(payload, jwtSecret)

      res.status(201).json({
        token,
        user: {
          _id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          role: savedUser.role,
        },
      })
    } catch (signError) {
      console.error("Error al firmar el token:", signError)
      res.status(500).json({ message: "Error en la generación del token" })
    }
  } catch (error) {
    console.error("Error en registro:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Obtener perfil de usuario
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // El middleware de autenticación ya ha verificado el token y añadido el usuario a req
    const userId = (req as any).userId

    const user = await User.findById(userId).select("-password")
    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" })
      return
    }

    res.status(200).json(user)
  } catch (error) {
    console.error("Error al obtener perfil:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

