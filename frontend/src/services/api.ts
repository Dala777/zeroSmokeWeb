// frontend/src/services/api.ts
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Servicios de autenticación
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
    }
    
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
  },
  
  getProfile: async () => {
    return api.get('/auth/profile');
  },
};

// Servicios de artículos
export const articleService = {
  getAll: async (status?: string) => {
    const params = status ? { status } : {};
    return api.get('/articles', { params });
  },
  
  getById: async (id: number) => {
    return api.get(`/articles/${id}`);
  },
  
  create: async (article: any) => {
    return api.post('/articles', article);
  },
  
  update: async (id: number, article: any) => {
    return api.put(`/articles/${id}`, article);
  },
  
  delete: async (id: number) => {
    return api.delete(`/articles/${id}`);
  },
};

// Servicios de mensajes
export const messageService = {
  getAll: async (status?: string) => {
    const params = status ? { status } : {};
    return api.get('/messages', { params });
  },
  
  getById: async (id: number) => {
    return api.get(`/messages/${id}`);
  },
  
  create: async (message: any) => {
    return api.post('/messages', message);
  },
  
  update: async (id: number, status: string) => {
    return api.put(`/messages/${id}`, { status });
  },
  
  respond: async (id: number, responseText: string) => {
    return api.post(`/messages/${id}/respond`, { responseText });
  },
  
  delete: async (id: number) => {
    return api.delete(`/messages/${id}`);
  },
};

// Servicios de FAQs
export const faqService = {
  getAll: async (category?: string) => {
    const params = category ? { category } : {};
    return api.get('/faqs', { params });
  },
  
  getById: async (id: number) => {
    return api.get(`/faqs/${id}`);
  },
  
  create: async (faq: any) => {
    return api.post('/faqs', faq);
  },
  
  update: async (id: number, faq: any) => {
    return api.put(`/faqs/${id}`, faq);
  },
  
  delete: async (id: number) => {
    return api.delete(`/faqs/${id}`);
  },
};

// Servicios de usuarios
export const userService = {
  getAll: async () => {
    return api.get('/users');
  },
  
  getById: async (id: number) => {
    return api.get(`/users/${id}`);
  },
  
  create: async (user: any) => {
    return api.post('/users', user);
  },
  
  update: async (id: number, user: any) => {
    return api.put(`/users/${id}`, user);
  },
};

export default api;