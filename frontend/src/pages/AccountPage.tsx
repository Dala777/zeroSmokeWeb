import React from "react";
import { useAuth } from "../contexts/AuthContext";
import styled from "styled-components";

const AccountContainer = styled.div`
  max-width: 600px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: #fff;
`;

const AccountTitle = styled.h1`
  text-align: center;
  color: #333;
`;

const AccountInfo = styled.div`
  margin-top: 20px;
`;

const AccountLabel = styled.p`
  font-weight: bold;
  margin-bottom: 5px;
`;

const AccountDetail = styled.p`
  margin-bottom: 15px;
`;

const AccountPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <AccountContainer>
      <AccountTitle>Configuración de Cuenta</AccountTitle>
      <AccountInfo>
        <AccountLabel>Nombre:</AccountLabel>
        <AccountDetail>{user?.name}</AccountDetail>
        <AccountLabel>Email:</AccountLabel>
        <AccountDetail>{user?.email}</AccountDetail>
        {/* Agregar más opciones de configuración según sea necesario */}
      </AccountInfo>
    </AccountContainer>
  );
};

export default AccountPage;
