"use client"

import type React from "react"
import { useState, useEffect } from "react"
import styled from "styled-components"
import { Link, useLocation } from "react-router-dom"
import { AppColors } from "../../styles/colors"
import Button from "../ui/Button"
import UserMenu from "../ui/UserMenu"
import { useAuth } from "../../contexts/AuthContext"
import { Menu, X, Leaf } from "lucide-react"

const HeaderContainer = styled.header<{ $scrolled: boolean }>`
  background-color: ${(props) => (props.$scrolled ? `${AppColors.cardBackground}eg` : AppColors.cardBackground)};
  padding: ${(props) => (props.$scrolled ? "0.6rem 0" : "1rem 0")};
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: ${(props) => (props.$scrolled ? "0 2px 20px rgba(0, 0, 0, 0.1)" : "0 1px 3px rgba(0, 0, 0, 0.05)")};
  transition: all 0.3s ease;
  backdrop-filter: blur(12px);
`

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
`

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${AppColors.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Montserrat', sans-serif;
  letter-spacing: -0.02em;
  flex-shrink: 0;

  span {
    color: ${AppColors.text};
    font-weight: 300;
  }
`

const Nav = styled.nav<{ $isOpen: boolean }>`
  @media (min-width: 1025px) {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  @media (max-width: 1024px) {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    width: 300px;
    background-color: ${AppColors.cardBackground};
    padding: 5rem 2rem 2rem;
    transform: ${({ $isOpen }) => ($isOpen ? "translateX(0)" : "translateX(100%)")};
    transition: transform 0.35s cubic-bezier(0.19, 1, 0.22, 1);
    box-shadow: -5px 0 30px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    display: flex;
    flex-direction: column;
  }
`

const NavList = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 0.25rem;

  @media (max-width: 1024px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`

const NavItem = styled.li`
  position: relative;
`

const NavLink = styled(Link)<{ $isActive?: boolean }>`
  color: ${(props) => (props.$isActive ? AppColors.primary : AppColors.textSecondary)};
  font-weight: 500;
  font-size: 0.925rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  display: block;
  transition: all 0.2s ease;

  &:hover {
    color: ${AppColors.primary};
    background-color: ${AppColors.primary}10;
  }
`

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: 1.5rem;

  @media (max-width: 1024px) {
    display: none;
  }
`

const MobileActions = styled.div`
  display: none;
  margin-top: auto;
  padding-top: 2rem;
  border-top: 1px solid ${AppColors.border};

  @media (max-width: 1024px) {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
`

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${AppColors.text};
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${AppColors.primary}10;
  }

  @media (max-width: 1024px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`

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
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${AppColors.primary}10;
  }

  @media (min-width: 1025px) {
    display: none;
  }
`

const Overlay = styled.div<{ $isOpen: boolean }>`
  display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 999;
`

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
    document.body.style.overflow = !isMenuOpen ? "hidden" : "auto"
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
    document.body.style.overflow = "auto"
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    closeMenu()
  }, [location])

  const isActive = (path: string) => location.pathname === path

  return (
    <>
      <HeaderContainer $scrolled={scrolled}>
        <HeaderContent>
          <Logo to="/">
            <Leaf size={24} />
            Zero<span>Smoke</span>
          </Logo>

          <MobileMenuButton onClick={toggleMenu} aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}>
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </MobileMenuButton>

          <Overlay $isOpen={isMenuOpen} onClick={closeMenu} />

          <Nav $isOpen={isMenuOpen}>
            <CloseButton onClick={closeMenu} aria-label="Cerrar menú">
              <X size={22} />
            </CloseButton>

            <NavList>
              <NavItem>
                <NavLink to="/" $isActive={isActive("/")}>Inicio</NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/Gallery" $isActive={isActive("/Gallery")}>Consecuencias</NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/education" $isActive={isActive("/education")}>Educación</NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/test" $isActive={isActive("/test")}>Test</NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/faqs" $isActive={isActive("/faqs")}>FAQ</NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/contacto" $isActive={isActive("/contacto")}>Contacto</NavLink>
              </NavItem>
            </NavList>

            <MobileActions>
              {!isAuthenticated ? (
                <>
                  <Button variant="outline" size="medium" fullWidth>
                    <Link to="/login" style={{ color: "inherit", width: "100%", display: "block" }}>Iniciar Sesión</Link>
                  </Button>
                  <Button variant="primary" size="medium" fullWidth>
                    <Link to="/register" style={{ color: "inherit", width: "100%", display: "block" }}>Registrarse</Link>
                  </Button>
                </>
              ) : (
                <UserMenu isMobile={true} />
              )}
            </MobileActions>
          </Nav>

          <ActionsContainer>
            {!isAuthenticated ? (
              <>
                <Button variant="outline" size="small">
                  <Link to="/login" style={{ color: "inherit" }}>Iniciar Sesión</Link>
                </Button>
                <Button variant="primary" size="small">
                  <Link to="/register" style={{ color: "inherit" }}>Registrarse</Link>
                </Button>
              </>
            ) : (
              <UserMenu />
            )}
          </ActionsContainer>
        </HeaderContent>
      </HeaderContainer>
    </>
  )
}

export default Header