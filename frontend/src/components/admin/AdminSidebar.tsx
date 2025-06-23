"use client"

import type React from "react"
import { Link, useLocation } from "react-router-dom"
import styled from "styled-components"
import { AppColors } from "../../styles/colors"
import { Home, FileText, HelpCircle, Users, MessageSquare, LogOut, ChevronRight } from "lucide-react"

const SidebarContainer = styled.div`
  width: 280px;
  height: 100vh;
  background: ${AppColors.cardBackground};
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  position: fixed;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
`

const Logo = styled.div`
  padding: 24px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  h1 {
    color: ${AppColors.primary};
    font-size: 24px;
    font-weight: 700;
    margin: 0;
  }
`

const SidebarSection = styled.div`
  margin-top: 20px;
  padding: 0 15px;
`

const SectionTitle = styled.h3`
  color: ${AppColors.textSecondary};
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 10px;
  padding: 0 10px;
  font-weight: 600;
`

const MenuList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`

interface MenuItemProps {
  active: boolean
}

const MenuItem = styled.li<MenuItemProps>`
  margin-bottom: 5px;
  border-radius: 8px;
  background: ${(props) => (props.active ? `${AppColors.primary}10` : "transparent")};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${AppColors.primary}05;
  }
`

const MenuLink = styled(Link)<MenuItemProps>`
  display: flex;
  align-items: center;
  padding: 12px 15px;
  color: ${(props) => (props.active ? AppColors.primary : AppColors.textSecondary)};
  text-decoration: none;
  font-weight: ${(props) => (props.active ? "600" : "500")};
  transition: all 0.2s ease;
  
  svg {
    margin-right: 12px;
    width: 18px;
    height: 18px;
    stroke-width: ${(props) => (props.active ? 2.5 : 2)};
  }
  
  &:hover {
    color: ${AppColors.primary};
  }
`

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  padding: 12px 15px;
  color: ${AppColors.textSecondary};
  background: transparent;
  border: none;
  cursor: pointer;
  font-weight: 500;
  width: 100%;
  text-align: left;
  border-radius: 8px;
  margin-top: auto;
  transition: all 0.2s ease;
  
  svg {
    margin-right: 12px;
    width: 18px;
    height: 18px;
  }
  
  &:hover {
    background: ${AppColors.primary}05;
    color: ${AppColors.primary};
  }
`

const Footer = styled.div`
  margin-top: auto;
  padding: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
`

const AdminInfo = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: ${AppColors.primary};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    margin-right: 12px;
  }
  
  .info {
    flex: 1;
    
    .name {
      font-weight: 600;
      color: ${AppColors.text};
    }
    
    .role {
      font-size: 12px;
      color: ${AppColors.textSecondary};
    }
  }
`

interface AdminSidebarProps {
  onLogout: () => void
  adminName: string
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onLogout, adminName }) => {
  const location = useLocation()
  const currentPath = location.pathname

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <SidebarContainer>
      <Logo>
        <h1>ZeroSmoke</h1>
      </Logo>

      <SidebarSection>
        <SectionTitle>Panel Principal</SectionTitle>
        <MenuList>
          <MenuItem active={currentPath === "/admin/dashboard"}>
            <MenuLink to="/admin/dashboard" active={currentPath === "/admin/dashboard"}>
              <Home />
              Dashboard
            </MenuLink>
          </MenuItem>
        </MenuList>
      </SidebarSection>

      <SidebarSection>
        <SectionTitle>Contenido</SectionTitle>
        <MenuList>
          <MenuItem active={currentPath === "/admin/homepage"}>
            <MenuLink to="/admin/homepage" active={currentPath === "/admin/homepage"}>
              <Home />
              Página de Inicio
            </MenuLink>
          </MenuItem>
          <MenuItem active={currentPath.includes("/admin/articles")}>
            <MenuLink to="/admin/articles" active={currentPath.includes("/admin/articles")}>
              <FileText />
              Artículos
            </MenuLink>
          </MenuItem>
          <MenuItem active={currentPath === "/admin/faqs"}>
            <MenuLink to="/admin/faqs" active={currentPath === "/admin/faqs"}>
              <HelpCircle />
              FAQs
            </MenuLink>
          </MenuItem>
        </MenuList>
      </SidebarSection>

      <SidebarSection>
        <SectionTitle>Usuarios</SectionTitle>
        <MenuList>
          <MenuItem active={currentPath === "/admin/users"}>
            <MenuLink to="/admin/users" active={currentPath === "/admin/users"}>
              <Users />
              Gestión de Usuarios
            </MenuLink>
          </MenuItem>
        </MenuList>
      </SidebarSection>

      <SidebarSection>
        <SectionTitle>Comunicación</SectionTitle>
        <MenuList>
          <MenuItem active={currentPath.includes("/admin/messages")}>
            <MenuLink to="/admin/messages" active={currentPath.includes("/admin/messages")}>
              <MessageSquare />
              Mensajes
            </MenuLink>
          </MenuItem>
        </MenuList>
      </SidebarSection>

      <Footer>
        <AdminInfo>
          <div className="avatar">{getInitials(adminName)}</div>
          <div className="info">
            <div className="name">{adminName}</div>
            <div className="role">Administrador</div>
          </div>
          <ChevronRight size={16} color={AppColors.textSecondary} />
        </AdminInfo>
        <LogoutButton onClick={onLogout}>
          <LogOut />
          Cerrar Sesión
        </LogoutButton>
      </Footer>
    </SidebarContainer>
  )
}

export default AdminSidebar
