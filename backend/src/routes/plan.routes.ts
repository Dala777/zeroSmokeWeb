import { Router } from "express"
import { planController } from "../controllers/plan.controller"
import { authMiddleware } from "../middleware/auth.middleware"

const router = Router()

// Asignar plan después del test de Fagerström
router.post("/assign", authMiddleware, planController.assignPlan)

// Obtener plan diario
router.get("/daily/:userId", authMiddleware, planController.getDailyPlan)

// Completar actividad
router.post("/:planId/activity/:activityId/complete", authMiddleware, planController.completeActivity)

// Obtener progreso del plan
router.get("/progress/:userId", authMiddleware, planController.getPlanProgress)

export default router
