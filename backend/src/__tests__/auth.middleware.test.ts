import type { Request, Response } from "express"
import { authMiddleware, adminMiddleware } from "../middleware/auth.middleware"
import jwt from "jsonwebtoken"

// Mock de jwt con tipos específicos
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}))

describe("Auth Middleware", () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: jest.Mock
  let mockStatus: jest.Mock
  let mockJson: jest.Mock

  beforeEach(() => {
    mockJson = jest.fn()
    mockStatus = jest.fn().mockReturnValue({ json: mockJson })
    mockNext = jest.fn()

    mockRequest = {
      header: jest.fn(),
    }

    mockResponse = {
      status: mockStatus,
      json: mockJson,
    }

    jest.clearAllMocks()
  })

  describe("authMiddleware", () => {
    test("debería devolver 401 si no hay token", async () => {
      // Configurar
      ;(mockRequest.header as jest.Mock).mockReturnValue(undefined)

      // Ejecutar
      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext)

      // Verificar
      expect(mockStatus).toHaveBeenCalledWith(401)
      expect(mockJson).toHaveBeenCalledWith({ message: "No hay token, autorización denegada" })
      expect(mockNext).not.toHaveBeenCalled()
    })

    test("debería devolver 401 si el token no es válido", async () => {
      // Configurar
      ;(mockRequest.header as jest.Mock).mockReturnValue("Bearer invalid-token")
      ;(jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Token inválido")
      })

      // Ejecutar
      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext)

      // Verificar
      expect(mockStatus).toHaveBeenCalledWith(401)
      expect(mockJson).toHaveBeenCalledWith({ message: "Token no válido" })
      expect(mockNext).not.toHaveBeenCalled()
    })

    test("debería añadir información del usuario a la request y llamar a next si el token es válido", async () => {
      // Configurar
      ;(mockRequest.header as jest.Mock).mockReturnValue("Bearer valid-token")
      ;(jwt.verify as jest.Mock).mockReturnValue({ id: "123", role: "user" })

      // Ejecutar
      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext)

      // Verificar
      expect((mockRequest as any).userId).toBe("123")
      expect((mockRequest as any).userRole).toBe("user")
      expect(mockNext).toHaveBeenCalled()
    })
  })

  describe("adminMiddleware", () => {
    test("debería devolver 403 si el usuario no es admin", async () => {
      // Configurar
      ;(mockRequest as any).userRole = "user"

      // Ejecutar
      await adminMiddleware(mockRequest as Request, mockResponse as Response, mockNext)

      // Verificar
      expect(mockStatus).toHaveBeenCalledWith(403)
      expect(mockJson).toHaveBeenCalledWith({ message: "Acceso denegado, se requiere rol de administrador" })
      expect(mockNext).not.toHaveBeenCalled()
    })

    test("debería llamar a next si el usuario es admin", async () => {
      // Configurar
      ;(mockRequest as any).userRole = "admin"

      // Ejecutar
      await adminMiddleware(mockRequest as Request, mockResponse as Response, mockNext)

      // Verificar
      expect(mockNext).toHaveBeenCalled()
    })
  })
})
