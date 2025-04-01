"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "styled-components"
import { AppColors } from "./styles/colors"
import { authAPI } from "./services/api"
import type { User } from "./types"

// Componentes de layout
import Header from "./components/layout/Header"
import Footer from "./components/layout/Footer"
import Sidebar from "./components/layout/Sidebar"
import { ChatbotProvider } from "./components/ChatbotContext"

// Páginas públicas
import HomePage from "./pages/HomePage"
import ArticlesPage from "./pages/ArticlesPage"
import ArticleDetailPage from "./pages/ArticleDetailPage"
import FaqsPage from "./pages/FaqsPage"
import ContactPage from "./pages/ContactPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"

// Páginas de administración
import AdminDashboard from "./pages/admin/Dashboard"
import ArticlesList from "./pages/admin/ArticlesList"
import ArticleForm from "./pages/admin/ArticleForm"
import FaqsList from "./pages/admin/FaqsList"
import FaqForm from "./pages/admin/FaqForm"
import MessagesList from "./pages/admin/MessagesList"
import MessageDetail from "./pages/admin/MessageDetail"
import UsersList from "./pages/admin/UsersList"
import UserForm from "./pages/admin/UserForm"
import SettingsPage from "./pages/admin/SettingsPage"

// Estilos globales
import GlobalStyle from "./styles/GlobalStyle"

// Ruta protegida para administradores
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setIsAdmin(false)
          setLoading(false)
          return
        }

        const response = await authAPI.getProfile()
        setIsAdmin(response.data.role === "admin")
      } catch (error) {
        console.error("Error checking admin status:", error)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [])

  if (loading) {
    return <div>Cargando...</div>
  }

  return isAdmin ? <>{children}</> : <Navigate to="/login" />
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setUser(null)
          setLoading(false)
          return
        }

        const response = await authAPI.getProfile()
        setUser(response.data)
      } catch (error) {
        console.error("Error fetching user:", error)
        localStorage.removeItem("token")
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    setUser(null)
    window.location.href = "/"
  }

  return (
    <ThemeProvider theme={{ colors: AppColors }}>
      <ChatbotProvider>
        <GlobalStyle />
        <Router>
          <div className="app">
            <Header user={user} onLogout={handleLogout} />
            <div className="content">
              {user?.role === "admin" && <Sidebar />}
              <main className={user?.role === "admin" ? "with-sidebar" : ""}>
                <Routes>
                  {/* Rutas públicas */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/articles" element={<ArticlesPage />} />
                  <Route path="/articles/:id" element={<ArticleDetailPage />} />
                  <Route path="/faqs" element={<FaqsPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/login" element={<LoginPage setUser={setUser} />} />
                  <Route path="/register" element={<RegisterPage setUser={setUser} />} />

                  {/* Rutas de administración */}
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/articles"
                    element={
                      <AdminRoute>
                        <ArticlesList />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/articles/new"
                    element={
                      <AdminRoute>
                        <ArticleForm />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/articles/edit/:id"
                    element={
                      <AdminRoute>
                        <ArticleForm />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/faqs"
                    element={
                      <AdminRoute>
                        <FaqsList />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/faqs/new"
                    element={
                      <AdminRoute>
                        <FaqForm />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/faqs/edit/:id"
                    element={
                      <AdminRoute>
                        <FaqForm />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/messages"
                    element={
                      <AdminRoute>
                        <MessagesList />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/messages/:id"
                    element={
                      <AdminRoute>
                        <MessageDetail />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <AdminRoute>
                        <UsersList />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/users/new"
                    element={
                      <AdminRoute>
                        <UserForm />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/users/edit/:id"
                    element={
                      <AdminRoute>
                        <UserForm />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/settings"
                    element={
                      <AdminRoute>
                        <SettingsPage />
                      </AdminRoute>
                    }
                  />
                </Routes>
              </main>
            </div>
            <Footer />
          </div>
        </Router>
      </ChatbotProvider>
    </ThemeProvider>
  )
}

export default App

