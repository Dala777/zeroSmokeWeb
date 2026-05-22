import { Router } from "express"
import {
  getCheckinStats,
  getCravingStats,
  getHighRiskUsers,
  getNotificationStats,
  getOverviewStats,
  getRelapseStats,
  getSymptomsStats,
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
router.get("/high-risk-users", getHighRiskUsers)
router.get("/symptoms", getSymptomsStats)
router.get("/relapses", getRelapseStats)

export default router
