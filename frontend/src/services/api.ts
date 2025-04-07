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

  getById: (id: string) => axios.get(`${API_URL}/faqs/${id}`),

  create: (data: any) => axios.post(`${API_URL}/faqs`, data),

  update: (id: string, data: any) => axios.put(`${API_URL}/faqs/${id}`, data),

  delete: (id: string) => axios.delete(`${API_URL}/faqs/${id}`),
}

// API para mensajes
export const messageAPI = {
  getAll: () => {
    console.log("Fetching all messages from:", `${API_URL}/messages`)
    return axios.get(`${API_URL}/messages`)
  },

  getById: (id: string) => axios.get(`${API_URL}/messages/${id}`),

  create: (data: any) => {
    console.log("Creating message:", data)
    return axios.post(`${API_URL}/messages`, data)
  },

  update: (id: string, data: any) => axios.put(`${API_URL}/messages/${id}`, data),

  delete: (id: string) => axios.delete(`${API_URL}/messages/${id}`),

  // Función para responder a mensajes
  reply: (id: string, replyText: string) => axios.post(`${API_URL}/messages/${id}/reply`, { replyText }),
}

export default {
  setAuthToken,
  authAPI,
  articleAPI,
  faqAPI,
  messageAPI,
}

