import { Router } from "express"
import { getDynamicAchievements } from "../controllers/achievements.controller"
import { authMiddleware } from "../middleware/auth.middleware"

const router = Router()

router.use(authMiddleware)

router.get("/dynamic", getDynamicAchievements)

export default router
