import type React from "react"
import styled from "styled-components"
import { Link, useLocation } from "react-router-dom"
import { AppColors } from "../../styles/colors"

// Iconos (puedes usar cualquier biblioteca de iconos o emojis)
const DashboardIcon = () => <span>📊</span>
const ArticlesIcon = () => <span>📝</span>
const FaqsIcon = () => <span>❓</span>
const MessagesIcon = () => <span>✉️</span>
const UsersIcon = () => <span>👥</span>
const SettingsIcon = () => <span>⚙️</span>

const SidebarContainer = styled.aside`
  width: 250px;
  background-color: ${AppColors.sidebarBackground};
  height: 100%;
  position: fixed;
  left: 0;
  top: 60px;
  padding: 1rem 0;
  overflow-y: auto;
  z-index: 10;
`

const SidebarNav = styled.nav`
  display: flex;
  flex-direction: column;
`

const SidebarLink = styled(Link)<{ active: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: ${(props) => (props.active ? AppColors.primary : AppColors.text)};
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid ${(props) => (props.active ? AppColors.primary : "transparent")};
  background-color: ${(props) => (props.active ? "rgba(76, 175, 80, 0.1)" : "transparent")};

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: ${AppColors.primary};
  }
`

const SidebarIcon = styled.span`
  margin-right: 0.75rem;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
`

const SidebarLabel = styled.span`
  font-size: 0.875rem;
`

const SidebarSection = styled.div`
  margin-bottom: 1.5rem;
`

const SidebarSectionTitle = styled.h3`
  font-size: 0.75rem;
  text-transform: uppercase;
  color: ${AppColors.textSecondary};
  padding: 0.5rem 1.5rem;
  margin-bottom: 0.5rem;
`

const Sidebar: React.FC = () => {
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => {
    if (path === "/admin" && currentPath === "/admin") {
      return true
    }
    if (path !== "/admin" && currentPath.startsWith(path)) {
      return true
    }
    return false
  }

  return (
    <SidebarContainer>
      <SidebarNav>
        <SidebarSection>
          <SidebarSectionTitle>Principal</SidebarSectionTitle>
          <SidebarLink to="/admin" active={isActive("/admin")}>
            <SidebarIcon>
              <DashboardIcon />
            </SidebarIcon>
            <SidebarLabel>Dashboard</SidebarLabel>
          </SidebarLink>
        </SidebarSection>

        <SidebarSection>
          <SidebarSectionTitle>Contenido</SidebarSectionTitle>
          <SidebarLink to="/admin/articles" active={isActive("/admin/articles")}>
            <SidebarIcon>
              <ArticlesIcon />
            </SidebarIcon>
            <SidebarLabel>Artículos</SidebarLabel>
          </SidebarLink>
          <SidebarLink to="/admin/faqs" active={isActive("/admin/faqs")}>
            <SidebarIcon>
              <FaqsIcon />
            </SidebarIcon>
            <SidebarLabel>FAQs</SidebarLabel>
          </SidebarLink>
        </SidebarSection>

        <SidebarSection>
          <SidebarSectionTitle>Comunicación</SidebarSectionTitle>
          <SidebarLink to="/admin/messages" active={isActive("/admin/messages")}>
            <SidebarIcon>
              <MessagesIcon />
            </SidebarIcon>
            <SidebarLabel>Mensajes</SidebarLabel>
          </SidebarLink>
        </SidebarSection>

        <SidebarSection>
          <SidebarSectionTitle>Administración</SidebarSectionTitle>
          <SidebarLink to="/admin/users" active={isActive("/admin/users")}>
            <SidebarIcon>
              <UsersIcon />
            </SidebarIcon>
            <SidebarLabel>Usuarios</SidebarLabel>
          </SidebarLink>
          <SidebarLink to="/admin/settings" active={isActive("/admin/settings")}>
            <SidebarIcon>
              <SettingsIcon />
            </SidebarIcon>
            <SidebarLabel>Configuración</SidebarLabel>
          </SidebarLink>
        </SidebarSection>
      </SidebarNav>
    </SidebarContainer>
  )
}

export default Sidebar

