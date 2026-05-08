"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import { AppColors } from "../../styles/colors"
import { getMessages } from "../../services/storageService"
import type { Message } from "../../services/storageService"

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

const RefreshButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${AppColors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${AppColors.accent};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const SearchContainer = styled.div`
  margin-bottom: 1.5rem;
`

const SearchInput = styled.input`
  width: 100%;
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

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`

const FilterButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: ${(props) => (props.active ? AppColors.primary : "rgba(255, 255, 255, 0.1)")};
  color: ${(props) => (props.active ? "white" : AppColors.text)};
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${(props) => (props.active ? AppColors.accent : "rgba(255, 255, 255, 0.2)")};
  }
`

const MessagesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
`

const TableHead = styled.thead`
  background-color: rgba(255, 255, 255, 0.05);
`

const TableRow = styled.tr<{ unread?: boolean }>`
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-weight: ${(props) => (props.unread ? "bold" : "normal")};

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`

const TableHeader = styled.th`
  padding: 1rem;
  text-align: left;
  color: ${AppColors.textSecondary};
  font-size: 0.875rem;
`

const TableCell = styled.td`
  padding: 1rem;
  color: ${AppColors.text};
  font-size: 0.875rem;
`

const StatusBadge = styled.span<{ status: "new" | "read" | "answered" }>`
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

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${AppColors.text};
`

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
`

const PageButton = styled.button<{ active?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => (props.active ? AppColors.primary : "rgba(255, 255, 255, 0.1)")};
  color: ${(props) => (props.active ? "white" : AppColors.text)};
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover:not([disabled]) {
    background-color: ${(props) => (props.active ? AppColors.accent : "rgba(255, 255, 255, 0.2)")};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const MessagesList: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "read" | "answered">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")

  const messagesPerPage = 10
  const navigate = useNavigate()

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const messagesData = await getMessages()
      console.log("Mensajes recibidos:", messagesData)
      setMessages(messagesData)
      setFilteredMessages(messagesData)
      setError("")
    } catch (err: any) {
      console.error("Error fetching messages:", err)
      setError("Error al cargar los mensajes. Por favor, intenta de nuevo más tarde.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  useEffect(() => {
    // Filtrar mensajes por término de búsqueda y estado
    let filtered = messages

    if (searchTerm) {
      filtered = filtered.filter(
        (message) =>
          message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.message.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((message) => message.status === statusFilter)
    }

    setFilteredMessages(filtered)
    setCurrentPage(1) // Resetear a la primera página cuando cambian los filtros
  }, [searchTerm, statusFilter, messages])

  // Calcular mensajes paginados
  const indexOfLastMessage = currentPage * messagesPerPage
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage
  const currentMessages = filteredMessages.slice(indexOfFirstMessage, indexOfLastMessage)
  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleStatusFilterChange = (status: "all" | "new" | "read" | "answered") => {
    setStatusFilter(status)
  }

  const handleRowClick = (id: string | number | undefined) => {
    if (!id) return // No hacer nada si el ID es undefined
    console.log("Navigating to message detail:", id)
    navigate(`/admin/messages/${id}`)
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchMessages()
  }

  const renderPagination = () => {
    const pageButtons = []

    // Botón anterior
    pageButtons.push(
      <PageButton
        key="prev"
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
      >
        &lt;
      </PageButton>,
    )

    // Botones de página
    for (let i = 1; i <= totalPages; i++) {
      // Mostrar solo 5 botones de página
      if (
        i === 1 || // Primera página
        i === totalPages || // Última página
        (i >= currentPage - 1 && i <= currentPage + 1) // Páginas cercanas a la actual
      ) {
        pageButtons.push(
          <PageButton key={i} active={currentPage === i} onClick={() => setCurrentPage(i)}>
            {i}
          </PageButton>,
        )
      } else if (
        (i === currentPage - 2 && currentPage > 3) ||
        (i === currentPage + 2 && currentPage < totalPages - 2)
      ) {
        // Añadir puntos suspensivos
        pageButtons.push(<span key={`ellipsis-${i}`}>...</span>)
      }
    }

    // Botón siguiente
    pageButtons.push(
      <PageButton
        key="next"
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages || totalPages === 0}
      >
        &gt;
      </PageButton>,
    )

    return pageButtons
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Mensajes</PageTitle>
        <RefreshButton onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? "Actualizando..." : "Actualizar"}
        </RefreshButton>
      </PageHeader>

      <SearchContainer>
        <SearchInput type="text" placeholder="Buscar mensajes..." value={searchTerm} onChange={handleSearchChange} />
      </SearchContainer>

      <FilterContainer>
        <FilterButton active={statusFilter === "all"} onClick={() => handleStatusFilterChange("all")}>
          Todos
        </FilterButton>
        <FilterButton active={statusFilter === "new"} onClick={() => handleStatusFilterChange("new")}>
          Nuevos
        </FilterButton>
        <FilterButton active={statusFilter === "read"} onClick={() => handleStatusFilterChange("read")}>
          Leídos
        </FilterButton>
        <FilterButton active={statusFilter === "answered"} onClick={() => handleStatusFilterChange("answered")}>
          Respondidos
        </FilterButton>
      </FilterContainer>

      {loading && !refreshing ? (
        <EmptyState>Cargando mensajes...</EmptyState>
      ) : error ? (
        <EmptyState>{error}</EmptyState>
      ) : filteredMessages.length === 0 ? (
        <EmptyState>No se encontraron mensajes.</EmptyState>
      ) : (
        <>
          <MessagesTable>
            <TableHead>
              <tr>
                <TableHeader>Remitente</TableHeader>
                <TableHeader>Asunto</TableHeader>
                <TableHeader>Fecha</TableHeader>
                <TableHeader>Estado</TableHeader>
              </tr>
            </TableHead>
            <tbody>
              {currentMessages.map((message, index) => (
                <TableRow
                  key={message._id || message.id || `message-${index}`}
                  onClick={() => (message._id || message.id ? handleRowClick(message._id || message.id) : null)}
                  unread={message.status === "new"}
                >
                  <TableCell>{message.name}</TableCell>
                  <TableCell>{message.subject}</TableCell>
                  <TableCell>
                    {new Date(message.createdAt).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={message.status}>
                      {message.status === "new" ? "Nuevo" : message.status === "read" ? "Leído" : "Respondido"}
                    </StatusBadge>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </MessagesTable>

          {totalPages > 1 && <Pagination>{renderPagination()}</Pagination>}
        </>
      )}
    </PageContainer>
  )
}

export default MessagesList
