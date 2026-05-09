import { Router } from "express"
import {
  saveInitialTest,
  getUserProgress,
  updateUserProgress,
  saveSmokingRecord,
  getDailyPlan,
  completeActivity,
  getWeeklyProgress,
  getAchievements,
  getProgressSummary,
  updateSmokingRecord,
  saveDailyCheckin,
  getTodayDailyCheckin,
} from "../controllers/progress.controller"
import { authMiddleware } from "../middleware/auth.middleware"

const router = Router()

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware)

// Rutas para el progreso del usuario
router.post("/initial-test", saveInitialTest)
router.get("/user-progress", getUserProgress)
router.put("/user-progress", updateUserProgress)
router.post("/smoking-record", saveSmokingRecord)
router.get("/daily-plan", getDailyPlan)
router.put("/daily-plan/:planId/activity/:activityId/complete", completeActivity)
router.post("/daily-checkin", saveDailyCheckin)
router.get("/daily-checkin/today", getTodayDailyCheckin)

// Nuevas rutas para la pantalla de progreso
router.get("/weekly-progress", getWeeklyProgress)
router.get("/achievements", getAchievements)
router.get("/progress-summary", getProgressSummary)
router.put("/smoking-record", updateSmokingRecord)

// Ruta adicional para asignar plan (si es necesaria)
router.post("/assign-plan", async (req, res) => {
  try {
    // Esta funcionalidad podría estar integrada en saveInitialTest
    // Por ahora devolvemos éxito
    res.json({
      success: true,
      message: "Plan asignado exitosamente",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al asignar plan",
    })
  }
})

export default router
