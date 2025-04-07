"use client";

import type React from "react";
import { useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { AppColors } from "../../styles/colors";
import Button from "../ui/Button";
import UserMenu from "../ui/UserMenu"; // Importar UserMenu

const HeaderContainer = styled.header`
  background-color: ${AppColors.background};
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${AppColors.primary};
  display: flex;
  align-items: center;

  span {
    color: ${AppColors.text};
  }
`;

const Nav = styled.nav<{ isOpen: boolean }>`
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    width: 250px;
    background-color: ${AppColors.cardBackground};
    padding: 2rem;
    transform: ${({ isOpen }) => (isOpen ? "translateX(0)" : "translateX(100%)")};
    transition: transform 0.3s ease-in-out;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }
`;

const NavList = styled.ul`
  display: flex;
  list-style: none;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const NavItem = styled.li`
  margin-left: 2rem;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const NavLink = styled(Link)`
  color: ${AppColors.text};
  font-weight: 500;
  transition: color 0.3s ease;

  &:hover {
    color: ${AppColors.primary};
  }

  &.active {
    color: ${AppColors.primary};
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${AppColors.text};
  font-size: 1.5rem;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: ${AppColors.text};
  font-size: 1.5rem;
  cursor: pointer;
  display: none;

  @media (max-width: 768px) {
    display: block;
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
  z-index: 999;
`;

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo to="/">
          Zero<span>Smoke</span>
        </Logo>

        <MobileMenuButton onClick={toggleMenu}>☰</MobileMenuButton>

        <Overlay isOpen={isMenuOpen} onClick={closeMenu} />

        <Nav isOpen={isMenuOpen}>
          <CloseButton onClick={closeMenu}>✕</CloseButton>
          <NavList>
            <NavItem>
              <NavLink to="/" onClick={closeMenu}>
                Inicio
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/consecuencias" onClick={closeMenu}>
                Consecuencias
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/test" onClick={closeMenu}>
                Test de Dependencia
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/recursos" onClick={closeMenu}>
                Recursos
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/faqs" onClick={closeMenu}>
                FAQs
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/contacto" onClick={closeMenu}>
                Contacto
              </NavLink>
            </NavItem>
          </NavList>
        </Nav>

        <UserMenu /> {/* Incluir UserMenu en el Header */}

        <Button variant="primary" size="small">
          <Link to="/login" style={{ color: "inherit" }}>
            Iniciar Sesión
          </Link>
        </Button>

        <Button variant="primary" size="small">
          <Link to="/register" style={{ color: "inherit" }}>
            Registrarse
          </Link>
        </Button>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;
