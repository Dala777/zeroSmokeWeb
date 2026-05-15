import { Router } from "express"
import {
  getPreferences,
  updatePreferences,
  getSmartMessages,
  registerDevice,
  unregisterDevice,
  getNotificationHistory,
  markNotificationRead,
  markAllNotificationsRead,
  sendSmartPushNow,
} from "../controllers/notification.controller"
import { authMiddleware } from "../middleware/auth.middleware"

const router = Router()

router.use(authMiddleware)

router.get("/preferences", getPreferences)
router.put("/preferences", updatePreferences)
router.get("/smart-messages", getSmartMessages)

router.post("/register-device", registerDevice)
router.delete("/unregister-device", unregisterDevice)

router.get("/history", getNotificationHistory)
router.put("/history/:id/read", markNotificationRead)
router.put("/history/read-all", markAllNotificationsRead)

router.post("/send-smart-push", sendSmartPushNow)

export default router
