"use client"

import React from "react"
import { useState, useEffect } from "react"
import styled from "styled-components"
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom"
import { AppColors } from "../../styles/colors"
import Button from "../ui/Button"
import { useAuth } from "../../contexts/AuthContext"
import { ChevronRight, LayoutDashboard, BarChart2, Brain, Home, FileText, HelpCircle, Users, Shield, MessageSquare, Settings, LogOut } from "lucide-react"

const AdminContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: 'Poppins', sans-serif;
`

const Sidebar = styled.aside<{ isOpen: boolean }>`
  width: ${(props) => (props.isOpen ? "280px" : "0")};
  background-color: ${AppColors.cardBackground};
  transition: width 0.3s ease;
  overflow-x: hidden;
  position: fixed;
  height: 100vh;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  z-index: 10;
  display: flex;
  flex-direction: column;
  
  @media (min-width: 768px) {
    position: sticky;
    top: 0;
    width: 280px;
  }
`

const SidebarHeader = styled.div`
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`

const BrandLogo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1F2937;
  
  span {
    color: #22C55E;
  }
`

const SeparatorLine = styled.div`
  height: 1px;
  background: rgba(0, 0, 0, 0.08);
  margin: 0 1.5rem 0.5rem;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${AppColors.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  @media (min-width: 768px) {
    display: none;
  }
`

const SidebarContent = styled.div`
  padding: 1rem 0;
  overflow-y: auto;
  height: calc(100vh - 180px);
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
`

const SidebarFooter = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: auto;
`

const MenuSection = styled.div`
  margin-bottom: 1.5rem;
`

const MenuTitle = styled.h3`
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #9CA3AF;
  padding: 0 1.5rem;
  margin: 1.25rem 0 0.5rem;
  font-weight: 600;
`

const MenuTitleFirst = styled(MenuTitle)`
  margin-top: 0.75rem;
`

const MenuItem = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 10px 16px;
  margin: 0 10px;
  border-radius: 8px;
  color: #6B7280;
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
    color: #22C55E;
  }
  
  &.active {
    background-color: #f0fdf4;
    color: #22C55E;
    font-weight: 500;
  }
`

const MenuIcon = styled.span`
  margin-right: 0.75rem;
  font-size: 1.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
`

const Content = styled.main<{ isSidebarOpen: boolean }>`
  flex: 1;
  padding: 1.5rem;
  transition: margin-left 0.3s ease;
  
  @media (max-width: 767px) {
    margin-left: ${(props) => (props.isSidebarOpen ? "280px" : "0")};
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

const PageTitle = styled.div`
  display: flex;
  align-items: center;
`

const PageTitleText = styled.h1`
  font-size: 1.5rem;
  color: ${AppColors.primary};
  font-weight: 600;
`

const BreadcrumbContainer = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: ${AppColors.textSecondary};
  margin-bottom: 0.5rem;
`

const BreadcrumbItem = styled.span`
  display: flex;
  align-items: center;
  
  &:not(:last-child) {
    margin-right: 0.5rem;
  }
`

const BreadcrumbSeparator = styled.span`
  margin: 0 0.5rem;
  opacity: 0.5;
`

const MenuButton = styled.button`
  background: none;
  border: none;
  color: ${AppColors.text};
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  @media (min-width: 768px) {
    display: none;
  }
`

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  background-color: ${AppColors.cardBackground};
  padding: 0.5rem 1rem;
  border-radius: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`

const UserName = styled.div`
  font-weight: 500;
  font-size: 0.9rem;
`

const UserRole = styled.div`
  font-size: 0.75rem;
  color: ${AppColors.textSecondary};
`

const MenuButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const DashboardContent = styled.div`
  animation: fadeIn 0.5s ease;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`

const ContentWrapper = styled.div`
  flex: 1;
  margin-left: 280px;
  padding: 30px;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    margin-left: 0;
  }
`

const PageHeader = styled.div`
  margin-bottom: 30px;
  
  h1 {
    font-size: 28px;
    font-weight: 700;
    color: ${AppColors.textSecondary};
    margin: 0 0 10px 0;
  }
  
  p {
    color: ${AppColors.text};
    margin: 0;
  }
