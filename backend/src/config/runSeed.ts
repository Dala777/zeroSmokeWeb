import mongoose from "mongoose"
import seedPlans from "./seedPlans"

const runSeed = async (): Promise<void> => {
  try {
    // Conectar a MongoDB
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/zerosmoke"
    await mongoose.connect(mongoUri)
    console.log("Conectado a MongoDB")

    // Ejecutar seed
    await seedPlans()

    console.log("Seed ejecutado exitosamente")
    process.exit(0)
  } catch (error) {
    console.error("Error ejecutando seed:", error)
    process.exit(1)
  }
}

runSeed()
