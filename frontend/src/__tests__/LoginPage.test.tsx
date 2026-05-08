import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"
import LoginPage from "../pages/LoginPage"
import * as AuthContextModule from "../contexts/AuthContext"

// Mock de los módulos
jest.mock("../services/api", () => ({
  authAPI: {
    login: jest.fn(),
  },
}))

// Mock de useNavigate
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}))

// Mock del contexto de autenticación
jest.mock("../contexts/AuthContext", () => {
  const originalModule = jest.requireActual("../contexts/AuthContext")
  return {
    ...originalModule,
    useAuth: jest.fn(),
  }
})

describe("LoginPage", () => {
  // Definir mockUser al inicio para evitar el error de "used before declaration"
  const mockUser = { _id: "123", name: "Test User", email: "test@example.com", role: "user" }
  const mockLogin = jest.fn()
  const mockLogout = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    // Configurar el mock de useAuth ANTES de renderizar el componente
    // Esto es crucial para que el hook esté disponible cuando el componente lo llame
    ;(AuthContextModule.useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      loading: false,
      login: mockLogin,
      logout: mockLogout,
      register: jest.fn(),
      user: null,
    })

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    })
  })

  test("renderiza el formulario de login correctamente", () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>,
    )

    expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument()

    // Usar querySelector en lugar de getByLabelText
    const emailInput = document.querySelector('input[type="email"]')
    const passwordInput = document.querySelector('input[type="password"]')

    expect(emailInput).toBeInTheDocument()
    expect(passwordInput).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  test("muestra error cuando las credenciales son inválidas", async () => {
    // Configurar el mock para simular un inicio de sesión fallido
    mockLogin.mockResolvedValue(false)

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>,
    )

    // Usar querySelector para obtener los inputs
    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement
    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement

    expect(emailInput).toBeInTheDocument()
    expect(passwordInput).toBeInTheDocument()

    // Simular cambios en los inputs
    fireEvent.change(emailInput, { target: { value: "test@example.com" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }))

    await waitFor(() => {
      // Buscar el mensaje de error con una expresión regular más flexible
      expect(screen.getByText(/credenciales incorrectas|ocurrió un error/i)).toBeInTheDocument()
    })

    expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123")
  })

  test("inicia sesión correctamente con credenciales válidas", async () => {
    // Configurar el mock para simular un inicio de sesión exitoso
    mockLogin.mockResolvedValue(true)

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>,
    )

    // Usar querySelector para obtener los inputs
    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement
    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement

    expect(emailInput).toBeInTheDocument()
    expect(passwordInput).toBeInTheDocument()

    // Simular cambios en los inputs
    fireEvent.change(emailInput, { target: { value: "test@example.com" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123")
    })
  })
})
