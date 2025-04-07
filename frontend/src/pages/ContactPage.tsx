"use client"

import type React from "react"
import { useState } from "react"
import styled from "styled-components"
import { AppColors } from "../styles/colors"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import Card from "../components/ui/Card"
import { useChatbot } from "../components/ChatbotContext"
import { messageAPI } from "../services/api"

// Componentes estilizados
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`

const PageTitle = styled.h1`
  font-size: 2.5rem;
  color: ${AppColors.primary};
  margin-bottom: 2rem;
  text-align: center;
`

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const InfoCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const InfoTitle = styled.h3`
  font-size: 1.25rem;
  color: ${AppColors.primary};
  margin-bottom: 0.5rem;
`

const InfoText = styled.p`
  color: ${AppColors.text};
  line-height: 1.6;
`

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
`

const InfoIcon = styled.span`
  font-size: 1.5rem;
  color: ${AppColors.primary};
`

const ContactForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const TextArea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.9);
  color: ${AppColors.text};
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${AppColors.primary};
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
  }

  &::placeholder {
    color: rgba(0, 0, 0, 0.4);
  }
`

const SuccessMessage = styled.div`
  background-color: rgba(76, 175, 80, 0.1);
  color: ${AppColors.success};
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
`

const ErrorMessage = styled.div`
  background-color: rgba(244, 67, 54, 0.1);
  color: ${AppColors.error};
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
`

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${AppColors.textSecondary};
`

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const { openChat } = useChatbot()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // Enviar el mensaje al backend
      await messageAPI.create({
        ...formData,
        status: "new",
      })

      // Mostrar mensaje de éxito
      setIsSuccess(true)

      // Limpiar el formulario
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })

      // Ocultar mensaje después de 5 segundos
      setTimeout(() => {
        setIsSuccess(false)
      }, 5000)
    } catch (err: any) {
      console.error("Error al enviar mensaje:", err)
      setError(err.response?.data?.message || "Error al enviar el mensaje. Por favor, intenta de nuevo más tarde.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageContainer>
      <PageTitle>Contacto</PageTitle>

      <ContactGrid>
        <ContactInfo>
          <InfoCard>
            <InfoTitle>Información de Contacto</InfoTitle>
            <InfoText>
              Si tienes alguna pregunta o comentario, no dudes en contactarnos. Estamos aquí para ayudarte en tu camino
              hacia una vida libre de tabaco.
            </InfoText>

            <InfoItem>
              <InfoIcon>📧</InfoIcon>
              <span>info@zerosmoke.com</span>
            </InfoItem>

            <InfoItem>
              <InfoIcon>📞</InfoIcon>
              <span>+34 123 456 789</span>
            </InfoItem>

            <InfoItem>
              <InfoIcon>📍</InfoIcon>
              <span>Calle Principal 123, Madrid, España</span>
            </InfoItem>
          </InfoCard>

          <InfoCard>
            <InfoTitle>Horario de Atención</InfoTitle>
            <InfoText>Nuestro equipo está disponible para atenderte en los siguientes horarios:</InfoText>
            <InfoItem>
              <InfoIcon>🕒</InfoIcon>
              <span>Lunes a Viernes: 9:00 - 18:00</span>
            </InfoItem>
            <InfoItem>
              <InfoIcon>🕒</InfoIcon>
              <span>Sábados: 10:00 - 14:00</span>
            </InfoItem>
          </InfoCard>

          <InfoCard>
            <InfoTitle>Asistencia Inmediata</InfoTitle>
            <InfoText>
              Si necesitas ayuda inmediata, puedes utilizar nuestro asistente virtual disponible 24/7.
            </InfoText>
            <Button onClick={openChat}>Chatear con Asistente</Button>
          </InfoCard>
        </ContactInfo>

        <Card>
          {isSuccess && (
            <SuccessMessage>
              ¡Mensaje enviado con éxito! Nos pondremos en contacto contigo lo antes posible.
            </SuccessMessage>
          )}

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <ContactForm onSubmit={handleSubmit}>
            <Input label="Nombre" name="name" value={formData.name} onChange={handleChange} required fullWidth />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              fullWidth
            />

            <Input label="Asunto" name="subject" value={formData.subject} onChange={handleChange} required fullWidth />

            <div>
              <FormLabel htmlFor="message">Mensaje</FormLabel>
              <TextArea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Escribe tu mensaje aquí..."
              />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
            </Button>
          </ContactForm>
        </Card>
      </ContactGrid>
    </PageContainer>
  )
}

export default ContactPage

