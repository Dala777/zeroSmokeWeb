import type { Page } from "@playwright/test"

/**
 * Helper functions para autenticación
 * Estas funciones reutilizables nos ayudan a evitar código duplicado
 */

export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Hacer login con credenciales específicas
   */
  async login(email: string, password: string) {
    await this.page.goto("/login")
    await this.page.fill('input[type="email"], input[name*="email"]', email)
    await this.page.fill('input[type="password"], input[name*="password"]', password)
    await this.page.click('button[type="submit"], button')
    await this.page.waitForLoadState("networkidle")
  }

  /**
   * Registrar nuevo usuario
   */
  async register(name: string, email: string, password: string) {
    await this.page.goto("/register")
    await this.page.fill('input[name*="name"], input[name*="nombre"]', name)
    await this.page.fill('input[type="email"], input[name*="email"]', email)
    await this.page.fill('input[type="password"], input[name*="password"]', password)

    // Si hay confirmación de password
    const confirmField = this.page.locator('input[name*="confirm"], input[name*="repeat"]')
    if ((await confirmField.count()) > 0) {
      await confirmField.fill(password)
    }

    await this.page.click('button[type="submit"], button')
    await this.page.waitForLoadState("networkidle")
  }

  /**
   * Hacer logout
   */
  async logout() {
    const logoutButton = this.page.locator("a, button").filter({ hasText: /Cerrar|Logout|Salir/i })
    if ((await logoutButton.count()) > 0) {
      await logoutButton.first().click()
      await this.page.waitForLoadState("networkidle")
    }
  }

  /**
   * Verificar si el usuario está logueado
   */
  async isLoggedIn(): Promise<boolean> {
    const userIndicators = this.page.locator('[class*="user"], [class*="profile"], a').filter({
      hasText: /Cerrar|Logout|Perfil|Profile/i,
    })
    return (await userIndicators.count()) > 0
  }
}
