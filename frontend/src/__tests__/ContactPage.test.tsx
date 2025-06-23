import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import ContactPage from "../pages/ContactPage"
import { messageAPI } from "../services/api"
import { ChatbotProvider } from "../components/ChatbotContext"
import { BrowserRouter } from "react-router-dom"

// Mock de los módulos
jest.mock("../services/api", () => ({
  messageAPI: {
    create: jest.fn(),
  },
}))

describe("ContactPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("renderiza el formulario de contacto correctamente", () => {
    render(
      <BrowserRouter>
        <ChatbotProvider>
          <ContactPage />
        </ChatbotProvider>
      </BrowserRouter>,
    )

    expect(screen.getByText("Contacto")).toBeInTheDocument()

    // Usar querySelector para verificar la existencia de los inputs
    const nameInput = document.querySelector('input[name="name"]')
    const emailInput = document.querySelector('input[name="email"]')
    const subjectInput = document.querySelector('input[name="subject"]')
    const messageTextarea = document.querySelector('textarea[name="message"]')

    expect(nameInput).toBeInTheDocument()
    expect(emailInput).toBeInTheDocument()
    expect(subjectInput).toBeInTheDocument()
    expect(messageTextarea).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Enviar Mensaje" })).toBeInTheDocument()
  })

  test("muestra error cuando falla el envío del mensaje", async () => {
    ;(messageAPI.create as jest.Mock).mockRejectedValue({
      response: { data: { message: "Error al enviar el mensaje" } },
    })

    render(
      <BrowserRouter>
        <ChatbotProvider>
          <ContactPage />
        </ChatbotProvider>
      </BrowserRouter>,
    )

    // Usar querySelector para obtener los inputs
    const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement
    const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement
    const subjectInput = document.querySelector('input[name="subject"]') as HTMLInputElement
    const messageTextarea = document.querySelector('textarea[name="message"]') as HTMLTextAreaElement

    expect(nameInput).toBeInTheDocument()
    expect(emailInput).toBeInTheDocument()
    expect(subjectInput).toBeInTheDocument()
    expect(messageTextarea).toBeInTheDocument()

    // Simular cambios en los inputs
    fireEvent.change(nameInput, { target: { value: "Test User" } })
    fireEvent.change(emailInput, { target: { value: "test@example.com" } })
    fireEvent.change(subjectInput, { target: { value: "Test Subject" } })
    fireEvent.change(messageTextarea, { target: { value: "Test Message" } })
    fireEvent.click(screen.getByRole("button", { name: "Enviar Mensaje" }))

    await waitFor(() => {
      expect(screen.getByText(/error al enviar el mensaje/i)).toBeInTheDocument()
    })

    expect(messageAPI.create).toHaveBeenCalledWith({
      name: "Test User",
      email: "test@example.com",
      subject: "Test Subject",
      message: "Test Message",
      status: "new",
    })
  })

  test("envía el mensaje correctamente", async () => {
    ;(messageAPI.create as jest.Mock).mockResolvedValue({
      data: { _id: "123", status: "new" },
    })

    render(
      <BrowserRouter>
        <ChatbotProvider>
          <ContactPage />
        </ChatbotProvider>
      </BrowserRouter>,
    )

    // Usar querySelector para obtener los inputs
    const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement
    const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement
    const subjectInput = document.querySelector('input[name="subject"]') as HTMLInputElement
    const messageTextarea = document.querySelector('textarea[name="message"]') as HTMLTextAreaElement

    expect(nameInput).toBeInTheDocument()
    expect(emailInput).toBeInTheDocument()
    expect(subjectInput).toBeInTheDocument()
    expect(messageTextarea).toBeInTheDocument()

    // Simular cambios en los inputs
    fireEvent.change(nameInput, { target: { value: "Test User" } })
    fireEvent.change(emailInput, { target: { value: "test@example.com" } })
    fireEvent.change(subjectInput, { target: { value: "Test Subject" } })
    fireEvent.change(messageTextarea, { target: { value: "Test Message" } })
    fireEvent.click(screen.getByRole("button", { name: "Enviar Mensaje" }))

    await waitFor(() => {
      expect(screen.getByText(/mensaje enviado con éxito/i)).toBeInTheDocument()
    })

    expect(messageAPI.create).toHaveBeenCalledWith({
      name: "Test User",
      email: "test@example.com",
      subject: "Test Subject",
      message: "Test Message",
      status: "new",
    })
  })
})
