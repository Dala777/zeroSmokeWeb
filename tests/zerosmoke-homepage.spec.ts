import { test, expect } from "@playwright/test"

/**
 * Tests para la página principal de ZeroSmoke
 * Aquí probamos la funcionalidad básica de la homepage
 */
test.describe("ZeroSmoke Homepage", () => {
  test.beforeEach(async ({ page }) => {
    // Este código se ejecuta antes de cada test
    // Navegamos a la página principal
    await page.goto("/")
  })

  test("should load homepage correctly", async ({ page }) => {
    // Verificar que el título de la página sea correcto
    await expect(page).toHaveTitle(/ZeroSmoke/i)

    // Verificar que la página principal cargue elementos importantes
    // Buscar el header principal
    const mainHeading = page.locator("h1").first()
    await expect(mainHeading).toBeVisible()

    // Verificar que el texto del heading contenga información sobre dejar de fumar
    await expect(mainHeading).toContainText(/ZeroSmoke|Dejar de fumar|Quit smoking/i)

    // Capturar screenshot para documentación
    await page.screenshot({
      path: "test-results/screenshots/homepage-loaded.png",
      fullPage: true,
    })
  })

  test("should display navigation menu", async ({ page }) => {
    // Verificar que el menú de navegación esté presente
    const navigation = page.locator("nav")
    await expect(navigation).toBeVisible()

    // Verificar enlaces importantes del menú
    await expect(page.locator('a[href*="articulos"], a[href*="articles"]')).toBeVisible()
    await expect(page.locator('a[href*="contacto"], a[href*="contact"]')).toBeVisible()
    await expect(page.locator('a[href*="login"], a[href*="iniciar"]')).toBeVisible()
  })

  test("should navigate to articles page", async ({ page }) => {
    // Buscar y hacer click en el enlace de artículos
    // Usamos diferentes posibles textos para el enlace
    const articlesLink = page
      .locator("a")
      .filter({
        hasText: /Artículos|Articles|Educación/i,
      })
      .first()

    await expect(articlesLink).toBeVisible()
    await articlesLink.click()

    // Esperar a que la navegación complete
    await page.waitForLoadState("networkidle")

    // Verificar que navegamos a la página correcta
    await expect(page).toHaveURL(/articulos|articles/i)

    // Verificar que la página de artículos cargó correctamente
    await expect(page.locator("h1")).toBeVisible()
  })

  test("should navigate to contact page", async ({ page }) => {
    // Navegar a la página de contacto
    const contactLink = page
      .locator("a")
      .filter({
        hasText: /Contacto|Contact/i,
      })
      .first()

    await expect(contactLink).toBeVisible()
    await contactLink.click()

    await page.waitForLoadState("networkidle")

    // Verificar navegación exitosa
    await expect(page).toHaveURL(/contacto|contact/i)

    // Verificar que hay un formulario de contacto
    await expect(page.locator("form")).toBeVisible()
  })

  test("should display app preview section", async ({ page }) => {
    // Verificar que la sección de preview de la app esté presente
    const appPreview = page.locator('[class*="app"], [class*="preview"], img[alt*="app"]')
    await expect(appPreview.first()).toBeVisible()

    // Verificar que hay imágenes de la aplicación
    const appImages = page.locator('img[src*="app"], img[alt*="app"]')
    await expect(appImages.first()).toBeVisible()
  })

  test("should be responsive on mobile", async ({ page }) => {
    // Cambiar a viewport móvil
    await page.setViewportSize({ width: 375, height: 667 })

    // Verificar que la página sigue siendo funcional en móvil
    await expect(page.locator("h1")).toBeVisible()

    // Verificar que el menú móvil funciona (si existe)
    const mobileMenu = page.locator('[class*="mobile"], [class*="hamburger"], button[aria-label*="menu"]')
    if ((await mobileMenu.count()) > 0) {
      await mobileMenu.first().click()
      // Verificar que se abre el menú
      await expect(page.locator("nav")).toBeVisible()
    }

    // Capturar screenshot móvil
    await page.screenshot({
      path: "test-results/screenshots/homepage-mobile.png",
      fullPage: true,
    })
  })
})
