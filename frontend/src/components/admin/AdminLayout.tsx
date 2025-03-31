"use client"

import type React from "react"
import { useState } from "react"
import styled from "styled-components"
import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { AppColors } from "../../styles/colors"
import Button from "../ui/Button"

const AdminContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${AppColors.background};
`

const Sidebar = styled.aside<{ isOpen: boolean }>`
  width: ${(props) => (props.isOpen ? "250px" : "0")};
  background-color: ${AppColors.cardBackground};
  transition: width 0.3s ease;
  overflow-x: hidden;
  position: fixed;
  height: 100vh;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  
  @media (min-width: 768px) {
    position: sticky;
    top: 0;
    width: 250px;
  }
`

const SidebarHeader = styled.div`
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${AppColors.primary};
  
  span {
    color: ${AppColors.text};
  }
`

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${AppColors.text};
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  
  @media (min-width: 768px) {
    display: none;
  }
`

const SidebarContent = styled.div`
  padding: 1rem 0;
  overflow-y: auto;
  height: calc(100vh - 120px);
`

const SidebarFooter = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: absolute;
  bottom: 0;
  width: 100%;
`

const MenuSection = styled.div`
  margin-bottom: 1.5rem;
`

const MenuTitle = styled.h3`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${AppColors.textSecondary};
  padding: 0 1.5rem;
  margin-bottom: 0.5rem;
`

const MenuItem = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: ${AppColors.text};
  text-decoration: none;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: ${AppColors.primary};
  }
  
  &.active {
    background-color: rgba(76, 175, 80, 0.1);
    color: ${AppColors.primary};
    border-left: 3px solid ${AppColors.primary};
  }
`

const MenuIcon = styled.span`
  margin-right: 0.75rem;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
`

const Content = styled.main<{ isSidebarOpen: boolean }>`
  flex: 1;
  padding: 1.5rem;
  transition: margin-left 0.3s ease;
  
  @media (max-width: 767px) {
    margin-left: ${(props) => (props.isSidebarOpen ? "250px" : "0")};
    width: 100%;
  }
`

const TopBar = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`

const PageTitle = styled.h1`
  font-size: 1.5rem;
  color: ${AppColors.primary};
`

const MenuButton = styled.button`
  background: none;
  border: none;
  color: ${AppColors.text};
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  
  @media (min-width: 768px) {
    display: none;
  }
`

const UserInfo = styled.div`
  display: flex;
  align-items: center;
`

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${AppColors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  margin-right: 0.75rem;
`

const UserName = styled.div`
  font-weight: 500;
`

const UserRole = styled.div`
  font-size: 0.75rem;
  color: ${AppColors.textSecondary};
`

// Reemplazar los estilos inline con componentes styled
const MenuButtonContainer = styled.div`
  display: flex;
  align-items: center;
`

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  const handleLogout = () => {
    // Add logout logic here
    navigate("/login")
  }

  // Mock user data
  const user = {
    name: "Admin User",
    role: "admin",
  }

  return (
    <AdminContainer>
      <Sidebar isOpen={sidebarOpen}>
        <SidebarHeader>
          <Logo>
            Zero<span>Smoke</span>
          </Logo>
          <CloseButton onClick={closeSidebar}>✕</CloseButton>
        </SidebarHeader>

        <SidebarContent>
          <MenuSection>
            <MenuTitle>Panel Principal</MenuTitle>
            <MenuItem to="/admin/dashboard" onClick={closeSidebar}>
              <MenuIcon>📊</MenuIcon> Dashboard
            </MenuItem>
          </MenuSection>

          <MenuSection>
            <MenuTitle>Contenido</MenuTitle>
            <MenuItem to="/admin/homepage" onClick={closeSidebar}>
              <MenuIcon>🏠</MenuIcon> Página de Inicio
            </MenuItem>
            <MenuItem to="/admin/articles" onClick={closeSidebar}>
              <MenuIcon>📰</MenuIcon> Artículos
            </MenuItem>
            <MenuItem to="/admin/faqs" onClick={closeSidebar}>
              <MenuIcon>❓</MenuIcon> FAQs
            </MenuItem>
          </MenuSection>

          <MenuSection>
            <MenuTitle>Usuarios</MenuTitle>
            <MenuItem to="/admin/users" onClick={closeSidebar}>
              <MenuIcon>👥</MenuIcon> Gestión de Usuarios
            </MenuItem>
            <MenuItem to="/admin/admins" onClick={closeSidebar}>
              <MenuIcon>🔑</MenuIcon> Administradores
            </MenuItem>
          </MenuSection>

          <MenuSection>
            <MenuTitle>Comunicación</MenuTitle>
            <MenuItem to="/admin/messages" onClick={closeSidebar}>
              <MenuIcon>✉️</MenuIcon> Mensajes
            </MenuItem>
          </MenuSection>

          <MenuSection>
            <MenuTitle>Configuración</MenuTitle>
            <MenuItem to="/admin/settings" onClick={closeSidebar}>
              <MenuIcon>⚙️</MenuIcon> Configuración
            </MenuItem>
          </MenuSection>
        </SidebarContent>

        <SidebarFooter>
          <Button variant="outline" size="small" fullWidth onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </SidebarFooter>
      </Sidebar>

      <Content isSidebarOpen={sidebarOpen}>
        <TopBar>
          <MenuButtonContainer>
            <MenuButton onClick={toggleSidebar}>☰</MenuButton>
            <PageTitle>Panel de Administración</PageTitle>
          </MenuButtonContainer>

          <UserInfo>
            <UserAvatar>{user?.name?.charAt(0) || "A"}</UserAvatar>
            <div>
              <UserName>{user?.name || "Admin Usuario"}</UserName>
              <UserRole>{user?.role === "admin" ? "Administrador" : "Usuario"}</UserRole>
            </div>
          </UserInfo>
        </TopBar>

        <Outlet />
      </Content>
    </AdminContainer>
  )
}

export default AdminLayout

