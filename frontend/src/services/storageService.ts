import { articleAPI, faqAPI, messageAPI } from "./api"

// Tipos
export interface Article {
  _id?: string
  id?: number
  title: string
  excerpt?: string
  content: string
  image?: string
  status: "published" | "draft"
  authorId: string
  author?: string
  createdAt: Date
  updatedAt?: Date
  tags: string[]
}

export interface FAQ {
  _id?: string
  id?: number
  question: string
  answer: string
  category: string
  createdAt: Date
  updatedAt?: Date
}

export interface Message {
  _id?: string
  id?: number
  name: string
  email: string
  subject: string
  message: string
  status: "new" | "read" | "answered"
  createdAt: Date
  updatedAt?: Date
}

export interface HomePageData {
  heroTitle: string
  heroSubtitle: string
  heroImage: string
  features: {
    id: number
    title: string
    description: string
    icon: string
  }[]
}

// Funciones para obtener datos
export const getArticles = async (): Promise<Article[]> => {
  try {
    const response = await articleAPI.getAll()
    return response.data
  } catch (error) {
    console.error("Error fetching articles:", error)
    // Fallback a localStorage si la API falla
    const storedArticles = localStorage.getItem("articles")
    if (storedArticles) {
      return JSON.parse(storedArticles, (key, value) => {
        if (key === "createdAt" || key === "updatedAt") {
          return value ? new Date(value) : null
        }
        return value
      })
    }
    return []
  }
}

export const getFaqs = async (): Promise<FAQ[]> => {
  try {
    const response = await faqAPI.getAll()
    return response.data
  } catch (error) {
    console.error("Error fetching FAQs:", error)
    // Fallback a localStorage si la API falla
    const storedFaqs = localStorage.getItem("faqs")
    if (storedFaqs) {
      return JSON.parse(storedFaqs, (key, value) => {
        if (key === "createdAt" || key === "updatedAt") {
          return value ? new Date(value) : null
        }
        return value
      })
    }
    return []
  }
}

export const getMessages = async (): Promise<Message[]> => {
  try {
    const response = await messageAPI.getAll()
    return response.data
  } catch (error) {
    console.error("Error fetching messages:", error)
    // Fallback a localStorage si la API falla
    const storedMessages = localStorage.getItem("messages")
    if (storedMessages) {
      return JSON.parse(storedMessages, (key, value) => {
        if (key === "createdAt" || key === "updatedAt") {
          return value ? new Date(value) : null
        }
        return value
      })
    }
    return []
  }
}

export const getHomePageData = (): HomePageData => {
  const storedData = localStorage.getItem("homePageData")
  if (storedData) {
    return JSON.parse(storedData)
  }

  // Datos por defecto
  return {
    heroTitle: "Comienza tu camino hacia una vida libre de tabaco",
    heroSubtitle:
      "ZeroSmoke te ofrece las herramientas, información y apoyo que necesitas para dejar de fumar de manera efectiva y permanente.",
    heroImage: "/placeholder.svg?height=1080&width=1920",
    features: [
      {
        id: 1,
        title: "Test de Dependencia",
        description:
          "Evalúa tu nivel de dependencia a la nicotina con nuestro test basado en estándares médicos reconocidos.",
        icon: "📊",
      },
      {
        id: 2,
        title: "Asistente Virtual",
        description:
          "Nuestro chatbot te brinda apoyo inmediato y responde a tus preguntas en cualquier momento del día.",
        icon: "🤖",
      },
      {
        id: 3,
        title: "Aplicación Móvil",
        description:
          "Lleva tu progreso contigo con nuestra aplicación móvil que te ofrece herramientas adicionales y seguimiento personalizado.",
        icon: "📱",
      },
    ],
  }
}

// Funciones para guardar datos
export const saveArticles = (articles: Article[]): void => {
  localStorage.setItem("articles", JSON.stringify(articles))
}

export const saveFaqs = (faqs: FAQ[]): void => {
  localStorage.setItem("faqs", JSON.stringify(faqs))
}

export const saveMessages = (messages: Message[]): void => {
  localStorage.setItem("messages", JSON.stringify(messages))
}

export const saveHomePageData = (data: HomePageData): void => {
  localStorage.setItem("homePageData", JSON.stringify(data))
}

// Funciones para obtener un elemento por ID
export const getArticleById = async (id: number | string): Promise<Article | undefined> => {
  try {
    const response = await articleAPI.getById(id.toString())
    return response.data
  } catch (error) {
    console.error("Error fetching article by ID:", error)
    // Fallback a localStorage si la API falla
    const articles = await getArticles()
    return articles.find((article) => article.id === id || article._id === id)
  }
}

export const getFaqById = async (id: number | string): Promise<FAQ | undefined> => {
  try {
    const response = await faqAPI.getById(id.toString())
    return response.data
  } catch (error) {
    console.error("Error fetching FAQ by ID:", error)
    // Fallback a localStorage si la API falla
    const faqs = await getFaqs()
    return faqs.find((faq) => faq.id === id || faq._id === id)
  }
}

export const getMessageById = async (id: number | string): Promise<Message | undefined> => {
  try {
    const response = await messageAPI.getById(id.toString())
    return response.data
  } catch (error) {
    console.error("Error fetching message by ID:", error)
    // Fallback a localStorage si la API falla
    const messages = await getMessages()
    return messages.find((message) => message.id === id || message._id === id)
  }
}

