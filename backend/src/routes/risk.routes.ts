import { Router } from "express"
import { getTodayRisk } from "../controllers/risk.controller"
import { authMiddleware } from "../middleware/auth.middleware"

const router = Router()

router.use(authMiddleware)

router.get("/today", getTodayRisk)

export default router
