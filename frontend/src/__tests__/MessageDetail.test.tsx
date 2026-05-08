import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { BrowserRouter, useParams } from "react-router-dom"
import MessageDetail from "../pages/admin/MessageDetail"
import { messageAPI } from "../services/api"
import * as AuthContextModule from "../contexts/AuthContext"

// Mock de los módulos
jest.mock("../services/api", () => ({
  messageAPI: {
    getById: jest.fn(),
    update: jest.fn(),
    reply: jest.fn(),
    delete: jest.fn(),
  },
}))

// Mock de useParams y useNavigate
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
  useNavigate: () => jest.fn(),
}))

describe("MessageDetail", () => {
  const mockMessage = {
    _id: "123",
    name: "Test User",
    email: "test@example.com",
    subject: "Test Subject",
    message: "Test Message",
    status: "read",
    createdAt: new Date().toISOString(),
  }

  const mockUser = {
    _id: "admin123",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useParams as jest.Mock).mockReturnValue({ id: "123" })
    ;(messageAPI.getById as jest.Mock).mockResolvedValue({ data: mockMessage })

    // Mock del hook useAuth
    jest.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: mockUser,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    })
  })

  test("renderiza los detalles del mensaje correctamente", async () => {
    render(
      <BrowserRouter>
        <MessageDetail />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText("Detalle del Mensaje")).toBeInTheDocument()
      expect(screen.getByText("Test Subject")).toBeInTheDocument()
      expect(screen.getByText("De: Test User")).toBeInTheDocument()
      expect(screen.getByText("Email: test@example.com")).toBeInTheDocument()
      expect(screen.getByText("Test Message")).toBeInTheDocument()
    })

    expect(messageAPI.getById).toHaveBeenCalledWith("123")
  })

  test("envía una respuesta al mensaje correctamente", async () => {
    ;(messageAPI.reply as jest.Mock).mockResolvedValue({
      data: { message: "Respuesta enviada con éxito" },
    })

    render(
      <BrowserRouter>
        <MessageDetail />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText("Responder")).toBeInTheDocument()
    })

    fireEvent.change(screen.getByPlaceholderText("Escribe tu respuesta aquí..."), {
      target: { value: "Test Reply" },
    })
    fireEvent.click(screen.getByText("Enviar Respuesta"))

    await waitFor(() => {
      expect(screen.getByText("Respuesta enviada con éxito")).toBeInTheDocument()
    })

    expect(messageAPI.reply).toHaveBeenCalledWith("123", "Test Reply")
  })

  test("muestra error cuando la respuesta está vacía", async () => {
    render(
      <BrowserRouter>
        <MessageDetail />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText("Responder")).toBeInTheDocument()
    })

    // No escribimos nada en el textarea
    fireEvent.click(screen.getByText("Enviar Respuesta"))

    await waitFor(() => {
      expect(screen.getByText("Por favor, escribe una respuesta antes de enviar.")).toBeInTheDocument()
    })

    expect(messageAPI.reply).not.toHaveBeenCalled()
  })
})
