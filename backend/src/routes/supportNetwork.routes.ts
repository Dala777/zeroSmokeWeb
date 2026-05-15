import { Router } from "express"
import { getContacts, createContact, deleteContact } from "../controllers/supportNetwork.controller"
import { authMiddleware } from "../middleware/auth.middleware"

const router = Router()

router.use(authMiddleware)

router.get("/", getContacts)
router.post("/", createContact)
router.delete("/:id", deleteContact)

export default router
