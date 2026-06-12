import { Router } from "express"
import {
  getSystemReport,
  getUserReport,
  getProgressReport,
  getAcademicReport,
} from "../controllers/reports.controller"
import { authMiddleware, adminMiddleware } from "../middleware/auth.middleware"

const router = Router()

router.use(authMiddleware)
router.use(adminMiddleware)

router.get("/system", getSystemReport)
router.get("/users", getUserReport)
router.get("/progress", getProgressReport)
router.get("/academic", getAcademicReport)

export default router