// Funciones para actualizar un elemento
export const updateArticle = async (
  id: number | string,
  updatedArticle: Partial<Article>,
): Promise<Article | undefined> => {
  try {
    const response = await articleAPI.update(id.toString(), {
      ...updatedArticle,
      updatedAt: new Date(),
    })
    return response.data
  } catch (error) {
    console.error("Error updating article:", error)
    // Fallback a localStorage si la API falla
    const articles = await getArticles()
    const index = articles.findIndex((article) => article.id === id || article._id === id)

    if (index !== -1) {
      articles[index] = { ...articles[index], ...updatedArticle, updatedAt: new Date() }
      saveArticles(articles)
      return articles[index]
    }
    return undefined
  }
}

export const updateFaq = async (id: number | string, updatedFaq: Partial<FAQ>): Promise<FAQ | undefined> => {
  try {
    const response = await faqAPI.update(id.toString(), {
      ...updatedFaq,
      updatedAt: new Date(),
    })
    return response.data
  } catch (error) {
    console.error("Error updating FAQ:", error)
    // Fallback a localStorage si la API falla
    const faqs = await getFaqs()
    const index = faqs.findIndex((faq) => faq.id === id || faq._id === id)

    if (index !== -1) {
      faqs[index] = { ...faqs[index], ...updatedFaq, updatedAt: new Date() }
      saveFaqs(faqs)
      return faqs[index]
    }
    return undefined
  }
}

export const updateMessage = async (
  id: number | string,
  updatedMessage: Partial<Message>,
): Promise<Message | undefined> => {
  try {
    const response = await messageAPI.update(id.toString(), {
      ...updatedMessage,
      updatedAt: new Date(),
    })
    return response.data
  } catch (error) {
    console.error("Error updating message:", error)
    // Fallback a localStorage si la API falla
    const messages = await getMessages()
    const index = messages.findIndex((message) => message.id === id || message._id === id)

    if (index !== -1) {
      messages[index] = { ...messages[index], ...updatedMessage, updatedAt: new Date() }
      saveMessages(messages)
      return messages[index]
    }
    return undefined
  }
}

export const updateHomePageData = (updatedData: Partial<HomePageData>): HomePageData => {
  const currentData = getHomePageData()
  const newData = { ...currentData, ...updatedData }
  saveHomePageData(newData)
  return newData
}

// Funciones para crear un nuevo elemento
export const createArticle = async (article: Omit<Article, "id" | "createdAt">): Promise<Article> => {
  try {
    const response = await articleAPI.create({
      ...article,
      createdAt: new Date(),
    })
    return response.data
  } catch (error) {
    console.error("Error creating article:", error)
    // Fallback a localStorage si la API falla
    const articles = await getArticles()
    const newId = articles.length > 0 ? Math.max(...articles.map((a) => a.id || 0)) + 1 : 1

    const newArticle: Article = {
      ...article,
      id: newId,
      createdAt: new Date(),
    }

    articles.push(newArticle)
    saveArticles(articles)
    return newArticle
  }
}

export const createFaq = async (faq: Omit<FAQ, "id" | "createdAt">): Promise<FAQ> => {
  try {
    const response = await faqAPI.create({
      ...faq,
      createdAt: new Date(),
    })
    return response.data
  } catch (error) {
    console.error("Error creating FAQ:", error)
    // Fallback a localStorage si la API falla
    const faqs = await getFaqs()
    const newId = faqs.length > 0 ? Math.max(...faqs.map((f) => f.id || 0)) + 1 : 1

    const newFaq: FAQ = {
      ...faq,
      id: newId,
      createdAt: new Date(),
    }

    faqs.push(newFaq)
    saveFaqs(faqs)
    return newFaq
  }
}

export const createMessage = async (message: Omit<Message, "id" | "createdAt" | "status">): Promise<Message> => {
  try {
    const response = await messageAPI.create({
      ...message,
      status: "new",
      createdAt: new Date(),
    })
    return response.data
  } catch (error) {
    console.error("Error creating message:", error)
    // Fallback a localStorage si la API falla
    const messages = await getMessages()
    const newId = messages.length > 0 ? Math.max(...messages.map((m) => m.id || 0)) + 1 : 1

    const newMessage: Message = {
      ...message,
      id: newId,
      status: "new",
      createdAt: new Date(),
    }

    messages.push(newMessage)
    saveMessages(messages)
    return newMessage
  }
}

// Funciones para eliminar un elemento
export const deleteArticle = async (id: number | string): Promise<boolean> => {
  try {
    await articleAPI.delete(id.toString())
    return true
  } catch (error) {
    console.error("Error deleting article:", error)
    // Fallback a localStorage si la API falla
    const articles = await getArticles()
    const filteredArticles = articles.filter((article) => article.id !== id && article._id !== id)

    if (filteredArticles.length !== articles.length) {
      saveArticles(filteredArticles)
      return true
    }
    return false
  }
}

export const deleteFaq = async (id: number | string): Promise<boolean> => {
  try {
    await faqAPI.delete(id.toString())
    return true
  } catch (error) {
    console.error("Error deleting FAQ:", error)
    // Fallback a localStorage si la API falla
    const faqs = await getFaqs()
    const filteredFaqs = faqs.filter((faq) => faq.id !== id && faq._id !== id)

    if (filteredFaqs.length !== faqs.length) {
      saveFaqs(filteredFaqs)
      return true
    }
    return false
  }
}

export const deleteMessage = async (id: number | string): Promise<boolean> => {
  try {
    await messageAPI.delete(id.toString())
    return true
  } catch (error) {
    console.error("Error deleting message:", error)
    // Fallback a localStorage si la API falla
    const messages = await getMessages()
    const filteredMessages = messages.filter((message) => message.id !== id && message._id !== id)

    if (filteredMessages.length !== messages.length) {
      saveMessages(filteredMessages)
      return true
    }
    return false
  }
}

