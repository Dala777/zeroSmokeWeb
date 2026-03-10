import { defineConfig, devices } from "@playwright/test"

/**
 * Configuración de Playwright para ZeroSmoke
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Directorio donde están nuestros tests
  testDir: "./tests",

  // Ejecutar tests en paralelo
  fullyParallel: true,

  // Fallar si hay tests que no se pueden ejecutar en CI
  forbidOnly: !!process.env.CI,

  // Reintentos en caso de fallo
  retries: process.env.CI ? 2 : 0,

  // Número de workers (procesos paralelos)
  workers: process.env.CI ? 1 : undefined,

  // Configuración del reporter (cómo mostrar resultados)
  reporter: [
    ["html"], // Reporte HTML
    ["list"], // Lista en consola
    ["json", { outputFile: "test-results/results.json" }], // JSON para CI/CD
  ],

  // Configuración global para todos los tests
  use: {
    // URL base de ZeroSmoke
    baseURL: "http://localhost:3000",

    // Capturar trace (grabación de acciones) en fallos
    trace: "on-first-retry",

    // Capturar screenshots solo cuando falla
    screenshot: "only-on-failure",

    // Capturar video solo cuando falla
    video: "retain-on-failure",

    // Timeout para acciones individuales (click, fill, etc.)
    actionTimeout: 10000,

    // Timeout para navegación
    navigationTimeout: 30000,
  },

  // Configuración de diferentes navegadores y dispositivos
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    // Tests en dispositivos móviles
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },

    // Tests en tablets
    {
      name: "Microsoft Edge",
      use: { ...devices["Desktop Edge"], channel: "msedge" },
    },
  ],

  // Configurar servidor de desarrollo
  webServer: [
    {
      command: "npm start",
      port: 3000,
      cwd: "./frontend",
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: "npm start",
      port: 5000,
      cwd: "./backend",
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],
})
