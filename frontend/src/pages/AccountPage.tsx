"use client"

import type React from "react"
import { useState } from "react"
import styled from "styled-components"
import { AppColors } from "../styles/colors"
import { useAuth } from "../contexts/AuthContext"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import { User, Mail, Lock, Save, AlertCircle } from "lucide-react"

const AccountContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
`

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: ${AppColors.textSecondary};
  margin-bottom: 40px;
  text-align: center;
`

const Card = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  overflow: hidden;
`

const CardHeader = styled.div`
  padding: 24px;
  background: ${AppColors.primary};
  color: white;
  
  h2 {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
  }
  
  p {
    margin: 8px 0 0 0;
    opacity: 0.8;
  }
`

const CardBody = styled.div`
  padding: 24px;
`

const FormSection = styled.div`
  margin-bottom: 32px;
  
  &:last-child {
    margin-bottom: 0;
  }
`

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${AppColors.textSecondary};
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 10px;
    color: ${AppColors.primary};
  }
`

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const FormGroup = styled.div`
  margin-bottom: 16px;
  
  label {
    display: block;
    font-weight: 500;
    margin-bottom: 8px;
    color: ${AppColors.textSecondary};
  }
`

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
`

const SuccessMessage = styled.div`
  background-color: #e6f7e6;
  color: #2e7d32;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
  }
`

const AccountPage: React.FC = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ")[1] || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showSuccess, setShowSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would handle the profile update
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would handle the password update
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <AccountContainer>
      <PageTitle>Mi Cuenta</PageTitle>

      {showSuccess && (
        <SuccessMessage>
          <AlertCircle size={18} />
          Los cambios se han guardado correctamente
        </SuccessMessage>
      )}

      <Card>
        <CardHeader>
          <h2>Información Personal</h2>
          <p>Actualiza tu información personal y de contacto</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleProfileSubmit}>
            <FormSection>
              <SectionTitle>
                <User size={20} />
                Datos Personales
              </SectionTitle>
              <FormGrid>
                <FormGroup>
                  <label htmlFor="firstName">Nombre</label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                  />
                </FormGroup>
                <FormGroup>
                  <label htmlFor="lastName">Apellido</label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Tu apellido"
                  />
                </FormGroup>
              </FormGrid>
            </FormSection>

            <FormSection>
              <SectionTitle>
                <Mail size={20} />
                Información de Contacto
              </SectionTitle>
              <FormGroup>
                <label htmlFor="email">Correo Electrónico</label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                />
              </FormGroup>
            </FormSection>

            <ButtonContainer>
              <Button type="submit" variant="primary">
                <Save size={18} />
                Guardar Cambios
              </Button>
            </ButtonContainer>
          </form>
        </CardBody>
      </Card>

      <div style={{ height: "30px" }} />

      <Card>
        <CardHeader>
          <h2>Seguridad</h2>
          <p>Actualiza tu contraseña para mantener tu cuenta segura</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handlePasswordSubmit}>
            <FormSection>
              <SectionTitle>
                <Lock size={20} />
                Cambiar Contraseña
              </SectionTitle>
              <FormGroup>
                <label htmlFor="currentPassword">Contraseña Actual</label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Ingresa tu contraseña actual"
                />
              </FormGroup>
              <FormGroup>
                <label htmlFor="newPassword">Nueva Contraseña</label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Ingresa tu nueva contraseña"
                />
              </FormGroup>
              <FormGroup>
                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirma tu nueva contraseña"
                />
              </FormGroup>
            </FormSection>

            <ButtonContainer>
              <Button type="submit" variant="primary">
                <Save size={18} />
                Actualizar Contraseña
              </Button>
            </ButtonContainer>
          </form>
        </CardBody>
      </Card>
    </AccountContainer>
  )
}

export default AccountPage
