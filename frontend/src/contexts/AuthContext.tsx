"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import { authAPI } from "../services/api"

interface User {
  _id: string
  name: string
  email: string
  role: string
}

interface AuthContextType {
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  user: User | null
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  loading: true,
  login: async () => false,
  logout: () => {},
  user: null,
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Verificar si hay un token guardado
    const token = localStorage.getItem("token")

    if (token) {
      // Verificar si el token es válido
      authAPI
        .getProfile()
        .then((response) => {
          setUser(response.data)
          setIsAuthenticated(true)
        })
        .catch(() => {
          // Si hay un error, limpiar el token
          localStorage.removeItem("token")
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login({ email, password })
      const { token, user } = response.data

      localStorage.setItem("token", token)
      setUser(user)
      setIsAuthenticated(true)

      return true
    } catch (error) {
      console.error("Error during login:", error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout, user }}>{children}</AuthContext.Provider>
  )
}

