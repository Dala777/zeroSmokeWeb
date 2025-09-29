import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { connectDB } from "./config/database"
import authRoutes from "./routes/auth.routes"
import planRoutes from "./routes/plan.routes"
import progressRoutes from "./routes/progress.routes" // Nueva importación

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Conectar a la base de datos
connectDB()

// Rutas
app.use("/api/auth", authRoutes)
app.use("/api/plans", planRoutes)
app.use("/api/progress", progressRoutes) // Nueva ruta

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "ZeroSmoke API funcionando correctamente" })
})

// Manejo de errores 404
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada`,
  })
})

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`)
})

export default app