`

const ContentCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  padding: 24px;
`

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const [isLargeScreen, setIsLargeScreen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  useEffect(() => {
    if (isLargeScreen) {
      setSidebarOpen(true)
    }
  }, [isLargeScreen])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  // Generar breadcrumbs basados en la ruta actual
  const generateBreadcrumbs = () => {
    const paths = location.pathname.split("/").filter((path) => path)

    if (paths.length <= 1) {
      return (
        <BreadcrumbContainer>
          <BreadcrumbItem>Dashboard</BreadcrumbItem>
        </BreadcrumbContainer>
      )
    }

    return (
      <BreadcrumbContainer>
        <BreadcrumbItem>
          <NavLink to="/admin/dashboard" style={{ color: "inherit", opacity: 0.7 }}>
            Dashboard
          </NavLink>
        </BreadcrumbItem>
        {paths.slice(1).map((path, index) => (
          <React.Fragment key={index}>
            <BreadcrumbSeparator>
              <ChevronRight size={14} />
            </BreadcrumbSeparator>
            <BreadcrumbItem>{path.charAt(0).toUpperCase() + path.slice(1)}</BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbContainer>
    )
  }

  // Determinar el título de la página basado en la ruta actual
  const getPageTitle = () => {
    const path = location.pathname

    if (path.includes("/dashboard")) return "Dashboard"
    if (path.includes("/homepage")) return "Página de Inicio"
    if (path.includes("/articles")) return "Artículos"
    if (path.includes("/faqs")) return "FAQs"
    if (path.includes("/users")) return "Gestión de Usuarios"
    if (path.includes("/admins")) return "Administradores"
    if (path.includes("/messages")) return "Mensajes"
    if (path.includes("/analytics")) return "Analytics Avanzado"
    if (path.includes("/data-science")) return "Ciencia de Datos"
    if (path.includes("/settings")) return "Configuración"

    return "Panel de Administración"
  }

  return (
    <AdminContainer>
      <Sidebar isOpen={sidebarOpen}>
        <SidebarHeader>
          <BrandLogo>
            Zero<span>Smoke</span>
          </BrandLogo>
          <CloseButton onClick={closeSidebar}>✕</CloseButton>
        </SidebarHeader>
        <SeparatorLine />

        <SidebarContent>
          <MenuSection>
            <MenuTitleFirst>Panel Principal</MenuTitleFirst>
            <MenuItem to="/admin/dashboard" onClick={closeSidebar}>
              <MenuIcon><LayoutDashboard size={18} /></MenuIcon> Dashboard
            </MenuItem>
            <MenuItem to="/admin/analytics" onClick={closeSidebar}>
              <MenuIcon><BarChart2 size={18} /></MenuIcon> Analytics Avanzado
            </MenuItem>
            <MenuItem to="/admin/data-science" onClick={closeSidebar}>
              <MenuIcon><Brain size={18} /></MenuIcon> Ciencia de Datos
            </MenuItem>
            <MenuItem to="/admin/data-science-v2" onClick={closeSidebar}>
              <MenuIcon><Brain size={18} /></MenuIcon> Data Science v2 (Académico)
            </MenuItem>
          </MenuSection>

          <MenuSection>
            <MenuTitle>Contenido</MenuTitle>
            <MenuItem to="/admin/homepage" onClick={closeSidebar}>
              <MenuIcon><Home size={18} /></MenuIcon> Página de Inicio
            </MenuItem>
            <MenuItem to="/admin/articles" onClick={closeSidebar}>
              <MenuIcon><FileText size={18} /></MenuIcon> Artículos
            </MenuItem>
            <MenuItem to="/admin/faqs" onClick={closeSidebar}>
              <MenuIcon><HelpCircle size={18} /></MenuIcon> FAQs
            </MenuItem>
          </MenuSection>

          <MenuSection>
            <MenuTitle>Usuarios</MenuTitle>
            <MenuItem to="/admin/users" onClick={closeSidebar}>
              <MenuIcon><Users size={18} /></MenuIcon> Gestión de Usuarios
            </MenuItem>
            <MenuItem to="/admin/admins" onClick={closeSidebar}>
              <MenuIcon><Shield size={18} /></MenuIcon> Administradores
            </MenuItem>
          </MenuSection>

          <MenuSection>
            <MenuTitle>Comunicación</MenuTitle>
            <MenuItem to="/admin/messages" onClick={closeSidebar}>
              <MenuIcon><MessageSquare size={18} /></MenuIcon> Mensajes
            </MenuItem>
          </MenuSection>

          <MenuSection>
            <MenuTitle>Configuración</MenuTitle>
            <MenuItem to="/admin/settings" onClick={closeSidebar}>
              <MenuIcon><Settings size={18} /></MenuIcon> Configuración
            </MenuItem>
          </MenuSection>
        </SidebarContent>

        <SidebarFooter>
          <Button variant="outline" size="small" fullWidth onClick={handleLogout}>
            <LogOut size={16} style={{ marginRight: 8 }} /> Cerrar Sesión
          </Button>
        </SidebarFooter>
      </Sidebar>

      <Content isSidebarOpen={sidebarOpen}>
        <TopBar>
          <MenuButtonContainer>
            <MenuButton onClick={toggleSidebar}>☰</MenuButton>
            <PageTitle>
              {generateBreadcrumbs()}
              <PageTitleText>{getPageTitle()}</PageTitleText>
            </PageTitle>
          </MenuButtonContainer>

          <UserInfo>
            <UserAvatar>{user?.name?.charAt(0) || "A"}</UserAvatar>
            <UserDetails>
              <UserName>{user?.name || "Admin Usuario"}</UserName>
              <UserRole>{user?.role === "admin" ? "Administrador" : "Usuario"}</UserRole>
            </UserDetails>
          </UserInfo>
        </TopBar>

        <DashboardContent>
          <Outlet />
        </DashboardContent>
      </Content>
    </AdminContainer>
  )
}

export default AdminLayout
