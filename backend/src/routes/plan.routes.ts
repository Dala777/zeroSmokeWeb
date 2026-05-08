import { Router } from "express"
import { planController } from "../controllers/plan.controller"
import { authMiddleware } from "../middleware/auth.middleware"

const router = Router()

router.post("/assign", authMiddleware, planController.assignPlan)
router.get("/my-plan", authMiddleware, planController.getMyPlan)
router.get("/daily/:userId", authMiddleware, planController.getDailyPlan)
router.post("/:planId/activity/:activityId/complete", authMiddleware, planController.completeActivity)
router.get("/progress/:userId", authMiddleware, planController.getPlanProgress)

export default router
