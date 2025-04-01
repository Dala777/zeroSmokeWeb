"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import { AppColors } from "../styles/colors"
import { authAPI } from "../services/api"
import type { User } from "../types"

// Componentes estilizados
const PageContainer = styled.div`
  max-width: 400px;
  margin: 4rem auto;
  padding: 2rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`

const PageTitle = styled.h1`
  font-size: 2rem;
  color: ${AppColors.primary};
  margin-bottom: 2rem;
  text-align: center;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Label = styled.label`
  font-size: 0.875rem;
  color: ${AppColors.textSecondary};
`

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.05);
  color: ${AppColors.text};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${AppColors.primary};
  }
`

const Button = styled.button`
  padding: 0.75rem 1rem;
  background-color: ${AppColors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${AppColors.primaryDark};
  }

  &:disabled {
    background-color: rgba(76, 175, 80, 0.5);
    cursor: not-allowed;
  }
`

const ErrorMessage = styled.div`
  color: ${AppColors.error};
  background-color: rgba(244, 67, 54, 0.1);
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`

const LinkText = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: ${AppColors.text};

  a {
    color: ${AppColors.primary};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`

interface RegisterPageProps {
  setUser: React.Dispatch<React.SetStateAction<User | null>>
}

const RegisterPage: React.FC<RegisterPageProps> = ({ setUser }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsSubmitting(false)
      return
    }

    try {
      const { name, email, password } = formData
      const response = await authAPI.register({ name, email, password })
      const { token, user } = response.data

      // Guardar token en localStorage
      localStorage.setItem("token", token)

      // Actualizar estado de usuario
      setUser(user)

      // Redirigir a la página principal
      navigate("/")
    } catch (err: any) {
      console.error("Error en registro:", err)
      setError(err.response?.data?.message || "Error al registrarse. Por favor, intenta con otro email.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageContainer>
      <PageTitle>Registro</PageTitle>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="name">Nombre</Label>
          <Input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="password">Contraseña</Label>
          <Input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
          <Input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength={6}
          />
        </FormGroup>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Registrando..." : "Registrarse"}
        </Button>
      </Form>

      <LinkText>
        ¿Ya tienes una cuenta? <a href="/login">Inicia sesión</a>
      </LinkText>
    </PageContainer>
  )
}

export default RegisterPage

