import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

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
    const decoded = jwt.verify(token, secret) as { id: string; role: string }

    // Añadir información del usuario a la request
    ;(req as any).userId = decoded.id
    ;(req as any).userRole = decoded.role

    next()
  } catch (error) {
    console.error("Error en autenticación:", error)
    res.status(401).json({ message: "Token no válido" })
  }
}

// Middleware para verificar rol de administrador
export const adminMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userRole = (req as any).userRole

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

