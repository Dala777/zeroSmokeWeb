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
import { Mail, Phone, MapPin, Clock, MessageCircle, Send } from "lucide-react"

const PageContainer = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
`

const PageTitle = styled.h1`
  font-size: 2rem;
  color: ${AppColors.text};
  margin-bottom: 0.5rem;
  text-align: center;
`

const PageSubtitle = styled.p`
  text-align: center;
  color: ${AppColors.textSecondary};
  margin-bottom: 3rem;
  font-size: 1.05rem;
`

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const ContactInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const InfoCard = styled(Card)`
  padding: 1.5rem;
  border: 1px solid ${AppColors.border};
`

const InfoTitle = styled.h3`
  font-size: 1rem;
  color: ${AppColors.text};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  color: ${AppColors.textSecondary};
  font-size: 0.925rem;

  &:last-child {
    margin-bottom: 0;
  }
`

const FormCard = styled(Card)`
  padding: 2rem;
  border: 1px solid ${AppColors.border};
`

const ContactForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`

const TextArea = styled.textarea`
  width: 100%;
  min-height: 140px;
  padding: 0.875rem 1rem;
  border: 1px solid ${AppColors.border};
  border-radius: 8px;
  background-color: ${AppColors.cardBackground};
  color: ${AppColors.text};
  font-size: 0.925rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${AppColors.primary};
    box-shadow: 0 0 0 3px ${AppColors.primary}15;
  }

  &::placeholder {
    color: ${AppColors.textLight};
  }
`

const SuccessMessage = styled.div`
  background-color: ${AppColors.success}15;
  color: ${AppColors.accent};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0;
  text-align: center;
  font-size: 0.925rem;
  font-weight: 500;
`

const ErrorMessage = styled.div`
  background-color: ${AppColors.error}15;
  color: ${AppColors.error};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0;
  text-align: center;
  font-size: 0.925rem;
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
      await messageAPI.create({ ...formData, status: "new" })
      setIsSuccess(true)
      setFormData({ name: "", email: "", subject: "", message: "" })
      setTimeout(() => setIsSuccess(false), 5000)
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
      <PageSubtitle>Estamos aquí para ayudarte. No dudes en escribirnos.</PageSubtitle>

      <ContactGrid>
        <ContactInfoSection>
          <InfoCard>
            <InfoTitle>
              <Mail size={18} color={AppColors.primary} />
              Información de Contacto
            </InfoTitle>
            <InfoItem>
              <Mail size={16} color={AppColors.primary} />
              infozerosmoke@gmail.com
            </InfoItem>
            <InfoItem>
              <Phone size={16} color={AppColors.primary} />
              +591 64957120
            </InfoItem>
            <InfoItem>
              <MapPin size={16} color={AppColors.primary} />
              Avenida Villarroel, esquina N° 359
            </InfoItem>
          </InfoCard>

          <InfoCard>
            <InfoTitle>
              <Clock size={18} color={AppColors.primary} />
              Horario de Atención
            </InfoTitle>
            <InfoItem>
              <Clock size={16} color={AppColors.primary} />
              Lun - Vie: 9:00 - 18:00
            </InfoItem>
            <InfoItem>
              <Clock size={16} color={AppColors.primary} />
              Sábados: 10:00 - 14:00
            </InfoItem>
          </InfoCard>

          <InfoCard>
            <InfoTitle>
              <MessageCircle size={18} color={AppColors.primary} />
              Asistencia Inmediata
            </InfoTitle>
            <p style={{ color: AppColors.textSecondary, fontSize: "0.925rem", marginBottom: "1rem" }}>
              Si necesitas ayuda inmediata, utiliza nuestro asistente virtual disponible 24/7.
            </p>
            <Button onClick={openChat} size="small">
              <MessageCircle size={16} />
              Chatear con Asistente
            </Button>
          </InfoCard>
        </ContactInfoSection>

        <FormCard>
          {isSuccess && (
            <SuccessMessage>
              ¡Mensaje enviado con éxito! Nos pondremos en contacto contigo lo antes posible.
            </SuccessMessage>
          )}

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <ContactForm onSubmit={handleSubmit}>
            <FormRow>
              <Input
                label="Nombre"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                fullWidth
                placeholder="Tu nombre"
              />
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                fullWidth
                placeholder="tu@email.com"
              />
            </FormRow>

            <Input
              label="Asunto"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              fullWidth
              placeholder="¿Sobre qué deseas contactarnos?"
            />

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500, color: AppColors.textSecondary }}>
                Mensaje
              </label>
              <TextArea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Escribe tu mensaje aquí..."
              />
            </div>

            <Button type="submit" disabled={isSubmitting} size="medium">
              <Send size={16} />
              {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
            </Button>
          </ContactForm>
        </FormCard>
      </ContactGrid>
    </PageContainer>
  )
}

export default ContactPage