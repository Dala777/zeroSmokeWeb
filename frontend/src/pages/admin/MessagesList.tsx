"use client"

import type React from "react"
import { useState } from "react"
import styled from "styled-components"
import { AppColors } from "../../styles/colors"
import Button from "../../components/ui/Button"
import Card from "../../components/ui/Card"
import Input from "../../components/ui/Input"

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

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`

const SelectFilter = styled.select`
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

// Corregir el problema con onClick en Card
// Crear un componente wrapper para manejar el onClick
const ClickableCard = styled(Card)`
  margin-bottom: 1rem;
  cursor: pointer;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`

const MessageFrom = styled.h3`
  font-size: 1.125rem;
  color: ${AppColors.textSecondary};
  margin-bottom: 0.25rem;
`

const MessageStatus = styled.span<{ status: "new" | "read" | "answered" }>`
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background-color: ${(props) =>
    props.status === "new"
      ? "rgba(255, 183, 77, 0.2)"
      : props.status === "read"
        ? "rgba(76, 175, 80, 0.2)"
        : "rgba(33, 150, 243, 0.2)"};
  color: ${(props) =>
    props.status === "new" ? AppColors.warning : props.status === "read" ? AppColors.success : "#2196F3"};
`

const MessageMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: ${AppColors.text};
  opacity: 0.7;
  margin-bottom: 0.5rem;
`

const MessageSubject = styled.div`
  font-weight: 500;
  margin-bottom: 0.5rem;
`

const MessageContent = styled.p`
  color: ${AppColors.text};
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const MessageActions = styled.div`
  display: flex;
  gap: 0.5rem;
`

const ActionButton = styled.button`
  background-color: rgba(255, 255, 255, 0.1);
  color: ${AppColors.text};
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: ${AppColors.primary};
    color: white;
  }
`

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
`

const PageButton = styled.button<{ isActive?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => (props.isActive ? AppColors.primary : "rgba(255, 255, 255, 0.1)")};
  color: ${(props) => (props.isActive ? "white" : AppColors.text)};
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover:not([disabled]) {
    background-color: ${(props) => (props.isActive ? AppColors.primary : "rgba(255, 255, 255, 0.2)")};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const ModalContent = styled(Card)`
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  color: ${AppColors.primary};
`

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${AppColors.text};
  font-size: 1.5rem;
  cursor: pointer;
`

const TextArea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.05);
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
    color: rgba(255, 255, 255, 0.4);
  }
`

const MessageDetails = styled.div`
  padding: 1rem;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.05);
  margin-bottom: 1.5rem;
`

const MessageDetailItem = styled.div`
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`

const MessageDetailLabel = styled.span`
  font-weight: 500;
  color: ${AppColors.textSecondary};
  margin-right: 0.5rem;
`

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
`

// Reemplazar los estilos inline con componentes styled
const MessageContentWrapper = styled.div`
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  white-space: pre-wrap;
`

// Buscar:
// <div style={{ marginBottom: '1.5rem' }}>
// Y reemplazar con:
const MarginBottomContainer = styled.div`
  margin-bottom: 1.5rem;
`

// Mock data
const mockMessages = [
  {
    id: 1,
    name: "Juan Pérez",
    email: "juan.perez@example.com",
    subject: "Consulta sobre el programa para dejar de fumar",
    message:
      "Hola, estoy interesado en el programa para dejar de fumar. Me gustaría saber cuánto tiempo dura y si tiene algún costo. Gracias de antemano por su respuesta.",
    date: "2023-07-15 10:30",
    status: "new" as const,
  },
  {
    id: 2,
    name: "María González",
    email: "maria.gonzalez@example.com",
    subject: "Problemas con la app",
    message:
      "Buenas tardes, he estado intentando registrarme en la aplicación pero me aparece un error cada vez que intento crear una cuenta. ¿Podrían ayudarme a solucionar este problema?",
    date: "2023-07-14 15:45",
    status: "read" as const,
  },
  {
    id: 3,
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@example.com",
    subject: "Agradecimiento",
    message:
      "Quería expresar mi agradecimiento por la ayuda que me ha brindado su programa. Llevo 3 meses sin fumar y me siento mejor que nunca. Muchas gracias por todo el apoyo.",
    date: "2023-07-13 09:20",
    status: "answered" as const,
  },
  {
    id: 4,
    name: "Ana Martínez",
    email: "ana.martinez@example.com",
    subject: "Solicitud de información adicional",
    message:
      "Hola, me gustaría recibir más información sobre los efectos del tabaco en el embarazo. ¿Tienen algún artículo o recurso sobre este tema en particular?",
    date: "2023-07-12 14:10",
    status: "new" as const,
  },
]

