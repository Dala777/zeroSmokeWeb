"use client"

import type React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import GlobalStyles from "./styles/GlobalStyles"
import Layout from "./components/layout/Layout"
import HomePage from "./pages/HomePage"
import ArticlesPage from "./pages/ArticlesPage"
import FaqsPage from "./pages/FaqsPage"
import AdminLayout from "./components/admin/AdminLayout"
import Dashboard from "./pages/admin/Dashboard"
import HomePageEdit from "./pages/admin/HomePage"
import ArticlesList from "./pages/admin/ArticlesList"
import ArticleEdit from "./pages/admin/ArticleEdit"
import FaqsList from "./pages/admin/FaqsList"
import UsersList from "./pages/admin/UsersList"
import MessagesList from "./pages/admin/MessagesList"
import LoginPage from "./pages/LoginPage"
import Chatbot from "./components/Chatbot"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
// Añadir la importación para ArticleDetailPage
import ArticleDetailPage from "./pages/ArticleDetailPage"
// Añadir la importación para ChatbotProvider
import { ChatbotProvider } from "./components/ChatbotContext"
// Añadir la importación para ContactPage
import ContactPage from "./pages/ContactPage"

// Componente protegido para rutas de administración
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div>Cargando...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return <>{children}</>
}

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <GlobalStyles />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="homepage" element={<HomePageEdit />} />
          <Route path="articles" element={<ArticlesList />} />
          <Route path="articles/new" element={<ArticleEdit />} />
          <Route path="articles/edit/:id" element={<ArticleEdit />} />
          <Route path="faqs" element={<FaqsList />} />
          <Route path="users" element={<UsersList />} />
          <Route path="messages" element={<MessagesList />} />
        </Route>

        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/articulos" element={<ArticlesPage />} />
                <Route path="/articles/:id" element={<ArticleDetailPage />} />
                <Route path="/faqs" element={<FaqsPage />} />
                <Route path="/contacto" element={<ContactPage />} />
                {/* Add more routes as needed */}
              </Routes>
              <Chatbot />
            </Layout>
          }
        />
      </Routes>
    </Router>
  )
}

// Modificar el componente App para incluir el ChatbotProvider
const App: React.FC = () => {
  return (
    <AuthProvider>
      <ChatbotProvider>
        <AppRoutes />
      </ChatbotProvider>
    </AuthProvider>
  )
}

export default App

