import { Router } from "express"
import { getLinearRegression } from "../controllers/ml.controller"
import { authMiddleware, adminMiddleware } from "../middleware/auth.middleware"

const router = Router()

router.use(authMiddleware)
router.use(adminMiddleware)

router.get("/linear-regression", getLinearRegression)

export default router
