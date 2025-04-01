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

// Cargar variables de entorno
dotenv.config()

// Inicializar express
const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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
})

