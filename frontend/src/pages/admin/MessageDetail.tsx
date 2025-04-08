"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import styled from "styled-components"
import { AppColors } from "../../styles/colors"
import { getMessageById, updateMessage, deleteMessage } from "../../services/storageService"
import type { Message } from "../../services/storageService"
import { messageAPI } from "../../services/api"

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

const MessageCard = styled.div`
  background-color: ${AppColors.cardBackground};
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
`

const MessageInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const MessageSubject = styled.h3`
  font-size: 1.25rem;
  color: ${AppColors.textSecondary};
  margin: 0;
`

const MessageMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: ${AppColors.text};
  opacity: 0.7;
`

const MessageStatus = styled.span<{ status: "new" | "read" | "answered" }>`
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background-color: ${(props) =>
    props.status === "new"
      ? "rgba(255, 183, 77, 0.2)"
      : props.status === "read"
        ? "rgba(33, 150, 243, 0.2)"
        : "rgba(76, 175, 80, 0.2)"};
  color: ${(props) =>
    props.status === "new" ? AppColors.warning : props.status === "read" ? AppColors.secondary : AppColors.success};
`

const MessageContent = styled.div`
  color: ${AppColors.text};
  line-height: 1.6;
  white-space: pre-wrap;
`

const ReplySection = styled.div`
  margin-top: 2rem;
`

const ReplyTitle = styled.h3`
  font-size: 1.25rem;
  color: ${AppColors.primary};
  margin-bottom: 1rem;
`

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.05);
  color: ${AppColors.text};
  font-size: 1rem;
  min-height: 150px;
  resize: vertical;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: ${AppColors.primary};
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
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
        ? AppColors.accent
        : props.variant === "danger"
          ? "#d32f2f"
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

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${AppColors.text};
  font-size: 1.1rem;
`

const MessageDetail: React.FC = () => {
  console.log("Rendering MessageDetail component")
  const { id } = useParams<{ id: string }>()
  console.log("Message ID from params:", id)
  const navigate = useNavigate()

  const [message, setMessage] = useState<Message | null>(null)
  const [replyText, setReplyText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        console.log("Fetching message with ID:", id)
        setLoading(true)

        if (!id) {
          throw new Error("ID de mensaje no proporcionado")
        }

        const messageData = await getMessageById(id)
        console.log("Message details:", messageData)

        if (!messageData) {
          throw new Error("Mensaje no encontrado")
        }

        setMessage(messageData)

        // Marcar como leído si es nuevo
        if (messageData.status === "new") {
          await updateMessage(id, { ...messageData, status: "read" })
        }
      } catch (err: any) {
        console.error("Error fetching message:", err)
        setError(err.message || "Error al cargar el mensaje. Por favor, intenta de nuevo.")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchMessage()
    }
  }, [id])

  const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReplyText(e.target.value)
  }

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      setError("Por favor, escribe una respuesta antes de enviar.")
      return
    }

    if (!id || !message) {
      setError("No se puede enviar la respuesta. Información del mensaje incompleta.")
      return
    }

    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      console.log("Sending reply to message ID:", id)

      // Intentar usar la API primero
      try {
        await messageAPI.reply(id, replyText)
      } catch (apiError) {
        console.error("API error, using local storage fallback:", apiError)
        // Fallback a localStorage
        await updateMessage(id, { ...message, status: "answered" })
      }

      // Actualizar el mensaje en el estado local
      setMessage({ ...message, status: "answered" })
      setSuccess("Respuesta enviada con éxito")
      setReplyText("")
    } catch (err: any) {
      console.error("Error sending reply:", err)
      setError(err.message || "Error al enviar la respuesta. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return

    if (window.confirm("¿Estás seguro de que quieres eliminar este mensaje?")) {
      try {
        const success = await deleteMessage(id)
        if (success) {
          navigate("/admin/messages")
        } else {
          throw new Error("No se pudo eliminar el mensaje")
        }
      } catch (err: any) {
        console.error("Error deleting message:", err)
        setError(err.message || "Error al eliminar el mensaje. Por favor, intenta de nuevo.")
      }
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <PageHeader>
          <PageTitle>Detalle del Mensaje</PageTitle>
          <Button onClick={() => navigate("/admin/messages")}>Volver</Button>
        </PageHeader>
        <LoadingContainer>Cargando mensaje...</LoadingContainer>
      </PageContainer>
    )
  }

  if (error && !message) {
    return (
      <PageContainer>
        <PageHeader>
          <PageTitle>Detalle del Mensaje</PageTitle>
          <Button onClick={() => navigate("/admin/messages")}>Volver</Button>
        </PageHeader>
        <ErrorMessage>{error}</ErrorMessage>
      </PageContainer>
    )
  }

  if (!message) {
    return (
      <PageContainer>
        <PageHeader>
          <PageTitle>Detalle del Mensaje</PageTitle>
          <Button onClick={() => navigate("/admin/messages")}>Volver</Button>
        </PageHeader>
        <ErrorMessage>Mensaje no encontrado</ErrorMessage>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Detalle del Mensaje</PageTitle>
        <ButtonGroup>
          <Button onClick={() => navigate("/admin/messages")}>Volver</Button>
          <Button variant="danger" onClick={handleDelete}>
            Eliminar
          </Button>
        </ButtonGroup>
      </PageHeader>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <MessageCard>
        <MessageHeader>
          <MessageInfo>
            <MessageSubject>{message.subject}</MessageSubject>
            <MessageMeta>
              <span>De: {message.name}</span>
              <span>Email: {message.email}</span>
              <span>
                Fecha:{" "}
                {new Date(message.createdAt).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </MessageMeta>
          </MessageInfo>
          <MessageStatus status={message.status}>
            {message.status === "new" ? "Nuevo" : message.status === "read" ? "Leído" : "Respondido"}
          </MessageStatus>
        </MessageHeader>
        <MessageContent>{message.message}</MessageContent>
      </MessageCard>

      <ReplySection>
        <ReplyTitle>Responder</ReplyTitle>
        <TextArea
          value={replyText}
          onChange={handleReplyChange}
          placeholder="Escribe tu respuesta aquí..."
          disabled={message.status === "answered"}
        />
        <ButtonGroup>
          <Button variant="primary" onClick={handleSendReply} disabled={isSubmitting || message.status === "answered"}>
            {isSubmitting ? "Enviando..." : message.status === "answered" ? "Ya respondido" : "Enviar Respuesta"}
          </Button>
        </ButtonGroup>
      </ReplySection>
    </PageContainer>
  )
}

export default MessageDetail
