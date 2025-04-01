"use client"

import type React from "react"
import { useState } from "react"
import styled from "styled-components"
import { AppColors } from "../../styles/colors"

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

const SettingsSection = styled.div`
  margin-bottom: 2rem;
  background-color: ${AppColors.cardBackground};
  border-radius: 8px;
  padding: 1.5rem;
`

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  color: ${AppColors.textSecondary};
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.05);
  color: ${AppColors.text};
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${AppColors.primary};
  }
`

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
`

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: ${AppColors.primary};
  }

  &:checked + span:before {
    transform: translateX(26px);
  }
`

const SwitchSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.2);
  transition: 0.4s;
  border-radius: 34px;

  &:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const SwitchLabel = styled.span`
  font-size: 0.875rem;
  color: ${AppColors.text};
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`

const SuccessMessage = styled.div`
  color: ${AppColors.success};
  background-color: rgba(76, 175, 80, 0.1);
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`

const SettingsPage: React.FC = () => {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "ZeroSmoke",
    siteDescription: "Plataforma para ayudar a dejar de fumar",
    contactEmail: "info@zerosmoke.com",
    enableRegistration: true,
  })

  const [emailSettings, setEmailSettings] = useState({
    smtpServer: "",
    smtpPort: "",
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "",
    fromName: "",
  })

  const [success, setSuccess] = useState("")

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setGeneralSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setGeneralSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEmailSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para guardar la configuración general
    setSuccess("Configuración general guardada con éxito")
    setTimeout(() => setSuccess(""), 3000)
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para guardar la configuración de email
    setSuccess("Configuración de email guardada con éxito")
    setTimeout(() => setSuccess(""), 3000)
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Configuración</PageTitle>
      </PageHeader>

      {success && <SuccessMessage>{success}</SuccessMessage>}

      <SettingsSection>
        <SectionTitle>Configuración General</SectionTitle>
        <Form onSubmit={handleGeneralSubmit}>
          <FormGroup>
            <Label htmlFor="siteName">Nombre del Sitio</Label>
            <Input
              type="text"
              id="siteName"
              name="siteName"
              value={generalSettings.siteName}
              onChange={handleGeneralChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="siteDescription">Descripción del Sitio</Label>
            <TextArea
              id="siteDescription"
              name="siteDescription"
              value={generalSettings.siteDescription}
              onChange={handleGeneralChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="contactEmail">Email de Contacto</Label>
            <Input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={generalSettings.contactEmail}
              onChange={handleGeneralChange}
            />
          </FormGroup>

          <SwitchContainer>
            <Switch>
              <SwitchInput
                type="checkbox"
                name="enableRegistration"
                checked={generalSettings.enableRegistration}
                onChange={handleSwitchChange}
              />
              <SwitchSlider />
            </Switch>
            <SwitchLabel>Permitir registro de usuarios</SwitchLabel>
          </SwitchContainer>

          <ButtonGroup>
            <Button type="submit" variant="primary">
              Guardar Configuración
            </Button>
          </ButtonGroup>
        </Form>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>Configuración de Email</SectionTitle>
        <Form onSubmit={handleEmailSubmit}>
          <FormGroup>
            <Label htmlFor="smtpServer">Servidor SMTP</Label>
            <Input
              type="text"
              id="smtpServer"
              name="smtpServer"
              value={emailSettings.smtpServer}
              onChange={handleEmailChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="smtpPort">Puerto SMTP</Label>
            <Input
              type="text"
              id="smtpPort"
              name="smtpPort"
              value={emailSettings.smtpPort}
              onChange={handleEmailChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="smtpUser">Usuario SMTP</Label>
            <Input
              type="text"
              id="smtpUser"
              name="smtpUser"
              value={emailSettings.smtpUser}
              onChange={handleEmailChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="smtpPassword">Contraseña SMTP</Label>
            <Input
              type="password"
              id="smtpPassword"
              name="smtpPassword"
              value={emailSettings.smtpPassword}
              onChange={handleEmailChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="fromEmail">Email Remitente</Label>
            <Input
              type="email"
              id="fromEmail"
              name="fromEmail"
              value={emailSettings.fromEmail}
              onChange={handleEmailChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="fromName">Nombre Remitente</Label>
            <Input
              type="text"
              id="fromName"
              name="fromName"
              value={emailSettings.fromName}
              onChange={handleEmailChange}
            />
          </FormGroup>

          <ButtonGroup>
            <Button type="submit" variant="primary">
              Guardar Configuración
            </Button>
            <Button type="button">Probar Conexión</Button>
          </ButtonGroup>
        </Form>
      </SettingsSection>
    </PageContainer>
  )
}

export default SettingsPage

