"use client"

import type React from "react"
import { useState } from "react"
import styled from "styled-components"
import { useNavigate } from "react-router-dom"
import { AppColors } from "../styles/colors"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import Card from "../components/ui/Card"
import { useAuth } from "../contexts/AuthContext"

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${AppColors.background};
  padding: 1rem;
`

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  padding: 2rem;
`

const Logo = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${AppColors.primary};
  text-align: center;
  margin-bottom: 2rem;

  span {
    color: ${AppColors.text};
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const ErrorMessage = styled.div`
  color: ${AppColors.error};
  background-color: rgba(229, 115, 115, 0.1);
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
`

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        navigate("/admin/dashboard")
      } else {
        setError("Credenciales incorrectas. Por favor, inténtalo de nuevo.")
      }
    } catch (err) {
      setError("Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageContainer>
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
  )
}

export default LoginPage

