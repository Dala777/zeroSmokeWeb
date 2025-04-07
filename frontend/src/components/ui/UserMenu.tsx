import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import styled from "styled-components";
import { Link } from "react-router-dom";

const MenuContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
`;

interface DropdownMenuProps {
  isOpen: boolean;
}

const DropdownMenu = styled.div<DropdownMenuProps>`
  position: absolute;
  top: 30px;
  right: 0;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  width: 150px;
  display: ${({ isOpen }) => (isOpen ? "block" : "none")};
  z-index: 1000;
`;

const MenuItem = styled.div`
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const UserMenu: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  if (!isAuthenticated) return null;

  return (
    <MenuContainer>
      <UserInfo onClick={toggleMenu}>
        <span>{user?.name}</span>
      </UserInfo>
      <DropdownMenu isOpen={isOpen}>
        <Link to="/account">
          <MenuItem onClick={() => setIsOpen(false)}>Configuración</MenuItem>
        </Link>
        <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
      </DropdownMenu>
    </MenuContainer>
  );
};

export default UserMenu;
