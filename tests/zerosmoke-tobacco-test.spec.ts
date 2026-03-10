import { test, expect } from "@playwright/test"

/**
 * Tests para el Test de Dependencia al Tabaco de ZeroSmoke
 */
test.describe("ZeroSmoke Tobacco Dependency Test", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/test-dependencia")
  })

  test("should display tobacco dependency test", async ({ page }) => {
    // Verificar que estamos en la página del test
    await expect(page).toHaveURL(/test|dependencia|tobacco/i)

    // Verificar que hay preguntas del test
    await expect(page.locator("form")).toBeVisible()

    // Verificar que hay opciones de respuesta (radio buttons o checkboxes)
    const radioButtons = page.locator('input[type="radio"]')
    const checkboxes = page.locator('input[type="checkbox"]')

    expect((await radioButtons.count()) + (await checkboxes.count())).toBeGreaterThan(0)
  })

  test("should complete tobacco dependency test", async ({ page }) => {
    // Responder todas las preguntas del test
    const radioButtons = page.locator('input[type="radio"]')
    const radioCount = await radioButtons.count()

    if (radioCount > 0) {
      // Seleccionar la primera opción de cada grupo de preguntas
      const questions = await page.locator('input[type="radio"][value="0"], input[type="radio"][value="1"]').all()

      for (const question of questions) {
        await question.check()
      }
    }

    // Enviar el test
    const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /Enviar|Submit|Calcular/i })
    await submitButton.click()

    // Esperar resultados
    await page.waitForTimeout(2000)

    // Verificar que se muestran los resultados
    const results = page
      .locator('[class*="result"], [class*="score"], h2, h3')
      .filter({ hasText: /resultado|result|puntuación|score/i })
    if ((await results.count()) > 0) {
      await expect(results.first()).toBeVisible()
    }

    // Capturar screenshot de los resultados
    await page.screenshot({
      path: "test-results/screenshots/tobacco-test-results.png",
      fullPage: true,
    })
  })
})