const MessagesList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [messages, setMessages] = useState(mockMessages)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentMessage, setCurrentMessage] = useState<(typeof mockMessages)[0] | null>(null)
  const [replyText, setReplyText] = useState("")

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || message.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleOpenMessage = (message: (typeof mockMessages)[0]) => {
    setCurrentMessage(message)
    setIsModalOpen(true)

    // If message is new, mark it as read
    if (message.status === "new") {
      handleStatusChange(message.id, "read")
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setReplyText("")
  }

  const handleStatusChange = (id: number, newStatus: "new" | "read" | "answered") => {
    setMessages(messages.map((message) => (message.id === id ? { ...message, status: newStatus } : message)))

    if (currentMessage && currentMessage.id === id) {
      setCurrentMessage({
        ...currentMessage,
        status: newStatus,
      })
    }
  }

  const handleDelete = (id: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este mensaje?")) {
      setMessages(messages.filter((message) => message.id !== id))

      if (currentMessage && currentMessage.id === id) {
        handleCloseModal()
      }
    }
  }

  const handleSendReply = () => {
    if (currentMessage && replyText.trim()) {
      // Here you would send the reply to your backend
      alert(`Respuesta enviada a ${currentMessage.email}`)
      handleStatusChange(currentMessage.id, "answered")
      handleCloseModal()
    }
  }

  return (
    <PageContainer 
      role="main" 
      aria-label="Gestión de Mensajes" 
      title="Bandeja de Mensajes"
    >
      <PageHeader>
        <PageTitle>Gestión de Mensajes</PageTitle>
      </PageHeader>

      <SearchContainer>
        <Input
          placeholder="Buscar mensajes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          aria-label="Buscar mensajes"
        />
      </SearchContainer>

      <FilterContainer>
        <label htmlFor="messages-status-filter">
          <span className="sr-only">Filtrar mensajes por estado</span>
          <SelectFilter
            id="messages-status-filter"  // ID más específico
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filtrar mensajes por estado"
            title="Filtrar mensajes por estado"
          >
            <option value="all">Todos los estados</option>
            <option value="new">Nuevos</option>
            <option value="read">Leídos</option>
            <option value="answered">Respondidos</option>
          </SelectFilter>
        </label>

        <Button 
          variant="outline" 
          size="small" 
          aria-label="Aplicar filtro de mensajes"
        >
          Filtrar
        </Button>
      </FilterContainer>

      {filteredMessages.map((message) => (
        <div key={message.id} onClick={() => handleOpenMessage(message)}>
          <ClickableCard>
            <MessageHeader>
              <div>
                <MessageFrom>{message.name}</MessageFrom>
                <MessageMeta>
                  <span>{message.email}</span>
                  <span>{message.date}</span>
                </MessageMeta>
              </div>
              <MessageStatus status={message.status}>
                {message.status === "new" ? "Nuevo" : message.status === "read" ? "Leído" : "Respondido"}
              </MessageStatus>
            </MessageHeader>

            <MessageSubject>{message.subject}</MessageSubject>
            <MessageContent>{message.message}</MessageContent>

            <MessageActions onClick={(e) => e.stopPropagation()}>
              <ActionButton
                onClick={(e) => {
                  e.stopPropagation()
                  handleOpenMessage(message)
                }}
              >
                Ver
              </ActionButton>
              {message.status !== "answered" && (
                <ActionButton
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOpenMessage(message)
                    setReplyText(`Hola ${message.name},\n\n`)
                  }}
                >
                  Responder
                </ActionButton>
              )}
              <ActionButton
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(message.id)
                }}
              >
                Eliminar
              </ActionButton>
            </MessageActions>
          </ClickableCard>
        </div>
      ))}

      <Pagination>
        <PageButton disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
          &lt;
        </PageButton>
        {[1, 2, 3].map((page) => (
          <PageButton key={page} isActive={currentPage === page} onClick={() => setCurrentPage(page)}>
            {page}
          </PageButton>
        ))}
        <PageButton onClick={() => setCurrentPage((p) => p + 1)}>&gt;</PageButton>
      </Pagination>

      {isModalOpen && currentMessage && (
        <Modal onClick={handleCloseModal}>
          <div onClick={(e) => e.stopPropagation()}>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>Mensaje de {currentMessage.name}</ModalTitle>
                <CloseButton onClick={handleCloseModal}>×</CloseButton>
              </ModalHeader>

              <MessageDetails>
                <MessageDetailItem>
                  <MessageDetailLabel>De:</MessageDetailLabel>
                  {currentMessage.name} ({currentMessage.email})
                </MessageDetailItem>
                <MessageDetailItem>
                  <MessageDetailLabel>Fecha:</MessageDetailLabel>
                  {currentMessage.date}
                </MessageDetailItem>
                <MessageDetailItem>
                  <MessageDetailLabel>Asunto:</MessageDetailLabel>
                  {currentMessage.subject}
                </MessageDetailItem>
                <MessageDetailItem>
                  <MessageDetailLabel>Estado:</MessageDetailLabel>
                  <MessageStatus status={currentMessage.status}>
                    {currentMessage.status === "new"
                      ? "Nuevo"
                      : currentMessage.status === "read"
                        ? "Leído"
                        : "Respondido"}
                  </MessageStatus>
                </MessageDetailItem>
              </MessageDetails>

              <MarginBottomContainer>
                <FormLabel>Mensaje:</FormLabel>
                <MessageContentWrapper>{currentMessage.message}</MessageContentWrapper>
              </MarginBottomContainer>

              <div>
                <FormLabel>Responder:</FormLabel>
                <TextArea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Escribe tu respuesta aquí..."
                />
              </div>

              <ButtonContainer>
                <Button variant="outline" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button onClick={handleSendReply} disabled={!replyText.trim()}>
                  Enviar Respuesta
                </Button>
              </ButtonContainer>
            </ModalContent>
          </div>
        </Modal>
      )}
    </PageContainer>
  )
}

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${AppColors.textSecondary};
`

export default MessagesList

