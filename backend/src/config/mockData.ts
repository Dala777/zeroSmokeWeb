import bcrypt from "bcryptjs"

// Usuarios de prueba
export const users = [
  {
    name: "Admin Usuario",
    email: "admin@zerosmoke.com",
    password: bcrypt.hashSync("admin123", 10),
    role: "admin",
    status: "active",
    lastLogin: new Date(),
    createdAt: new Date(),
  },
  // Otros usuarios...
]

// Artículos de prueba
export const articles = [
  {
    title: "Efectos del tabaco en el sistema respiratorio",
    excerpt: "Los efectos nocivos del tabaco en el sistema respiratorio son extensos y bien documentados...",
    content: "Los efectos nocivos del tabaco en el sistema respiratorio son extensos y bien documentados...",
    image: "/placeholder.svg?height=200&width=300",
    status: "published",
    authorId: "1", // Esto se actualizará al sembrar la base de datos
    author: "Admin Usuario",
    createdAt: new Date("2023-05-15"),
    tags: ["salud", "respiratorio", "tabaco", "pulmones"],
  },
  // Otros artículos...
]

// FAQs de prueba
export const faqs = [
  {
    question: "¿Cuáles son los beneficios inmediatos de dejar de fumar?",
    answer: "Los beneficios inmediatos incluyen una mejora en la circulación sanguínea...",
    category: "Beneficios",
    createdAt: new Date(),
  },
  // Otras FAQs...
]

// Mensajes de prueba
export const messages = [
  {
    name: "Juan Pérez",
    email: "juan.perez@example.com",
    subject: "Consulta sobre el programa para dejar de fumar",
    message: "Hola, estoy interesado en el programa para dejar de fumar...",
    status: "new",
    createdAt: new Date("2023-07-15"),
  },
  // Otros mensajes...
]

