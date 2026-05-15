import { Router } from "express"
import { getChatHistory, deleteChatHistory } from "../controllers/chatHistory.controller"
import { authMiddleware } from "../middleware/auth.middleware"

const router = Router()

router.use(authMiddleware)

router.get("/history", getChatHistory)
router.delete("/history", deleteChatHistory)

export default router
