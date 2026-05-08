import "@testing-library/jest-dom"

// Silenciar advertencias de React Router
const originalConsoleWarn = console.warn
console.warn = (...args) => {
  // Filtrar advertencias específicas de React Router
  if (
    typeof args[0] === "string" &&
    (args[0].includes("React Router") || args[0].includes("UNSAFE_") || args[0].includes("future flag"))
  ) {
    return
  }
  originalConsoleWarn(...args)
}
