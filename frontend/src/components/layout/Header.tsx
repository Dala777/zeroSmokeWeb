"use client"

import type React from "react"
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import styled from "styled-components"
import { AppColors } from "../../styles/colors"
import type { User } from "../../types"

const HeaderContainer = styled.header`
  background-color: ${AppColors.headerBackground};
  padding: 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${AppColors.primary};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const LogoIcon = styled.span`
  font-size: 1.75rem;
`

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    display: none;
  }
`

const NavLink = styled(Link)<{ active?: boolean }>`
  color: ${(props) => (props.active ? AppColors.primary : AppColors.text)};
  text-decoration: none;
  padding: 0.5rem;
  font-size: 0.875rem;
  transition: color 0.3s ease;

  &:hover {
    color: ${AppColors.primary};
  }
`

const MobileMenuButton = styled.button`
  background: none;
  border: none;
  color: ${AppColors.text};
  font-size: 1.5rem;
  cursor: pointer;
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`

const MobileMenu = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  background-color: ${AppColors.headerBackground};
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transform: ${(props) => (props.isOpen ? "translateY(0)" : "translateY(-100%)")};
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  transition: all 0.3s ease;
  z-index: 99;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (min-width: 769px) {
    display: none;
  }
`

const UserMenu = styled.div`
  position: relative;
`

const UserButton = styled.button`
  background: none;
  border: none;
  color: ${AppColors.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  font-size: 0.875rem;

  &:hover {
    color: ${AppColors.primary};
  }
`

const UserIcon = styled.span`
  font-size: 1.25rem;
`

const UserDropdown = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: ${AppColors.cardBackground};
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  padding: 0.5rem 0;
  min-width: 150px;
  display: ${(props) => (props.isOpen ? "block" : "none")};
  z-index: 10;
`

const UserDropdownItem = styled(Link)`
  display: block;
  padding: 0.5rem 1rem;
  color: ${AppColors.text};
  text-decoration: none;
  font-size: 0.875rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: ${AppColors.primary};
  }
`

const UserDropdownButton = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.5rem 1rem;
  color: ${AppColors.text};
  background: none;
  border: none;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: ${AppColors.primary};
  }
`

interface HeaderProps {
  user: User | null
  onLogout: () => void
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") {
      return true
    }
    if (path !== "/" && currentPath.startsWith(path)) {
      return true
    }
    return false
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen)
  }

  const handleLogout = () => {
    setUserMenuOpen(false)
    onLogout()
  }

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo to="/">
          <LogoIcon>🚭</LogoIcon> ZeroSmoke
        </Logo>

        <Nav>
          <NavLink to="/" active={isActive("/")}>
            Inicio
          </NavLink>
          <NavLink to="/articles" active={isActive("/articles")}>
            Artículos
          </NavLink>
          <NavLink to="/faqs" active={isActive("/faqs")}>
            FAQs
          </NavLink>
          <NavLink to="/contact" active={isActive("/contact")}>
            Contacto
          </NavLink>

          {user ? (
            <UserMenu>
              <UserButton onClick={toggleUserMenu}>
                <UserIcon>👤</UserIcon>
                {user.name}
              </UserButton>
              <UserDropdown isOpen={userMenuOpen}>
                {user.role === "admin" && (
                  <UserDropdownItem to="/admin" onClick={() => setUserMenuOpen(false)}>
                    Panel de Admin
                  </UserDropdownItem>
                )}
                <UserDropdownButton onClick={handleLogout}>Cerrar Sesión</UserDropdownButton>
              </UserDropdown>
            </UserMenu>
          ) : (
            <NavLink to="/login" active={isActive("/login")}>
              Iniciar Sesión
            </NavLink>
          )}
        </Nav>

        <MobileMenuButton onClick={toggleMobileMenu}>☰</MobileMenuButton>
      </HeaderContent>

      <MobileMenu isOpen={mobileMenuOpen}>
        <NavLink to="/" active={isActive("/")}>
          Inicio
        </NavLink>
        <NavLink to="/articles" active={isActive("/articles")}>
          Artículos
        </NavLink>
        <NavLink to="/faqs" active={isActive("/faqs")}>
          FAQs
        </NavLink>
        <NavLink to="/contact" active={isActive("/contact")}>
          Contacto
        </NavLink>

        {user ? (
          <>
            {user.role === "admin" && (
              <NavLink to="/admin" active={isActive("/admin")}>
                Panel de Admin
              </NavLink>
            )}
            <UserDropdownButton onClick={handleLogout}>Cerrar Sesión</UserDropdownButton>
          </>
        ) : (
          <NavLink to="/login" active={isActive("/login")}>
            Iniciar Sesión
          </NavLink>
        )}
      </MobileMenu>
    </HeaderContainer>
  )
}

export default Header

