import mongoose from "mongoose"
import dotenv from "dotenv"
import { User } from "../models/User"
import { Article } from "../models/Article"
import { FAQ } from "../models/FAQ"
import { Message } from "../models/Message"
import { users, articles, faqs, messages } from "./mockData"

// Cargar variables de entorno
dotenv.config()

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

// Función para sembrar la base de datos
const seedDatabase = async () => {
  try {
    // Limpiar la base de datos
    await User.deleteMany({})
    await Article.deleteMany({})
    await FAQ.deleteMany({})
    await Message.deleteMany({})

    console.log("Base de datos limpiada...")

    // Insertar usuarios
    const createdUsers = await User.insertMany(users)
    console.log(`${createdUsers.length} usuarios insertados`)

    // Actualizar authorId en artículos con el ID real del usuario admin
    const adminUser = createdUsers.find((user) => user.role === "admin")

    if (adminUser) {
      const articlesWithAuthorId = articles.map((article) => ({
        ...article,
        authorId: adminUser._id.toString(),
      }))

      // Insertar artículos
      const createdArticles = await Article.insertMany(articlesWithAuthorId)
      console.log(`${createdArticles.length} artículos insertados`)
    }

    // Insertar FAQs
    const createdFaqs = await FAQ.insertMany(faqs)
    console.log(`${createdFaqs.length} FAQs insertadas`)

    // Insertar mensajes
    const createdMessages = await Message.insertMany(messages)
    console.log(`${createdMessages.length} mensajes insertados`)

    console.log("¡Base de datos sembrada con éxito!")
    process.exit(0)
  } catch (error) {
    console.error("Error al sembrar la base de datos:", error)
    process.exit(1)
  }
}

// Ejecutar el script
connectDB().then(() => {
  seedDatabase()
})

