"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import styled from "styled-components"
import { AppColors } from "../../styles/colors"
import type { User } from "../../types"

// Componentes estilizados
const PageContainer = styled.div`
  padding: 1.5rem;
  background-color: ${AppColors.background};
  border-radius: 8px;
`

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`

const PageTitle = styled.h2`
  font-size: 1.5rem;
  color: ${AppColors.primary};
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

const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.05);
  color: ${AppColors.text};
  font-size: 1rem;
  appearance: none;

  &:focus {
    outline: none;
    border-color: ${AppColors.primary};
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`

const Button = styled.button<{ variant?: "primary" | "secondary" | "danger" }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  background-color: ${(props) =>
    props.variant === "primary"
      ? AppColors.primary
      : props.variant === "danger"
        ? AppColors.error
        : "rgba(255, 255, 255, 0.1)"};
  color: ${(props) => (props.variant === "primary" || props.variant === "danger" ? "white" : AppColors.text)};

  &:hover {
    background-color: ${(props) =>
      props.variant === "primary"
        ? AppColors.primaryDark
        : props.variant === "danger"
          ? AppColors.errorDark
          : "rgba(255, 255, 255, 0.2)"};
  }

  &:disabled {
    opacity: 0.5;
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

const SuccessMessage = styled.div`
  color: ${AppColors.success};
  background-color: rgba(76, 175, 80, 0.1);
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`

// Extender la interfaz User para incluir password
interface UserFormData extends Partial<User> {
  password?: string
}

const UserForm: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditMode = !!id

  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    role: "user",
    status: "active",
  })

  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (isEditMode) {
      // Implementar cuando tengamos el endpoint para obtener un usuario por ID
    }
  }, [id, isEditMode])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    // Validar que las contraseñas coincidan
    if (formData.password && formData.password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsSubmitting(false)
      return
    }

    try {
      if (isEditMode) {
        // Implementar cuando tengamos el endpoint para actualizar un usuario
        setSuccess("Usuario actualizado con éxito")
      } else {
        // Implementar cuando tengamos el endpoint para crear un usuario
        setSuccess("Usuario creado con éxito")
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "user",
          status: "active",
        })
        setConfirmPassword("")
      }
    } catch (err: any) {
      console.error("Error saving user:", err)
      setError(err.response?.data?.message || "Error al guardar el usuario. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>{isEditMode ? "Editar Usuario" : "Nuevo Usuario"}</PageTitle>
      </PageHeader>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="name">Nombre</Label>
          <Input type="text" id="name" name="name" value={formData.name || ""} onChange={handleChange} required />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input type="email" id="email" name="email" value={formData.email || ""} onChange={handleChange} required />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="password">{isEditMode ? "Contraseña (dejar en blanco para no cambiar)" : "Contraseña"}</Label>
          <Input
            type="password"
            id="password"
            name="password"
            value={formData.password || ""}
            onChange={handleChange}
            required={!isEditMode}
            minLength={6}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
          <Input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            required={!isEditMode || !!formData.password}
            minLength={6}
          />
        </FormGroup>

        <FormGroup>
          <Label id="role-label" htmlFor="role">Rol</Label>
          <div>
            <Select
              id="role"
              name="role"
              value={formData.role || "user"}
              onChange={handleChange}
              required
              aria-labelledby="role-label"
              aria-label="Rol del usuario"
              title="Rol del usuario"
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </Select>
          </div>
        </FormGroup>

        <FormGroup>
          <Label id="status-label" htmlFor="status">Estado</Label>
          <div>
            <Select
              id="status"
              name="status"
              value={formData.status || "active"}
              onChange={handleChange}
              required
              aria-labelledby="status-label"
              aria-label="Estado del usuario"
              title="Estado del usuario"
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="pending">Pendiente</option>
            </Select>
          </div>
        </FormGroup>

        <ButtonGroup>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : isEditMode ? "Actualizar Usuario" : "Crear Usuario"}
          </Button>
          <Button type="button" onClick={() => navigate("/admin/users")}>
            Cancelar
          </Button>
        </ButtonGroup>
      </Form>
    </PageContainer>
  )
}

export default UserForm