import { Router } from "express"
import { getRewards, unlockReward } from "../controllers/rewards.controller"
import { authMiddleware } from "../middleware/auth.middleware"

const router = Router()

router.use(authMiddleware)

router.get("/", getRewards)
router.post("/unlock/:code", unlockReward)

export default router
