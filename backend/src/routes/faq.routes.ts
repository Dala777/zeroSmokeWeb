import express from "express"
import { getAllFaqs, getFaqById, createFaq, updateFaq, deleteFaq } from "../controllers/faq.controller"
import { authMiddleware, adminMiddleware } from "../middleware/auth.middleware"

const router = express.Router()

// Rutas públicas
router.get("/", getAllFaqs)
router.get("/:id", getFaqById)

// Rutas protegidas (solo admin)
router.post("/", authMiddleware, adminMiddleware, createFaq)
router.put("/:id", authMiddleware, adminMiddleware, updateFaq)
router.delete("/:id", authMiddleware, adminMiddleware, deleteFaq)

export default router

