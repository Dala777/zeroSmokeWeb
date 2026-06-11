import type React from "react"
import { useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import axios from "axios"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"
import LoadingState from "../../components/admin/LoadingState"
import ErrorState from "../../components/admin/ErrorState"
import { Shield, ShieldOff } from "lucide-react"

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

interface AdminUser {
  _id: string
  name: string
  email: string
  role: "admin" | "user"
  status: "active" | "inactive"
  lastLogin?: string
  createdAt: string
}

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
  font-size: 1.5rem;
  color: #111827;
  font-weight: 700;
`

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`

const TableContainer = styled.div`
  overflow-x: auto;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  background: white;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`

const TableHead = styled.thead`
  background-color: #F9FAFB;
`

const TableRow = styled.tr`
  border-bottom: 1px solid #E5E7EB;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #F9FAFB;
  }
`

const TableHeader = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
`

const TableCell = styled.td`
  padding: 12px 16px;
  color: #111827;
  font-size: 14px;
`

const UserInfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #16a34a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  font-size: 13px;
`

const StatusBadge = styled.span<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${(p) => (p.$active ? "#DCFCE7" : "#FEE2E2")};
  color: ${(p) => (p.$active ? "#15803D" : "#DC2626")};
`

const ActionButton = styled.button<{ $variant?: "warning" | "danger" }>`
  background: none;
  border: none;
  padding: 4px 8px;
  font-size: 13px;
  cursor: pointer;
  color: ${(p) => (p.$variant === "danger" ? "#DC2626" : "#D97706")};
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
`

const PageButton = styled.button<{ $active?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(p) => (p.$active ? "#16a34a" : "transparent")};
  color: ${(p) => (p.$active ? "white" : "#6B7280")};
  border: 1px solid ${(p) => (p.$active ? "#16a34a" : "#D1D5DB")};
  cursor: pointer;
  font-size: 14px;

  &:hover:not([disabled]) {
    background-color: ${(p) => (p.$active ? "#15803d" : "#F9FAFB")};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const PaginationInfo = styled.span`
  color: #6B7280;
  font-size: 0.875rem;
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #6B7280;

  svg {
    margin-bottom: 16px;
    opacity: 0.4;
  }

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin: 0 0 8px 0;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
`

const AdminsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const ITEMS_PER_PAGE = 10

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const token = localStorage.getItem("token")
      const response = await axios.get<AdminUser[]>(`${API_URL}/users`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      setUsers(response.data)
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Error al cargar administradores"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const admins = users.filter((u) => u.role === "admin")

  const filteredAdmins = admins.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const totalPages = Math.max(1, Math.ceil(filteredAdmins.length / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedAdmins = filteredAdmins.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

  const getUserInitials = (name: string) =>
    name
      .split(" ")
      .map((p) => p.charAt(0))
      .join("")
      .toUpperCase()

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active"
    try {
      const token = localStorage.getItem("token")
      await axios.put(
        `${API_URL}/users/${id}`,
        { status: newStatus },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
      )
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, status: newStatus } : u)))
    } catch {
      alert("Error al actualizar el estado")
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este administrador?")) return
    try {
      const token = localStorage.getItem("token")
      await axios.delete(`${API_URL}/users/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      setUsers((prev) => prev.filter((u) => u._id !== id))
    } catch {
      alert("Error al eliminar el administrador")
    }
  }

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return d
    }
  }

  if (loading) {
    return <LoadingState message="Cargando administradores..." />
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorState message={error} />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Administradores ({admins.length})</PageTitle>
        <Button onClick={fetchUsers}>Actualizar</Button>
      </PageHeader>

      <SearchContainer>
        <Input
          placeholder="Buscar administradores por nombre o email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          fullWidth
        />
      </SearchContainer>

      {paginatedAdmins.length === 0 ? (
        <TableContainer>
          <EmptyState>
            <ShieldOff size={48} strokeWidth={1.5} />
            <h3>No hay administradores</h3>
            <p>{searchTerm ? "No se encontraron resultados con ese término de búsqueda." : "Aún no se han registrado administradores en el sistema."}</p>
          </EmptyState>
        </TableContainer>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Administrador</TableHeader>
                  <TableHeader>Email</TableHeader>
                  <TableHeader>Estado</TableHeader>
                  <TableHeader>Registro</TableHeader>
                  <TableHeader>Último Login</TableHeader>
                  <TableHeader>Acciones</TableHeader>
                </TableRow>
              </TableHead>
              <tbody>
                {paginatedAdmins.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <UserInfoContainer>
                        <UserAvatar>{getUserInitials(user.name)}</UserAvatar>
                        <div>
                          <span style={{ fontWeight: 500 }}>{user.name}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                            <Shield size={12} />
                            Administrador
                          </div>
                        </div>
                      </UserInfoContainer>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <StatusBadge $active={user.status === "active"}>
                        {user.status === "active" ? "Activo" : "Inactivo"}
                      </StatusBadge>
                    </TableCell>
                    <TableCell style={{ fontSize: "0.85rem", color: "#6B7280" }}>{formatDate(user.createdAt)}</TableCell>
                    <TableCell style={{ fontSize: "0.85rem", color: "#6B7280" }}>
                      {user.lastLogin ? formatDate(user.lastLogin) : <span style={{ opacity: 0.4 }}>Nunca</span>}
                    </TableCell>
                    <TableCell>
                      <ActionButton
                        $variant="warning"
                        disabled={false}
                        onClick={() => handleStatusToggle(user._id, user.status)}
                      >
                        {user.status === "active" ? "Desactivar" : "Activar"}
                      </ActionButton>
                      <ActionButton $variant="danger" onClick={() => handleDelete(user._id)}>
                        Eliminar
                      </ActionButton>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </TableContainer>

          {filteredAdmins.length > ITEMS_PER_PAGE && (
            <Pagination>
              <PageButton disabled={safePage <= 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                &lt;
              </PageButton>
              <PaginationInfo>
                Página {safePage} de {totalPages}
              </PaginationInfo>
              <PageButton disabled={safePage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                &gt;
              </PageButton>
            </Pagination>
          )}
        </>
      )}
    </PageContainer>
  )
}

export default AdminsPage
