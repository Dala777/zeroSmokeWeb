// Este archivo configura el entorno de pruebas para Jest
import { jest } from "@jest/globals"

// Configuración global para mocks
jest.setTimeout(10000) // Aumentar el tiempo de espera para pruebas

// Silenciar logs durante las pruebas
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
}

// Limpiar todos los mocks después de cada prueba
afterEach(() => {
  jest.clearAllMocks()
})
