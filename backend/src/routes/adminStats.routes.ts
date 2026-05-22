import { Router } from "express"
import {
  getCheckinStats,
  getCravingStats,
  getNotificationStats,
  getOverviewStats,
  getUserStats,
} from "../controllers/adminStats.controller"
import { authMiddleware, adminMiddleware } from "../middleware/auth.middleware"

const router = Router()

router.use(authMiddleware)
router.use(adminMiddleware)

router.get("/overview", getOverviewStats)
router.get("/users", getUserStats)
router.get("/checkins", getCheckinStats)
router.get("/cravings", getCravingStats)
router.get("/notifications", getNotificationStats)

export default router
