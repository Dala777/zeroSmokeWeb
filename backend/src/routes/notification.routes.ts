import { Router } from "express"
import { getPreferences, updatePreferences, getSmartMessages } from "../controllers/notification.controller"
import { authMiddleware } from "../middleware/auth.middleware"

const router = Router()

router.use(authMiddleware)

router.get("/preferences", getPreferences)
router.put("/preferences", updatePreferences)
router.get("/smart-messages", getSmartMessages)

export default router
