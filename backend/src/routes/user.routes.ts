import express from "express"
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from "../controllers/user.controller"
import { authMiddleware, adminMiddleware } from "../middleware/auth.middleware"

const router = express.Router()

// Todas las rutas de usuarios requieren autenticación de administrador
router.use(authMiddleware)
router.use(adminMiddleware)

router.get("/", getAllUsers)
router.get("/:id", getUserById)
router.post("/", createUser)
router.put("/:id", updateUser)
router.delete("/:id", deleteUser)

export default router

