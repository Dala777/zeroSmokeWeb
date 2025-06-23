import type { Request, Response } from "express"
import { createMessage, replyToMessage } from "../controllers/message.controller"

// Primero configuramos los mocks para los módulos
jest.mock("../models/Message", () => {
  // Creamos funciones mock dentro del ámbito de jest.mock
  const mockFindById = jest.fn()
  const mockFindByIdAndUpdate = jest.fn()
  const mockSave = jest.fn()

  return {
    Message: jest.fn().mockImplementation(() => {
      return {
        save: mockSave,
      }
    }),
    findById: mockFindById,
    findByIdAndUpdate: mockFindByIdAndUpdate,
  }
})

// Mock para el servicio de email
jest.mock("../services/email.service", () => ({
  emailService: {
    sendMessageReply: jest.fn(),
  },
}))

// Ahora obtenemos referencias a los mocks que creamos
const Message = jest.mocked(require("../models/Message").Message)
const mockEmailService = jest.mocked(require("../services/email.service").emailService)

describe("Message Controller", () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockStatus: jest.Mock
  let mockJson: jest.Mock
  let mockSave: jest.Mock

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks()

    // Configurar mocks para response
    mockJson = jest.fn()
    mockStatus = jest.fn().mockReturnValue({ json: mockJson })

    mockRequest = {
      body: {},
      params: {},
    }

    mockResponse = {
      status: mockStatus,
      json: mockJson,
    }

    // Configurar el mock de save
    mockSave = jest.fn().mockResolvedValue({
      _id: "123",
      name: "Test User",
      email: "test@example.com",
      subject: "Test Subject",
      message: "Test Message",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Sobreescribir la implementación de Message para usar mockSave
    Message.mockImplementation(() => ({
      save: mockSave,
    }))
  })

  describe("createMessage", () => {
    test("debería devolver 400 si faltan campos requeridos", async () => {
      // Configurar
      mockRequest.body = { name: "Test User", email: "test@example.com" } // Falta subject y message

      // Ejecutar
      await createMessage(mockRequest as Request, mockResponse as Response)

      // Verificar
      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({ message: "Todos los campos son requeridos" })
    })

    test("debería crear un mensaje correctamente", async () => {
      // Configurar
      mockRequest.body = {
        name: "Test User",
        email: "test@example.com",
        subject: "Test Subject",
        message: "Test Message",
      }

      // Mock para el constructor de Message
      jest.spyOn(global, "Date").mockImplementation(() => ({ toISOString: () => "2023-01-01" }) as unknown as Date)

      // Ejecutar
      await createMessage(mockRequest as Request, mockResponse as Response)

      // Verificar que se llamó a save
      expect(mockSave).toHaveBeenCalled()

      // Verificar el status code
      expect(mockStatus).toHaveBeenCalledWith(201)
      
      // Opcional: Para depuración
      console.log("mockStatus calls:", mockStatus.mock.calls)
      console.log("mockJson calls:", mockJson.mock.calls)
    })
  })

  describe("replyToMessage", () => {
    // El resto de las pruebas se mantienen igual
    test("debería devolver 400 si falta el texto de respuesta", async () => {
      // Configurar
      mockRequest.params = { id: "123" }
      mockRequest.body = { replyText: "" }

      // Ejecutar
      await replyToMessage(mockRequest as Request, mockResponse as Response)

      // Verificar
      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({ message: "El texto de la respuesta es requerido" })
    })

    test("debería devolver 404 si el mensaje no existe", async () => {
      // Configurar
      mockRequest.params = { id: "123" }
      mockRequest.body = { replyText: "Test Reply" }

      // Mock para findById que devuelve null (mensaje no encontrado)
      Message.findById = jest.fn().mockResolvedValue(null)

      // Ejecutar
      await replyToMessage(mockRequest as Request, mockResponse as Response)

      // Verificar
      expect(mockStatus).toHaveBeenCalledWith(404)
      expect(mockJson).toHaveBeenCalledWith({ message: "Mensaje no encontrado" })
    })

    test("debería responder al mensaje correctamente", async () => {
      // Configurar
      mockRequest.params = { id: "123" }
      mockRequest.body = { replyText: "Test Reply" }

      // Mock para el mensaje encontrado
      const mockMessageData = {
        _id: "123",
        email: "test@example.com",
        subject: "Test Subject",
      }

      // Mock para el mensaje actualizado
      const mockUpdatedMessage = {
        ...mockMessageData,
        status: "answered",
        updatedAt: new Date(),
      }

      // Configurar los mocks
      Message.findById = jest.fn().mockResolvedValue(mockMessageData)
      mockEmailService.sendMessageReply.mockResolvedValue({ messageId: "email123" })
      Message.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUpdatedMessage)

      // Ejecutar
      await replyToMessage(mockRequest as Request, mockResponse as Response)

      // Verificar
      expect(mockEmailService.sendMessageReply).toHaveBeenCalledWith(
        mockMessageData.email,
        mockMessageData.subject,
        "Test Reply",
      )
      expect(Message.findByIdAndUpdate).toHaveBeenCalled()
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Respuesta enviada con éxito",
          data: mockUpdatedMessage,
        }),
      )
    })

    test("debería manejar errores al enviar el correo", async () => {
      // Configurar
      mockRequest.params = { id: "123" }
      mockRequest.body = { replyText: "Test Reply" }

      // Mock para el mensaje encontrado
      const mockMessageData = {
        _id: "123",
        email: "test@example.com",
        subject: "Test Subject",
      }

      // Configurar los mocks
      Message.findById = jest.fn().mockResolvedValue(mockMessageData)
      mockEmailService.sendMessageReply.mockRejectedValue(new Error("Error al enviar correo"))
      Message.findByIdAndUpdate = jest.fn().mockResolvedValue({
        ...mockMessageData,
        status: "answered",
      })

      // Ejecutar
      await replyToMessage(mockRequest as Request, mockResponse as Response)

      // Verificar - Debería seguir devolviendo 200 pero con mensaje de error
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("error"),
          error: expect.any(String),
        }),
      )
    })
  })
})