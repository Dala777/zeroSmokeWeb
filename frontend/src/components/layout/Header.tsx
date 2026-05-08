"use client";

import type React from "react"
import { useState, useEffect } from "react"
import styled from "styled-components"
import { Link, useLocation } from "react-router-dom"
import { AppColors } from "../../styles/colors"
import Button from "../ui/Button"
import UserMenu from "../ui/UserMenu"
import { useAuth } from "../../contexts/AuthContext"
import { Menu, X } from "lucide-react"

// Animaciones y efectos
const fadeIn = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`

const HeaderContainer = styled.header`
  background-color: ${AppColors.background};
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &.scrolled {
    padding: 0.7rem 0;
    background-color: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(10px);
  }
`

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
`

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
`

const Logo = styled(Link)`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${AppColors.primary};
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
  font-family: 'Montserrat', sans-serif;
  
  &:hover {
    transform: scale(1.05);
  }

  span {
    color: ${AppColors.text};
  }
`;

const LogoIcon = styled.div`
  margin-right: 0.5rem;
  color: ${AppColors.primary};
  font-size: 1.8rem;
`

const Nav = styled.nav<{ isOpen: boolean }>`
  ${fadeIn}
  
  @media (min-width: 769px) {
    animation: fadeIn 0.5s ease;
    display: flex;
    align-items: center;
  }

  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    width: 280px;
    background-color: ${AppColors.cardBackground};
    padding: 5rem 2rem 2rem;
    transform: ${({ isOpen }) => (isOpen ? "translateX(0)" : "translateX(100%)")};
    transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
    box-shadow: -5px 0 25px rgba(0, 0, 0, 0.15);
    z-index: 1000;
  }
`;

const NavList = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 2rem;
  }
`;

const NavItem = styled.li`
  margin-left: 2.5rem;
  position: relative;

  @media (max-width: 768px) {
    margin-left: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background-color: ${AppColors.primary};
    transition: width 0.3s ease;
  }
  
  &:hover::after, &.active::after {
    width: 100%;
  }
`

const NavLink = styled(Link)<{ $isActive?: boolean }>`
  color: ${(props) => (props.$isActive ? AppColors.primary : AppColors.text)};
  font-weight: 500;
  transition: color 0.3s ease;
  display: block;
  padding: 0.5rem 0;
  font-size: 1.05rem;

  &:hover {
    color: ${AppColors.primary};
  }
`

const ButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 768px) {
    display: none;
  }
`

const MobileButtonsContainer = styled.div`
  display: none;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${AppColors.text};
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: none;
  border: none;
  color: ${AppColors.text};
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const Overlay = styled.div<{ isOpen: boolean }>`
  display: ${({ isOpen }) => (isOpen ? "block" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(3px);
  z-index: 999;
  transition: opacity 0.3s ease;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
`

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
    // Prevenir scroll cuando el menú está abierto
    if (!isMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
    document.body.style.overflow = "auto"
  }

  // Detectar scroll para cambiar el estilo del header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    closeMenu()
  }, [location])

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <HeaderContainer className={scrolled ? "scrolled" : ""}>
      <HeaderContent>
        <LogoContainer>
          <Logo to="/">
            Zero<span>Smoke</span>
          </Logo>
        </LogoContainer>

        <MobileMenuButton onClick={toggleMenu} aria-label="Abrir menú">
          <Menu size={24} />
        </MobileMenuButton>

        <Overlay isOpen={isMenuOpen} onClick={closeMenu} />

        <Nav isOpen={isMenuOpen}>
          <CloseButton onClick={closeMenu} aria-label="Cerrar menú">
            <X size={24} />
          </CloseButton>
          <NavList>
            <NavItem className={isActive("/") ? "active" : ""}>
              <NavLink to="/" $isActive={isActive("/")}>
                Inicio
              </NavLink>
            </NavItem>
            <NavItem className={isActive("/Gallery") ? "active" : ""}>
              <NavLink to="/Gallery" $isActive={isActive("/Gallery")}>
                Consecuencias
              </NavLink>
            </NavItem>
            <NavItem className={isActive("/education") ? "active" : ""}>
              <NavLink to="/education" $isActive={isActive("/education")}>
                Educación
              </NavLink>
            </NavItem>
            <NavItem className={isActive("/test") ? "active" : ""}>
              <NavLink to="/test" $isActive={isActive("/test")}>
                Test de Dependencia
              </NavLink>
            </NavItem>
            <NavItem className={isActive("/faqs") ? "active" : ""}>
              <NavLink to="/faqs" $isActive={isActive("/faqs")}>
                FAQs
              </NavLink>
            </NavItem>
            <NavItem className={isActive("/contacto") ? "active" : ""}>
              <NavLink to="/contacto" $isActive={isActive("/contacto")}>
                Contacto
              </NavLink>
            </NavItem>
          </NavList>

          <MobileButtonsContainer>
            {!isAuthenticated ? (
              <>
                <Button variant="primary" size="medium" fullWidth>
                  <Link to="/login" style={{ color: "inherit", width: "100%", display: "block" }}>
                    Iniciar Sesión
                  </Link>
                </Button>
                <Button variant="outline" size="medium" fullWidth>
                  <Link to="/register" style={{ color: "inherit", width: "100%", display: "block" }}>
                    Registrarse
                  </Link>
                </Button>
              </>
            ) : (
              <UserMenu isMobile={true} />
            )}
          </MobileButtonsContainer>
        </Nav>

        <ButtonsContainer>
          {!isAuthenticated ? (
            <>
              <Button variant="outline" size="small">
                <Link to="/login" style={{ color: "inherit" }}>
                  Iniciar Sesión
                </Link>
              </Button>
              <Button variant="primary" size="small">
                <Link to="/register" style={{ color: "inherit" }}>
                  Registrarse
                </Link>
              </Button>
            </>
          ) : (
            <UserMenu />
          )}
        </ButtonsContainer>
      </HeaderContent>
    </HeaderContainer>
  )
}

export default Header
