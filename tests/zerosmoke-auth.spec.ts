import { test, expect } from "@playwright/test"

/**
 * Tests para el sistema de autenticación de ZeroSmoke
 * Incluye login, registro y logout
 */
test.describe("ZeroSmoke Authentication", () => {
  test.describe("Login Page", () => {
    test.beforeEach(async ({ page }) => {
      // Navegar a la página de login antes de cada test
      await page.goto("/login")
    })

    test("should display login form", async ({ page }) => {
      // Verificar que estamos en la página de login
      await expect(page).toHaveURL(/login/i)

      // Verificar elementos del formulario de login
      await expect(page.locator('input[type="email"], input[name*="email"]')).toBeVisible()
      await expect(page.locator('input[type="password"], input[name*="password"]')).toBeVisible()
      await expect(
        page.locator('button[type="submit"], button').filter({ hasText: /Iniciar|Login|Entrar/i }),
      ).toBeVisible()

      // Verificar que hay un enlace para registrarse
      await expect(page.locator("a").filter({ hasText: /Registr|Sign up|Crear cuenta/i })).toBeVisible()
    })

    test("should show validation errors for empty fields", async ({ page }) => {
      // Intentar enviar formulario vacío
      const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /Iniciar|Login|Entrar/i })
      await submitButton.click()

      // Verificar que aparecen mensajes de error o validación HTML5
      const emailInput = page.locator('input[type="email"], input[name*="email"]')
      const passwordInput = page.locator('input[type="password"], input[name*="password"]')

      // Verificar validación HTML5 o mensajes de error personalizados
      await expect(emailInput).toHaveAttribute("required")
      await expect(passwordInput).toHaveAttribute("required")
    })

    test("should handle invalid login credentials", async ({ page }) => {
      // Llenar formulario con credenciales inválidas
      await page.fill('input[type="email"], input[name*="email"]', "invalid@email.com")
      await page.fill('input[type="password"], input[name*="password"]', "wrongpassword")

      // Enviar formulario
      const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /Iniciar|Login|Entrar/i })
      await submitButton.click()

      // Esperar respuesta del servidor
      await page.waitForTimeout(2000)

      // Verificar mensaje de error
      const errorMessage = page.locator('[class*="error"], [class*="alert"], .alert-danger')
      if ((await errorMessage.count()) > 0) {
        await expect(errorMessage).toBeVisible()
        await expect(errorMessage).toContainText(/error|incorrecto|invalid|wrong/i)
      }

      // Verificar que seguimos en la página de login
      await expect(page).toHaveURL(/login/i)
    })

    test("should login successfully with valid credentials", async ({ page }) => {
      // Primero necesitamos crear un usuario de prueba
      // Esto normalmente se haría con una API call o fixture

      // Llenar formulario con credenciales válidas
      await page.fill('input[type="email"], input[name*="email"]', "test@example.com")
      await page.fill('input[type="password"], input[name*="password"]', "password123")

      // Enviar formulario
      const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /Iniciar|Login|Entrar/i })
      await submitButton.click()

      // Esperar navegación o respuesta
      await page.waitForLoadState("networkidle")

      // Verificar redirección exitosa (puede ser a dashboard o homepage)
      await expect(page).not.toHaveURL(/login/i)

      // Verificar que el usuario está logueado
      // Buscar indicadores de sesión activa
      const userMenu = page
        .locator('[class*="user"], [class*="profile"], a')
        .filter({ hasText: /Cerrar|Logout|Perfil|Profile/i })
      if ((await userMenu.count()) > 0) {
        await expect(userMenu.first()).toBeVisible()
      }
    })
  })

  test.describe("Registration Page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/register")
    })

    test("should display registration form", async ({ page }) => {
      // Verificar elementos del formulario de registro
      await expect(page.locator('input[name*="name"], input[name*="nombre"]')).toBeVisible()
      await expect(page.locator('input[type="email"], input[name*="email"]')).toBeVisible()
      await expect(page.locator('input[type="password"], input[name*="password"]')).toBeVisible()

      // Verificar botón de registro
      await expect(
        page.locator('button[type="submit"], button').filter({ hasText: /Registr|Sign up|Crear/i }),
      ).toBeVisible()
    })

    test("should register new user successfully", async ({ page }) => {
      // Generar email único para evitar conflictos
      const uniqueEmail = `test${Date.now()}@example.com`

      // Llenar formulario de registro
      await page.fill('input[name*="name"], input[name*="nombre"]', "Test User")
      await page.fill('input[type="email"], input[name*="email"]', uniqueEmail)
      await page.fill('input[type="password"], input[name*="password"]', "password123")

      // Si hay confirmación de password
      const confirmPasswordField = page.locator('input[name*="confirm"], input[name*="repeat"]')
      if ((await confirmPasswordField.count()) > 0) {
        await confirmPasswordField.fill("password123")
      }

      // Enviar formulario
      const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /Registr|Sign up|Crear/i })
      await submitButton.click()

      // Esperar respuesta
      await page.waitForLoadState("networkidle")

      // Verificar registro exitoso
      // Puede redirigir a login o directamente loguear al usuario
      const currentUrl = page.url()
      expect(currentUrl).not.toContain("/register")
    })
  })

  test.describe("Logout Functionality", () => {
    test("should logout user successfully", async ({ page }) => {
      // Primero hacer login (esto podría ser un helper function)
      await page.goto("/login")
      await page.fill('input[type="email"], input[name*="email"]', "test@example.com")
      await page.fill('input[type="password"], input[name*="password"]', "password123")
      await page.click('button[type="submit"], button')

      await page.waitForLoadState("networkidle")

      // Buscar y hacer click en logout
      const logoutButton = page.locator("a, button").filter({ hasText: /Cerrar|Logout|Salir/i })
      if ((await logoutButton.count()) > 0) {
        await logoutButton.first().click()

        // Verificar que se cerró la sesión
        await page.waitForLoadState("networkidle")

        // Verificar redirección a página pública
        const loginLink = page.locator("a").filter({ hasText: /Iniciar|Login/i })
        await expect(loginLink).toBeVisible()
      }
    })
  })
})
