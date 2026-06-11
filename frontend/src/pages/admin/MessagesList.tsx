"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import { getMessages } from "../../services/storageService"
import type { Message } from "../../services/storageService"

const PageContainer = styled.div`
  padding: 1.5rem;
`

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`

const PageTitle = styled.h2`
  font-size: 24px;
  color: #111827;
  font-weight: 700;
`

const RefreshButton = styled.button`
  padding: 10px 20px;
  background-color: #16a34a;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #15803d;
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
  padding: 10px 14px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  background-color: #FFFFFF;
  color: #111827;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #16a34a;
    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.15);
  }

  &::placeholder {
    color: #9CA3AF;
  }
`

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`

const FilterButton = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${(props) => (props.active ? "#16a34a" : "transparent")};
  color: ${(props) => (props.active ? "white" : "#6B7280")};

  &:hover {
    background-color: ${(props) => (props.active ? "#15803d" : "#F3F4F6")};
  }
`

const MessagesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
`

const TableHead = styled.thead`
  background-color: #F9FAFB;
`

const TableRow = styled.tr<{ unread?: boolean }>`
  border-bottom: 1px solid #F3F4F6;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-weight: ${(props) => (props.unread ? "bold" : "normal")};

  &:hover {
    background-color: #F9FAFB;
  }
`

const TableHeader = styled.th`
  padding: 12px 16px;
  text-align: left;
  color: #6B7280;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  border-bottom: 1px solid #E5E7EB;
`

const TableCell = styled.td`
  padding: 16px;
  font-size: 14px;
`

const SenderCell = styled(TableCell)`
  color: #374151;
`

const SubjectCell = styled(TableCell)`
  color: #111827;
  font-weight: 500;
`

const DateCell = styled(TableCell)`
  color: #9CA3AF;
  font-size: 13px;
`

const StatusBadge = styled.span<{ status: "new" | "read" | "answered" }>`
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 500;
  background-color: ${(props) =>
    props.status === "new"
      ? "#DCFCE7"
      : props.status === "read"
        ? "#F3F4F6"
        : "#DBEAFE"};
  color: ${(props) =>
    props.status === "new" ? "#15803D" : props.status === "read" ? "#6B7280" : "#1D4ED8"};
`

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6B7280;
`

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
`

const PageButton = styled.button<{ active?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => (props.active ? "#16a34a" : "transparent")};
  color: ${(props) => (props.active ? "white" : "#6B7280")};
  border: 1px solid ${(props) => (props.active ? "#16a34a" : "#D1D5DB")};
  cursor: pointer;
  font-size: 14px;

  &:hover:not([disabled]) {
    background-color: ${(props) => (props.active ? "#15803d" : "#F9FAFB")};
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
      setMessages(messagesData)
      setFilteredMessages(messagesData)
      setError("")
    } catch (err: any) {
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
    setCurrentPage(1)
  }, [searchTerm, statusFilter, messages])

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
    if (!id) return
    navigate(`/admin/messages/${id}`)
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchMessages()
  }

  const renderPagination = () => {
    const pageButtons = []

    pageButtons.push(
      <PageButton
        key="prev"
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
      >
        &lt;
      </PageButton>,
    )

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
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
        pageButtons.push(<span key={`ellipsis-${i}`}>...</span>)
      }
    }

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
                  <SenderCell>{message.name}</SenderCell>
                  <SubjectCell>{message.subject}</SubjectCell>
                  <DateCell>
                    {new Date(message.createdAt).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </DateCell>
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
