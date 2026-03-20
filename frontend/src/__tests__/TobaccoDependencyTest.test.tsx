import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import TobaccoDependencyTest from "../pages/TobaccoDependencyTest"
import { progressAPI } from "../services/api"

jest.mock("../services/api", () => ({
  progressAPI: {
    saveInitialTest: jest.fn(),
    updateUserProgress: jest.fn(),
  },
}))

describe("TobaccoDependencyTest page", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("completes test and displays result", async () => {
    render(<TobaccoDependencyTest />)

    // answer each question by clicking the first option
    for (let i = 0; i < 6; i++) {
      const nextButton = screen.getByRole("button", { name: /Siguiente|Ver Resultados/i })
      // select first option
      const options = screen.getAllByText(/Dentro de 5 minutos|Sí|El primero después|10 o menos|Sí|Sí/i)
      if (options.length > 0) {
        fireEvent.click(options[0])
      }
      fireEvent.click(nextButton)
    }

    // after last question should show results
    await waitFor(() => {
      expect(screen.getByText(/Dependencia Baja/i)).toBeInTheDocument()
    })
  })

  test("allows saving result and shows success message", async () => {
    (progressAPI.saveInitialTest as jest.Mock).mockResolvedValue({ data: {} })

    render(<TobaccoDependencyTest />)

    // simulate answering all and showing result
    for (let i = 0; i < 6; i++) {
      const option = screen.getAllByRole("button").find((b) => b.textContent && b.textContent.match(/Dentro|Sí|El primero|10|Sí|Sí/))
      if (option) fireEvent.click(option)
      const next = screen.getByRole("button", { name: /Siguiente|Ver Resultados/i })
      fireEvent.click(next)
    }

    await waitFor(() => {
      expect(screen.getByText(/Guardar Resultado/i)).toBeInTheDocument()
    })

    const priceInput = screen.getByLabelText(/Precio aproximado del paquete/i)
    fireEvent.change(priceInput, { target: { value: "100" } })
    fireEvent.click(screen.getByRole("button", { name: /Guardar Resultado/i }))

    await waitFor(() => {
      expect(screen.getByText(/Resultado guardado correctamente/i)).toBeInTheDocument()
    })
    expect(progressAPI.saveInitialTest).toHaveBeenCalled()
  })

  test("redirects or shows login prompt when not authenticated", async () => {
    (progressAPI.saveInitialTest as jest.Mock).mockRejectedValue({ response: { status: 401 } })

    render(<TobaccoDependencyTest />)

    for (let i = 0; i < 6; i++) {
      const option = screen.getAllByRole("button").find((b) => b.textContent && b.textContent.match(/Dentro|Sí|El primero|10|Sí|Sí/))
      if (option) fireEvent.click(option)
      const next = screen.getByRole("button", { name: /Siguiente|Ver Resultados/i })
      fireEvent.click(next)
    }

    await waitFor(() => {
      expect(screen.getByText(/Guardar Resultado/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole("button", { name: /Guardar Resultado/i }))

    await waitFor(() => {
      expect(screen.getByText(/inicia sesión o regístrate/i)).toBeInTheDocument()
    })
  })
})