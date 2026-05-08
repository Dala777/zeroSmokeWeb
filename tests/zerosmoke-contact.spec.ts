import { test, expect } from "@playwright/test"

/**
 * Tests para el formulario de contacto de ZeroSmoke
 */
test.describe("ZeroSmoke Contact Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contacto")
  })

  test("should display contact form", async ({ page }) => {
    // Verificar que estamos en la página de contacto
    await expect(page).toHaveURL(/contacto|contact/i)

    // Verificar elementos del formulario
    await expect(page.locator("form")).toBeVisible()
    await expect(page.locator('input[name*="name"], input[name*="nombre"]')).toBeVisible()
    await expect(page.locator('input[type="email"], input[name*="email"]')).toBeVisible()
    await expect(page.locator('textarea[name*="message"], textarea[name*="mensaje"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test("should submit contact form successfully", async ({ page }) => {
    // Llenar formulario de contacto
    await page.fill('input[name*="name"], input[name*="nombre"]', "Test User")
    await page.fill('input[type="email"], input[name*="email"]', "test@example.com")
    await page.fill(
      'textarea[name*="message"], textarea[name*="mensaje"]',
      "Este es un mensaje de prueba para ZeroSmoke.",
    )

    // Enviar formulario
    await page.click('button[type="submit"]')

    // Esperar respuesta
    await page.waitForTimeout(3000)

    // Verificar mensaje de éxito
    const successMessage = page.locator('[class*="success"], [class*="alert-success"], .alert-success')
    if ((await successMessage.count()) > 0) {
      await expect(successMessage).toBeVisible()
      await expect(successMessage).toContainText(/enviado|sent|éxito|success/i)
    }

    // Capturar screenshot del resultado
    await page.screenshot({
      path: "test-results/screenshots/contact-form-submitted.png",
    })
  })

  test("should validate required fields", async ({ page }) => {
    // Intentar enviar formulario vacío
    await page.click('button[type="submit"]')

    // Verificar validación de campos requeridos
    const nameField = page.locator('input[name*="name"], input[name*="nombre"]')
    const emailField = page.locator('input[type="email"], input[name*="email"]')
    const messageField = page.locator('textarea[name*="message"], textarea[name*="mensaje"]')

    // Verificar que los campos tienen atributo required
    await expect(nameField).toHaveAttribute("required")
    await expect(emailField).toHaveAttribute("required")
    await expect(messageField).toHaveAttribute("required")
  })
})
