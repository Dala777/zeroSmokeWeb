// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

// Definir una interfaz extendida para Request
interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

// Definir la interfaz para el payload del token
interface TokenPayload {
  id: string;
  role: string;
}

// Middleware para verificar token JWT
export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Obtener token del header
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      res.status(401).json({ message: "No hay token, autorización denegada" })
      return
    }

    // Verificar token
    const secret = process.env.JWT_SECRET || "your_jwt_secret"
    const decoded = jwt.verify(token, secret) as TokenPayload

    // Añadir información del usuario a la request
    const authReq = req as AuthRequest
    authReq.userId = decoded.id
    authReq.userRole = decoded.role

    next()
  } catch (error) {
    console.error("Error en autenticación:", error)
    res.status(401).json({ message: "Token no válido" })
  }
}

// Middleware para verificar rol de administrador
export const adminMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authReq = req as AuthRequest
    const userRole = authReq.userRole

    if (userRole !== "admin") {
      res.status(403).json({ message: "Acceso denegado, se requiere rol de administrador" })
      return
    }

    next()
  } catch (error) {
    console.error("Error en verificación de rol:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}