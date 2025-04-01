"use client"

import type React from "react"
import styled from "styled-components"
import Header from "./Header"
import Footer from "./Footer"
import { useAuth } from "../../contexts/AuthContext" // Vamos a crear este contexto

const Main = styled.main`
  flex: 1;
  min-height: calc(100vh - 120px); // Ajustar según la altura del header y footer
`

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth() // Obtenemos el usuario y la función de logout del contexto

  return (
    <>
      <Header user={user} onLogout={logout} />
      <Main>{children}</Main>
      <Footer />
    </>
  )
}

export default Layout

