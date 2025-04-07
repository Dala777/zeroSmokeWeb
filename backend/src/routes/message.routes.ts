import express from "express";
import {
  getAllMessages,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage,
} from "../controllers/message.controller";
import { authMiddleware, adminMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

// Rutas públicas
router.post("/", createMessage);

// Rutas protegidas (solo admin)
router.get("/", authMiddleware, adminMiddleware, getAllMessages);
router.get("/:id", authMiddleware, adminMiddleware, getMessageById);
router.put("/:id", authMiddleware, adminMiddleware, updateMessage);
router.delete("/:id", authMiddleware, adminMiddleware, deleteMessage);

export default router;
