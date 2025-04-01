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

// Obtener token del localStorage
const token = localStorage.getItem("token")
if (token) {
  setAuthToken(token)
}

// API para autenticación
export const authAPI = {
  login: (data: { email: string; password: string }) => axios.post(`${API_URL}/auth/login`, data),

  register: (data: { name: string; email: string; password: string }) => axios.post(`${API_URL}/auth/register`, data),

  getProfile: () => axios.get(`${API_URL}/auth/profile`),
}

// API para artículos
export const articleAPI = {
  getAll: () => axios.get(`${API_URL}/articles`),

  getById: (id: string) => axios.get(`${API_URL}/articles/${id}`),

  create: (data: any) => axios.post(`${API_URL}/articles`, data),

  update: (id: string, data: any) => axios.put(`${API_URL}/articles/${id}`, data),

  delete: (id: string) => axios.delete(`${API_URL}/articles/${id}`),
}

// API para FAQs
export const faqAPI = {
  getAll: () => axios.get(`${API_URL}/faqs`),

  getById: (id: string) => axios.get(`${API_URL}/faqs/${id}`),

  create: (data: any) => axios.post(`${API_URL}/faqs`, data),

  update: (id: string, data: any) => axios.put(`${API_URL}/faqs/${id}`, data),

  delete: (id: string) => axios.delete(`${API_URL}/faqs/${id}`),
}

// API para mensajes
export const messageAPI = {
  getAll: () => axios.get(`${API_URL}/messages`),

  getById: (id: string) => axios.get(`${API_URL}/messages/${id}`),

  create: (data: any) => axios.post(`${API_URL}/messages`, data),

  update: (id: string, data: any) => axios.put(`${API_URL}/messages/${id}`, data),

  delete: (id: string) => axios.delete(`${API_URL}/messages/${id}`),
}

