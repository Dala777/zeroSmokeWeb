import express from "express"
import {
  getAllFaqs,
  getActiveFaqs,
  getFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
  toggleFaqStatus,
  reorderFaqs,
} from "../controllers/faq.controller"
import { authMiddleware, adminMiddleware } from "../middleware/auth.middleware"

const router = express.Router()

// Rutas públicas
router.get("/active", getActiveFaqs)
router.get("/", getAllFaqs)
router.get("/:id", getFaqById)

// Rutas protegidas (solo admin)
router.post("/", authMiddleware, adminMiddleware, createFaq)
router.put("/:id", authMiddleware, adminMiddleware, updateFaq)
router.patch("/:id/toggle-status", authMiddleware, adminMiddleware, toggleFaqStatus)
router.put("/reorder", authMiddleware, adminMiddleware, reorderFaqs)
router.delete("/:id", authMiddleware, adminMiddleware, deleteFaq)

export default router

