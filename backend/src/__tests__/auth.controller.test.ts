import type { Request, Response } from "express"
import { login } from "../controllers/auth.controller"

//crear mocks completos para los módulos
const mockUser = {
  _id: "123",
  name: "Test User",
  email: "test@example.com",
  password: "hashedPassword",
  role: "user",
  lastLogin: null,
  save: jest.fn().mockResolvedValue(true),
}

//mock para User.findOne
const mockFindOne = jest.fn()

//mock para bcrypt.compare
const mockCompare = jest.fn()

//mock para jwt.sign
const mockSign = jest.fn()

//configurar los mocks antes de importar los módulos
jest.mock("../models/User", () => ({
  User: {
    findOne: (...args: any[]) => mockFindOne(...args),
  },
}))

jest.mock("bcryptjs", () => ({
  compare: (...args: any[]) => mockCompare(...args),
}))

jest.mock("jsonwebtoken", () => ({
  sign: (...args: any[]) => mockSign(...args),
}))

describe("Auth Controller", () => {
  // Crear mocks para Request y Response
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockStatus: jest.Mock
  let mockJson: jest.Mock

  beforeEach(() => {
    // Resetear todos los mocks antes de cada prueba
    jest.clearAllMocks()

    // Configurar mocks para response
    mockJson = jest.fn()
    mockStatus = jest.fn().mockReturnValue({ json: mockJson })

    mockRequest = {
      body: {},
    }

    mockResponse = {
      status: mockStatus,
      json: mockJson,
    }
  })

  describe("login", () => {
    test("debería devolver 401 si el usuario no existe", async () => {
      // Configurar
      mockRequest.body = { email: "test@example.com", password: "password123" }
      mockFindOne.mockResolvedValue(null)

      // Ejecutar
      await login(mockRequest as Request, mockResponse as Response)

      // Verificar
      expect(mockStatus).toHaveBeenCalledWith(401)
      expect(mockJson).toHaveBeenCalledWith({ message: "Credenciales inválidas" })
    })

    test("debería devolver 401 si la contraseña es incorrecta", async () => {
      // Configurar
      mockRequest.body = { email: "test@example.com", password: "password123" }
      mockFindOne.mockResolvedValue(mockUser)
      mockCompare.mockResolvedValue(false)

      // Ejecutar
      await login(mockRequest as Request, mockResponse as Response)

      // Verificar
      expect(mockStatus).toHaveBeenCalledWith(401)
      expect(mockJson).toHaveBeenCalledWith({ message: "Credenciales inválidas" })
    })

    test("debería devolver token y datos de usuario si las credenciales son correctas", async () => {
      // Configurar
      mockRequest.body = { email: "test@example.com", password: "password123" }
      mockFindOne.mockResolvedValue(mockUser)
      mockCompare.mockResolvedValue(true)
      mockSign.mockReturnValue("fake-token")

      // Ejecutar
      await login(mockRequest as Request, mockResponse as Response)

      // Verificar
      expect(mockUser.save).toHaveBeenCalled()
      expect(mockSign).toHaveBeenCalled()
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({
        token: "fake-token",
        user: {
          _id: "123",
          name: "Test User",
          email: "test@example.com",
          role: "user",
        },
      })
    })
  })
})
