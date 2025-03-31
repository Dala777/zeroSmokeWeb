// frontend/src/services/storageService.ts

// Tipos
export interface Article {
    id: number
    title: string
    excerpt?: string
    content: string
    image?: string
    status: "published" | "draft"
    authorId: number
    author?: string
    createdAt: Date
    updatedAt?: Date
    tags: string[]
  }
  
  export interface FAQ {
    id: number
    question: string
    answer: string
    category: string
    createdAt: Date
    updatedAt?: Date
  }
  
  export interface Message {
    id: number
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
  
  // Funciones para cargar datos iniciales
  const getInitialArticles = (): Article[] => {
    return [
      {
        id: 1,
        title: "Efectos del tabaco en el sistema respiratorio",
        excerpt:
          "Los efectos nocivos del tabaco en el sistema respiratorio son extensos y bien documentados. Desde la irritación inmediata hasta enfermedades graves...",
        content:
          "Los efectos nocivos del tabaco en el sistema respiratorio son extensos y bien documentados. Desde la irritación inmediata hasta enfermedades graves a largo plazo, el tabaquismo afecta negativamente a todo el sistema respiratorio.\n\nEl humo del tabaco contiene más de 7,000 sustancias químicas, muchas de las cuales son tóxicas y dañinas para los pulmones. Algunas de estas sustancias son conocidas por causar cáncer.\n\n**Efectos a corto plazo:**\n- Irritación de las vías respiratorias\n- Aumento de la mucosidad\n- Tos y respiración sibilante\n- Dificultad para respirar durante el ejercicio\n\n**Efectos a largo plazo:**\n- Enfermedad Pulmonar Obstructiva Crónica (EPOC)\n- Cáncer de pulmón\n- Asma\n- Mayor susceptibilidad a infecciones respiratorias",
        image: "/placeholder.svg?height=200&width=300",
        status: "published",
        authorId: 1,
        author: "Admin Usuario",
        createdAt: new Date("2023-05-15"),
        tags: ["salud", "respiratorio", "tabaco", "pulmones"],
      },
      {
        id: 2,
        title: "Beneficios inmediatos al dejar de fumar",
        excerpt:
          "Dejar de fumar tiene beneficios inmediatos para la salud. En tan solo 20 minutos después de su último cigarrillo, su cuerpo comienza un proceso de recuperación...",
        content:
          "Dejar de fumar tiene beneficios inmediatos para la salud. En tan solo 20 minutos después de su último cigarrillo, su cuerpo comienza un proceso de recuperación que continúa durante años.\n\n**20 minutos después:** Su presión arterial y frecuencia cardíaca disminuyen.\n\n**12 horas después:** El nivel de monóxido de carbono en su sangre vuelve a la normalidad.\n\n**2 semanas a 3 meses después:** Su circulación mejora y la función pulmonar aumenta.\n\n**1 a 9 meses después:** La tos y la falta de aliento disminuyen; los cilios (pequeñas estructuras similares a pelos que mueven el moco fuera de los pulmones) comienzan a recuperar la función normal, aumentando la capacidad de manejar el moco, limpiar los pulmones y reducir el riesgo de infección.\n\n**1 año después:** El riesgo de enfermedad coronaria es aproximadamente la mitad que el de un fumador.",
        image: "/placeholder.svg?height=200&width=300",
        status: "published",
        authorId: 1,
        author: "Admin Usuario",
        createdAt: new Date("2023-06-02"),
        tags: ["beneficios", "salud", "tabaco"],
      },
      {
        id: 3,
        title: "Estrategias efectivas para dejar de fumar",
        excerpt:
          "Hay varias estrategias que han demostrado ser efectivas para ayudar a las personas a dejar de fumar. Desde terapias de reemplazo de nicotina hasta...",
        content:
          "Hay varias estrategias que han demostrado ser efectivas para ayudar a las personas a dejar de fumar. Desde terapias de reemplazo de nicotina hasta cambios en el estilo de vida, encontrar el enfoque adecuado puede marcar la diferencia en su viaje para dejar de fumar.",
        image: "/placeholder.svg?height=200&width=300",
        status: "draft",
        authorId: 1,
        author: "Admin Usuario",
        createdAt: new Date("2023-06-20"),
        tags: ["estrategias", "consejos", "tabaco"],
      },
      {
        id: 4,
        title: "El tabaquismo pasivo y sus riesgos",
        excerpt:
          "El tabaquismo pasivo, también conocido como humo de segunda mano, es la inhalación involuntaria del humo de tabaco por los no fumadores...",
        content:
          "El tabaquismo pasivo, también conocido como humo de segunda mano, es la inhalación involuntaria del humo de tabaco por los no fumadores. Este humo contiene más de 7,000 sustancias químicas, muchas de las cuales son tóxicas y pueden causar cáncer.",
        image: "/placeholder.svg?height=200&width=300",
        status: "published",
        authorId: 1,
        author: "Admin Usuario",
        createdAt: new Date("2023-07-05"),
        tags: ["tabaquismo pasivo", "riesgos", "salud"],
      },
    ]
  }
  
  const getInitialFaqs = (): FAQ[] => {
    return [
      {
        id: 1,
        question: "¿Cuáles son los beneficios inmediatos de dejar de fumar?",
        answer:
          "Los beneficios inmediatos incluyen una mejora en la circulación sanguínea, normalización de la presión arterial y la frecuencia cardíaca, y un aumento en los niveles de oxígeno en la sangre. Además, el sentido del gusto y el olfato comienzan a mejorar en pocos días.",
        category: "Beneficios",
        createdAt: new Date(),
      },
      {
        id: 2,
        question: "¿Cómo puedo manejar los antojos de nicotina?",
        answer:
          "Para manejar los antojos, puedes intentar técnicas como respiración profunda, beber agua, mantener las manos ocupadas con actividades, masticar chicle sin azúcar, y evitar situaciones que asocias con fumar. También puedes considerar terapias de reemplazo de nicotina como parches o chicles.",
        category: "Consejos",
        createdAt: new Date(),
      },
      {
        id: 3,
        question: "¿Cuánto tiempo duran los síntomas de abstinencia?",
        answer:
          "Los síntomas físicos de abstinencia suelen alcanzar su punto máximo en los primeros 3-5 días y disminuyen gradualmente durante 2-4 semanas. Sin embargo, los antojos psicológicos pueden persistir durante meses, aunque con menor frecuencia e intensidad con el tiempo.",
        category: "Abstinencia",
        createdAt: new Date(),
      },
      {
        id: 4,
        question: "¿Es efectiva la terapia de reemplazo de nicotina?",
        answer:
          "Sí, la terapia de reemplazo de nicotina (TRN) ha demostrado ser efectiva para ayudar a las personas a dejar de fumar. Proporciona nicotina en forma controlada sin las toxinas dañinas del humo del tabaco, ayudando a reducir los síntomas de abstinencia mientras se rompe el hábito.",
        category: "Tratamientos",
        createdAt: new Date(),
      },
    ]
  }
  
  const getInitialMessages = (): Message[] => {
    return [
      {
        id: 1,
        name: "Juan Pérez",
        email: "juan.perez@example.com",
        subject: "Consulta sobre el programa para dejar de fumar",
        message:
          "Hola, estoy interesado en el programa para dejar de fumar. Me gustaría saber cuánto tiempo dura y si tiene algún costo. Gracias de antemano por su respuesta.",
        status: "new",
        createdAt: new Date("2023-07-15T10:30:00"),
      },
      {
        id: 2,
        name: "María González",
        email: "maria.gonzalez@example.com",
        subject: "Problemas con la app",
        message:
          "Buenas tardes, he estado intentando registrarme en la aplicación pero me aparece un error cada vez que intento crear una cuenta. ¿Podrían ayudarme a solucionar este problema?",
        status: "read",
        createdAt: new Date("2023-07-14T15:45:00"),
      },
      {
        id: 3,
        name: "Carlos Rodríguez",
        email: "carlos.rodriguez@example.com",
        subject: "Agradecimiento",
        message:
          "Quería expresar mi agradecimiento por la ayuda que me ha brindado su programa. Llevo 3 meses sin fumar y me siento mejor que nunca. Muchas gracias por todo el apoyo.",
        status: "answered",
        createdAt: new Date("2023-07-13T09:20:00"),
      },
      {
        id: 4,
        name: "Ana Martínez",
        email: "ana.martinez@example.com",
        subject: "Solicitud de información adicional",
        message:
          "Hola, me gustaría recibir más información sobre los efectos del tabaco en el embarazo. ¿Tienen algún artículo o recurso sobre este tema en particular?",
        status: "new",
        createdAt: new Date("2023-07-12T14:10:00"),
      },
    ]
  }
  
  const getInitialHomePageData = (): HomePageData => {
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
  
  // Funciones para obtener datos
  export const getArticles = (): Article[] => {
    const storedArticles = localStorage.getItem("articles")
    if (storedArticles) {
      return JSON.parse(storedArticles, (key, value) => {
        if (key === "createdAt" || key === "updatedAt") {
          return value ? new Date(value) : null
        }
        return value
      })
    }
    const initialData = getInitialArticles()
    localStorage.setItem("articles", JSON.stringify(initialData))
    return initialData
  }
  
  export const getFaqs = (): FAQ[] => {
    const storedFaqs = localStorage.getItem("faqs")
    if (storedFaqs) {
      return JSON.parse(storedFaqs, (key, value) => {
        if (key === "createdAt" || key === "updatedAt") {
          return value ? new Date(value) : null
        }
        return value
      })
    }
    const initialData = getInitialFaqs()
    localStorage.setItem("faqs", JSON.stringify(initialData))
    return initialData
  }
  
  export const getMessages = (): Message[] => {
    const storedMessages = localStorage.getItem("messages")
    if (storedMessages) {
      return JSON.parse(storedMessages, (key, value) => {
        if (key === "createdAt" || key === "updatedAt") {
          return value ? new Date(value) : null
        }
        return value
      })
    }
    const initialData = getInitialMessages()
    localStorage.setItem("messages", JSON.stringify(initialData))
    return initialData
  }
  
  export const getHomePageData = (): HomePageData => {
    const storedData = localStorage.getItem("homePageData")
    if (storedData) {
      return JSON.parse(storedData)
    }
    const initialData = getInitialHomePageData()
    localStorage.setItem("homePageData", JSON.stringify(initialData))
    return initialData
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
  export const getArticleById = (id: number): Article | undefined => {
    const articles = getArticles()
    return articles.find((article) => article.id === id)
  }
  
  export const getFaqById = (id: number): FAQ | undefined => {
    const faqs = getFaqs()
    return faqs.find((faq) => faq.id === id)
  }
  
  export const getMessageById = (id: number): Message | undefined => {
    const messages = getMessages()
    return messages.find((message) => message.id === id)
  }
  
  // Funciones para actualizar un elemento
  export const updateArticle = (id: number, updatedArticle: Partial<Article>): Article | undefined => {
    const articles = getArticles()
    const index = articles.findIndex((article) => article.id === id)
  
    if (index !== -1) {
      articles[index] = { ...articles[index], ...updatedArticle, updatedAt: new Date() }
      saveArticles(articles)
      return articles[index]
    }
  
    return undefined
  }
  
  export const updateFaq = (id: number, updatedFaq: Partial<FAQ>): FAQ | undefined => {
    const faqs = getFaqs()
    const index = faqs.findIndex((faq) => faq.id === id)
  
    if (index !== -1) {
      faqs[index] = { ...faqs[index], ...updatedFaq, updatedAt: new Date() }
      saveFaqs(faqs)
      return faqs[index]
    }
  
    return undefined
  }
  
  export const updateMessage = (id: number, updatedMessage: Partial<Message>): Message | undefined => {
    const messages = getMessages()
    const index = messages.findIndex((message) => message.id === id)
  
    if (index !== -1) {
      messages[index] = { ...messages[index], ...updatedMessage, updatedAt: new Date() }
      saveMessages(messages)
      return messages[index]
    }
  
    return undefined
  }
  
  export const updateHomePageData = (updatedData: Partial<HomePageData>): HomePageData => {
    const currentData = getHomePageData()
    const newData = { ...currentData, ...updatedData }
    saveHomePageData(newData)
    return newData
  }
  
  // Funciones para crear un nuevo elemento
  export const createArticle = (article: Omit<Article, "id" | "createdAt">): Article => {
    const articles = getArticles()
    const newId = articles.length > 0 ? Math.max(...articles.map((a) => a.id)) + 1 : 1
  
    const newArticle: Article = {
      ...article,
      id: newId,
      createdAt: new Date(),
    }
  
    articles.push(newArticle)
    saveArticles(articles)
    return newArticle
  }
  
  export const createFaq = (faq: Omit<FAQ, "id" | "createdAt">): FAQ => {
    const faqs = getFaqs()
    const newId = faqs.length > 0 ? Math.max(...faqs.map((f) => f.id)) + 1 : 1
  
    const newFaq: FAQ = {
      ...faq,
      id: newId,
      createdAt: new Date(),
    }
  
    faqs.push(newFaq)
    saveFaqs(faqs)
    return newFaq
  }
  
  export const createMessage = (message: Omit<Message, "id" | "createdAt" | "status">): Message => {
    const messages = getMessages()
    const newId = messages.length > 0 ? Math.max(...messages.map((m) => m.id)) + 1 : 1
  
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
  
  // Funciones para eliminar un elemento
  export const deleteArticle = (id: number): boolean => {
    const articles = getArticles()
    const filteredArticles = articles.filter((article) => article.id !== id)
  
    if (filteredArticles.length !== articles.length) {
      saveArticles(filteredArticles)
      return true
    }
  
    return false
  }
  
  export const deleteFaq = (id: number): boolean => {
    const faqs = getFaqs()
    const filteredFaqs = faqs.filter((faq) => faq.id !== id)
  
    if (filteredFaqs.length !== faqs.length) {
      saveFaqs(filteredFaqs)
      return true
    }
  
    return false
  }
  
  export const deleteMessage = (id: number): boolean => {
    const messages = getMessages()
    const filteredMessages = messages.filter((message) => message.id !== id)
  
    if (filteredMessages.length !== messages.length) {
      saveMessages(filteredMessages)
      return true
    }
  
    return false
  }
  
  