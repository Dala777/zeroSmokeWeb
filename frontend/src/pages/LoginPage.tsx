"use client";

import type React from "react";
import { useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { AppColors } from "../styles/colors";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import { useAuth } from "../contexts/AuthContext";

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const PageContainer = styled.div`
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, ${AppColors.background}, ${AppColors.cardBackground});
  padding: 1rem;
  animation: ${fadeIn} 1s ease-in-out;
`;

const LeftSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background-color: ${AppColors.primary};
  color: ${AppColors.text};
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);

  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
  }

  button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    background-color: ${AppColors.text};
    color: ${AppColors.primary};
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: ${AppColors.secondary};
    }
  }
`;

const LoginCard = styled(Card)`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background-color: ${AppColors.cardBackground};
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
`;

const Logo = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${AppColors.primary};
  text-align: center;
  margin-bottom: 2rem;

  span {
    color: ${AppColors.textSecondary};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 400px;
`;

const ErrorMessage = styled.div`
  color: ${AppColors.error};
  background-color: rgba(229, 115, 115, 0.1);
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
`;

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validación básica
    if (!email || !password) {
      setError("Por favor, completa todos los campos.");
      setIsLoading(false);
      return;
    }

    try {
      const success = await login(email, password);
      if (success) {
        navigate("/admin/dashboard");
      } else {
        setError("Credenciales incorrectas. Por favor, inténtalo de nuevo.");
      }
    } catch (err) {
      setError("Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <LeftSection>
        <h1>¡Bienvenido de vuelta!</h1>
        <p>Para mantenerte conectado con nosotros, por favor inicia sesión con tu información personal.</p>
        <button onClick={() => navigate("/login")}>Iniciar Sesión</button>
      </LeftSection>
      <LoginCard>
        <Logo>
          Zero<span>Smoke</span>
        </Logo>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@zerosmoke.com"
            required
            fullWidth
          />
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="admin123"
            required
            fullWidth
          />
          <Button type="submit" fullWidth disabled={isLoading}>
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </Form>
      </LoginCard>
    </PageContainer>
  );
};

export default LoginPage;
