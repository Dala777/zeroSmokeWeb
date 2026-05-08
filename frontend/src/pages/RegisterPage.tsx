"use client"

import type React from "react"
import { useState } from "react"
import styled, { keyframes } from "styled-components"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import Card from "../components/ui/Card"
import { AppColors } from "../styles/colors"
import { User, Mail, Lock, ArrowRight } from "lucide-react"

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

const slideIn = keyframes`
  from {
    transform: translateX(-30px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`

const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, ${AppColors.background}, ${AppColors.cardBackground});
  padding: 1rem;
  animation: ${fadeIn} 1s ease-in-out;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const LeftSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background-color: ${AppColors.primary};
  color: white;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  animation: ${slideIn} 1s ease-out;
  
  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%);
    z-index: 0;
  }
`

const LeftContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 500px;
  text-align: center;
`

const WelcomeTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`

const WelcomeText = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2.5rem;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 2.5rem;
  text-align: left;
`

const FeatureItem = styled.li`
  padding: 0.8rem 0;
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  
  &:before {
    content: '✓';
    margin-right: 10px;
    font-weight: bold;
  }
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`

const LoginLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: white;
  font-weight: 500;
  font-size: 1.1rem;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border: 2px solid white;
  border-radius: 30px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: white;
    color: ${AppColors.primary};
  }
  
  svg {
    margin-left: 8px;
    transition: transform 0.3s ease;
  }
  
  &:hover svg {
    transform: translateX(5px);
  }
`

const RegisterCard = styled(Card)`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background-color: white;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  max-width: 500px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 1.5rem;
  }
`

const Logo = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${AppColors.primary};
  text-align: center;
  margin-bottom: 2rem;

  span {
    color: ${AppColors.textSecondary};
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
`

const InputGroup = styled.div`
  position: relative;
  
  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: ${AppColors.textSecondary};
    opacity: 0.7;
  }
`

const StyledInput = styled(Input)`
  padding-left: 40px;
`

const ErrorMessage = styled.div`
  color: ${AppColors.error};
  background-color: rgba(229, 115, 115, 0.1);
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
  animation: ${fadeIn} 0.3s ease;
`

const TermsText = styled.p`
  font-size: 0.85rem;
  color: ${AppColors.text};
  opacity: 0.8;
  text-align: center;
  margin-top: 1.5rem;
  
  a {
    color: ${AppColors.primary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`

const RegisterPage: React.FC = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Validación básica
    if (!name || !email || !password) {
      setError("Por favor, completa todos los campos.")
      setIsLoading(false)
      return
    }

    // Validación de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Por favor, introduce un correo electrónico válido.")
      setIsLoading(false)
      return
    }

    // Validación de contraseña
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      setIsLoading(false)
      return
    }

    try {
      const success = await register(name, email, password)
      if (success) {
        navigate("/") // Redirigir a la página principal
      } else {
        setError("No se pudo registrar. Por favor, inténtalo de nuevo.")
      }
    } catch (err) {
      setError("Ocurrió un error al registrarse. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageContainer>
      <LeftSection>
        <LeftContent>
          <WelcomeTitle>¡Únete a ZeroSmoke!</WelcomeTitle>
          <WelcomeText>
            Comienza tu camino hacia una vida libre de tabaco con nuestra plataforma de apoyo personalizado.
          </WelcomeText>

          <FeaturesList>
            <FeatureItem>Seguimiento personalizado de tu progreso</FeatureItem>
            <FeatureItem>Apoyo emocional con nuestro chatbot</FeatureItem>
            <FeatureItem>Recursos educativos exclusivos</FeatureItem>
            <FeatureItem>Comunidad de apoyo</FeatureItem>
          </FeaturesList>

          <LoginLink to="/login">
            ¿Ya tienes cuenta? Inicia sesión <ArrowRight size={16} />
          </LoginLink>
        </LeftContent>
      </LeftSection>

      <RegisterCard>
        <Logo>
          Zero<span>Smoke</span>
        </Logo>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <User size={18} />
            <StyledInput
              label="Nombre"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              required
              fullWidth
            />
          </InputGroup>

          <InputGroup>
            <Mail size={18} />
            <StyledInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tuemail@ejemplo.com"
              required
              fullWidth
            />
          </InputGroup>

          <InputGroup>
            <Lock size={18} />
            <StyledInput
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Crea una contraseña segura"
              required
              fullWidth
            />
          </InputGroup>

          <Button type="submit" fullWidth disabled={isLoading}>
            {isLoading ? "Registrando..." : "Crear Cuenta"}
          </Button>
        </Form>

        <TermsText>
          Al registrarte, aceptas nuestros <Link to="/terms">Términos de Servicio</Link> y{" "}
          <Link to="/privacy">Política de Privacidad</Link>
        </TermsText>
      </RegisterCard>
    </PageContainer>
  )
}

export default RegisterPage
