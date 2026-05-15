import { Router } from "express"
import { createEntry, getEntries, getRecentEntries } from "../controllers/emotionalJournal.controller"
import { authMiddleware } from "../middleware/auth.middleware"

const router = Router()

router.use(authMiddleware)

router.post("/", createEntry)
router.get("/", getEntries)
router.get("/recent", getRecentEntries)

export default router
