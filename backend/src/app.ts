import express from "express"
import cors from "cors"
import morgan from "morgan"
import helmet from "helmet"
import { connectDB } from "./config/database"

// Importar rutas
import articleRoutes from "./routes/article.routes"
import faqRoutes from "./routes/faq.routes"
import authRoutes from "./routes/auth.routes"
import userRoutes from "./routes/user.routes"
import messageRoutes from "./routes/message.routes"
import progressRoutes from "./routes/progress.routes" // Nueva importación

// Inicializar la aplicación
const app = express()

// Conectar a la base de datos
connectDB()

// Middleware
app.use(cors())
app.use(helmet())
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rutas
app.use("/api/articles", articleRoutes)
app.use("/api/faqs", faqRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/progress", progressRoutes) // Cambiar a /api/progress

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API de ZeroSmoke funcionando correctamente")
})

export default app
