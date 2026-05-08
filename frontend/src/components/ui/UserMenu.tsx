"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import styled from "styled-components"
import { Link } from "react-router-dom"
import { AppColors } from "../../styles/colors"
import { useAuth } from "../../contexts/AuthContext"
import { User, LogOut, Settings } from "lucide-react"

interface UserMenuProps {
  isMobile?: boolean
}

const MenuContainer = styled.div<{ isMobile?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;

  ${(props) =>
    props.isMobile &&
    `
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
  `}
`

const UserInfo = styled.div<{ isMobile?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 30px;
  background-color: ${AppColors.background};
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background-color: ${AppColors.primary}15;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  ${(props) =>
    props.isMobile &&
    `
    width: 100%;
    justify-content: space-between;
    padding: 12px 16px;
  `}
`

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${AppColors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
`

const UserName = styled.div`
  font-weight: 500;
  font-size: 14px;
  color: ${AppColors.text};
`

interface DropdownMenuProps {
  isOpen: boolean
  isMobile?: boolean
}

const DropdownMenu = styled.div<DropdownMenuProps>`
  position: ${(props) => (props.isMobile ? "relative" : "absolute")};
  top: ${(props) => (props.isMobile ? "10px" : "50px")};
  right: 0;
  background-color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  width: ${(props) => (props.isMobile ? "100%" : "280px")};
  display: ${({ isOpen }) => (isOpen ? "block" : "none")};
  z-index: 1000;
  overflow: hidden;
  animation: ${({ isOpen }) => (isOpen ? "slideDown 0.3s ease" : "none")};

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

const MenuHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background-color: ${AppColors.primary}10;
`

const MenuTitle = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: ${AppColors.textSecondary};
  margin-bottom: 4px;
`

const MenuSubtitle = styled.div`
  font-size: 13px;
  color: ${AppColors.text};
  opacity: 0.7;
`

const MenuSection = styled.div`
  padding: 8px 0;

  &:not(:last-child) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
`

const SectionTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${AppColors.textSecondary};
  opacity: 0.7;
  padding: 8px 16px;
`

const MenuItem = styled(Link)`
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: background-color 0.2s ease;
  color: ${AppColors.text};
  font-size: 14px;

  &:hover {
    background-color: ${AppColors.primary}10;
    color: ${AppColors.primary};
  }

  svg {
    color: ${AppColors.textSecondary};
  }

  &:hover svg {
    color: ${AppColors.primary};
  }
`

const LogoutButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: background-color 0.2s ease;
  color: ${AppColors.text};
  font-size: 14px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;

  &:hover {
    background-color: rgba(229, 115, 115, 0.1);
    color: #e53935;
  }

  svg {
    color: ${AppColors.textSecondary};
  }

  &:hover svg {
    color: #e53935;
  }
`

const UserMenu: React.FC<UserMenuProps> = ({ isMobile = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuth()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  // Cerrar menú al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  if (!user) return null

  const userInitial = user?.name?.charAt(0) || "U"

  return (
    <MenuContainer ref={menuRef} isMobile={isMobile}>
      <UserInfo onClick={toggleMenu} isMobile={isMobile}>
        <Avatar>{userInitial}</Avatar>
        <UserName>{user?.name || "Usuario"}</UserName>
      </UserInfo>

      <DropdownMenu isOpen={isOpen} isMobile={isMobile}>
        <MenuHeader>
          <MenuTitle>Mi cuenta</MenuTitle>
          <MenuSubtitle>{user?.email || "usuario@ejemplo.com"}</MenuSubtitle>
        </MenuHeader>

        <MenuSection>
          <SectionTitle>Mi cuenta</SectionTitle>
          <MenuItem to="/account">
            <User size={18} />
            Perfil
          </MenuItem>
          <MenuItem to="/account/settings">
            <Settings size={18} />
            Configuración
          </MenuItem>
        </MenuSection>

        <MenuSection>
          <LogoutButton onClick={handleLogout}>
            <LogOut size={18} />
            Cerrar Sesión
          </LogoutButton>
        </MenuSection>
      </DropdownMenu>
    </MenuContainer>
  )
}

export default UserMenu
