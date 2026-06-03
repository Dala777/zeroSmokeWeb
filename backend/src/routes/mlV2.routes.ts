import { Router } from "express"
import { trainMultipleRegression, predictRisk } from "../controllers/mlV2.controller"
import { authMiddleware, adminMiddleware } from "../middleware/auth.middleware"

const router = Router()

router.use(authMiddleware)
router.use(adminMiddleware)

router.get("/train", trainMultipleRegression)
router.post("/predict", predictRisk)

export default router
