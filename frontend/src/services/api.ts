import axios from "axios"

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

// Configurar axios con el token
const setAuthToken = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
  } else {
    delete axios.defaults.headers.common["Authorization"]
  }
}

// Obtener token del localStorage al iniciar
const token = localStorage.getItem("token")
if (token) {
  setAuthToken(token)
}

// Interceptor para manejar errores
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response || error)

    // Si el error es 401 (no autorizado) y no estamos en la página de login
    if (error.response && error.response.status === 401 && !window.location.pathname.includes("/login")) {
      // Limpiar token y redirigir a login
      localStorage.removeItem("token")
      window.location.href = "/login"
    }

    return Promise.reject(error)
  },
)

// API para autenticación
export const authAPI = {
  login: (data: { email: string; password: string }) => axios.post(`${API_URL}/auth/login`, data),

  register: (data: { name: string; email: string; password: string }) => axios.post(`${API_URL}/auth/register`, data),

  getProfile: () => axios.get(`${API_URL}/auth/profile`),
}

// API para artículos
export const articleAPI = {
  getAll: () => {
    console.log("Fetching all articles from:", `${API_URL}/articles`)
    return axios.get(`${API_URL}/articles`)
  },

  getById: (id: string) => axios.get(`${API_URL}/articles/${id}`),

  create: (data: any) => axios.post(`${API_URL}/articles`, data),

  update: (id: string, data: any) => axios.put(`${API_URL}/articles/${id}`, data),

  delete: (id: string) => axios.delete(`${API_URL}/articles/${id}`),
}

// API para FAQs
export const faqAPI = {
  getAll: () => {
    console.log("Fetching all FAQs from:", `${API_URL}/faqs`)
    return axios.get(`${API_URL}/faqs`)
  },

  getActive: () => {
    console.log("Fetching active FAQs from:", `${API_URL}/faqs/active`)
    return axios.get(`${API_URL}/faqs/active`)
  },

  getById: (id: string) => axios.get(`${API_URL}/faqs/${id}`),

  create: (data: any) => axios.post(`${API_URL}/faqs`, data),

  update: (id: string, data: any) => axios.put(`${API_URL}/faqs/${id}`, data),

  delete: (id: string) => axios.delete(`${API_URL}/faqs/${id}`),

  toggleStatus: (id: string) => axios.patch(`${API_URL}/faqs/${id}/toggle-status`),

  reorder: (faqIds: string[]) => axios.put(`${API_URL}/faqs/reorder`, { faqIds }),
}

// API para mensajes
export const messageAPI = {
  getAll: () => {
    console.log("Fetching all messages from:", `${API_URL}/messages`)
    return axios.get(`${API_URL}/messages`)
  },

  getById: (id: string) => {
    console.log("Fetching message details from:", `${API_URL}/messages/${id}`)
    return axios.get(`${API_URL}/messages/${id}`)
  },

  create: (data: any) => {
    console.log("Creating message:", data)
    return axios.post(`${API_URL}/messages`, data)
  },

  update: (id: string, data: any) => {
    console.log("Updating message:", id, data)
    return axios.put(`${API_URL}/messages/${id}`, data)
  },

  delete: (id: string) => {
    console.log("Deleting message:", id)
    return axios.delete(`${API_URL}/messages/${id}`)
  },

  // Función para responder a mensajes
  reply: (id: string, replyText: string) => {
    console.log("Replying to message:", id, replyText)
    return axios.post(`${API_URL}/messages/${id}/reply`, { replyText })
  },
}

// API para progreso y tests
export const progressAPI = {
  saveInitialTest: (data: {
    cigarettesPerDay: number
    packagePrice: number
    dependencyLevel: string
    fagerstromScore?: number
    motivations?: string[]
  }) => axios.post(`${API_URL}/progress/initial-test`, data),

  getUserProgress: () => axios.get(`${API_URL}/progress/user-progress`),
  updateUserProgress: (data: any) => axios.put(`${API_URL}/progress/user-progress`, data),
}

// API para reportes
export const reportAPI = {
  getSystem: (format?: string) => {
    const params = format ? { format } : {}
    return axios.get(`${API_URL}/admin/reports/system`, { params })
  },

  getUsers: (format?: string) => {
    const params = format ? { format } : {}
    return axios.get(`${API_URL}/admin/reports/users`, { params })
  },

  getProgress: (format?: string) => {
    const params = format ? { format } : {}
    return axios.get(`${API_URL}/admin/reports/progress`, { params })
  },

  getAcademic: (format?: string) => {
    const params = format ? { format } : {}
    return axios.get(`${API_URL}/admin/reports/academic`, { params })
  },

  downloadExport: async (type: string, format: string) => {
    const response = await axios.get(`${API_URL}/admin/reports/${type}`, {
      params: { format },
      responseType: "blob",
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement("a")
    link.href = url
    const ext = format === "pdf" ? "pdf" : format === "xlsx" ? "xlsx" : "csv"
    link.setAttribute("download", `ZeroSmoke_${type}_${new Date().toISOString().split("T")[0]}.${ext}`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}

export const publicChatAPI = {
  sendMessage: (data: { message: string; history?: { role: string; text: string }[] }) => {
    console.log("Sending public chat message to:", `${API_URL}/chat/public`)
    return axios.post(`${API_URL}/chat/public`, data)
  },
}

export default {
  setAuthToken,
  authAPI,
  articleAPI,
  faqAPI,
  messageAPI,
  progressAPI,
  reportAPI,
  publicChatAPI,
}

