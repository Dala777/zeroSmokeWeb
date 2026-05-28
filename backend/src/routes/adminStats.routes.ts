import { Router } from "express"
import {
  getAlertsHighRisk,
  getCheckinStats,
  getCravingStats,
  getHeatmapCravings,
  getHighRiskUsers,
  getNotificationStats,
  getOverviewStats,
  getRelapseStats,
  getResearchStats,
  getSummaryStats,
  getSymptomsStats,
  getUserStats,
  exportCheckinsCSV,
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
router.get("/research", getResearchStats)
router.get("/export/checkins", exportCheckinsCSV)
router.get("/summary", getSummaryStats)
router.get("/heatmap/cravings", getHeatmapCravings)
router.get("/alerts/high-risk", getAlertsHighRisk)

export default router
