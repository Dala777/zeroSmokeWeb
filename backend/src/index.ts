import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"

// Importar rutas
import authRoutes from "./routes/auth.routes"
import userRoutes from "./routes/user.routes"
import articleRoutes from "./routes/article.routes"
import faqRoutes from "./routes/faq.routes"
import messageRoutes from "./routes/message.routes"
import progressRoutes from "./routes/progress.routes"
import planRoutes from "./routes/plan.routes"
import chatRoutes from "./routes/chat.routes"
import emotionalJournalRoutes from "./routes/emotionalJournal.routes"
import supportNetworkRoutes from "./routes/supportNetwork.routes"
import rewardsRoutes from "./routes/rewards.routes"
import achievementsRoutes from "./routes/achievements.routes"
import riskRoutes from "./routes/risk.routes"
import notificationRoutes from "./routes/notification.routes"
import chatHistoryRoutes from "./routes/chatHistory.routes"
import adminStatsRoutes from "./routes/adminStats.routes"
import mlRoutes from "./routes/ml.routes"
import mlV2Routes from "./routes/mlV2.routes"
import reportsRoutes from "./routes/reports.routes"

// Importar Firebase y scheduler
import { initFirebaseAdmin } from "./services/notificationPush.service"
import { startScheduler } from "./jobs/notificationScheduler"

// Cargar variables de entorno
dotenv.config()

// Inicializar express
const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ limit: "10mb", extended: true }))

// Conectar a MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/zerosmoke"
    await mongoose.connect(mongoURI)
    console.log("MongoDB conectado...")
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error)
    process.exit(1)
  }
}

connectDB()

// Rutas API
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/articles", articleRoutes)
app.use("/api/faqs", faqRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/progress", progressRoutes) // Cambiar a /api/progress
app.use("/api/plans", planRoutes) // Nueva ruta para planes
app.use("/api/chat", chatRoutes)
app.use("/api/emotional-journal", emotionalJournalRoutes)
app.use("/api/support-network", supportNetworkRoutes)
app.use("/api/rewards", rewardsRoutes)
app.use("/api/achievements", achievementsRoutes)
app.use("/api/risk", riskRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/chat", chatHistoryRoutes)
app.use("/api/admin/stats", adminStatsRoutes)
app.use("/api/admin/ml", mlRoutes)
app.use("/api/admin/ml/v2", mlV2Routes)
app.use("/api/admin/reports", reportsRoutes)

// Ruta de prueba
app.get("/api", (req, res) => {
  res.json({ message: "API de ZeroSmoke funcionando correctamente" })
})

// Servir archivos estáticos en producción
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../frontend/build")))

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../../frontend/build", "index.html"))
  })
}

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`)

  initFirebaseAdmin()
  startScheduler()
})
