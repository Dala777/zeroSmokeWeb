import type React from "react"
import { useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import axios from "axios"
import { AppColors } from "../../styles/colors"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"
import LoadingState from "../../components/admin/LoadingState"
import ErrorState from "../../components/admin/ErrorState"

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

interface AdminUser {
  _id: string
  name: string
  email: string
  role: "admin" | "user"
  status: "active" | "inactive" | "pending"
  lastLogin?: string
  createdAt: string
  updatedAt?: string
  dependencyLevel?: string
}

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
  flex-wrap: wrap;
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

const TableContainer = styled.div`
  overflow-x: auto;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: ${AppColors.cardBackground};
  border-radius: 8px;
  overflow: hidden;
`

const TableHead = styled.thead`
  background-color: rgba(255, 255, 255, 0.05);
`

const TableRow = styled.tr`
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`

const TableHeader = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 500;
  color: ${AppColors.textSecondary};
`

const TableCell = styled.td`
  padding: 1rem;
  color: ${AppColors.text};
`

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${AppColors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
`

const UserStatus = styled.span<{ $status: "active" | "inactive" | "pending" }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  background-color: ${(p) =>
    p.$status === "active"
      ? "rgba(76, 175, 80, 0.2)"
      : p.$status === "inactive"
        ? "rgba(229, 115, 115, 0.2)"
        : "rgba(255, 183, 77, 0.2)"};
  color: ${(p) =>
    p.$status === "active" ? AppColors.success : p.$status === "inactive" ? AppColors.error : AppColors.warning};
`

const DependencyBadge = styled.span<{ $level: string }>`
  display: inline-block;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.7rem;
  background-color: ${(p) =>
    p.$level === "high" ? "rgba(229, 115, 115, 0.2)" : p.$level === "moderate" ? "rgba(255, 183, 77, 0.2)" : "rgba(76, 175, 80, 0.2)"};
  color: ${(p) =>
    p.$level === "high" ? AppColors.error : p.$level === "moderate" ? AppColors.warning : AppColors.success};
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
  margin-right: 0.5rem;

  &:hover {
    background-color: ${AppColors.primary};
    color: white;
  }

  &:last-child {
    margin-right: 0;
  }
`

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
`

const PageButton = styled.button<{ $isActive?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(p) => (p.$isActive ? AppColors.primary : "rgba(255, 255, 255, 0.1)")};
  color: ${(p) => (p.$isActive ? "white" : AppColors.text)};
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover:not([disabled]) {
    background-color: ${(p) => (p.$isActive ? AppColors.primary : "rgba(255, 255, 255, 0.2)")};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const UserInfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`

const PaginationInfo = styled.span`
  color: ${AppColors.textSecondary};
  font-size: 0.875rem;
`

const UsersList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [toggling, setToggling] = useState<string | null>(null)
  const USERS_PER_PAGE = 10

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
      const message =
        err?.response?.data?.message || err?.message || "Error al cargar usuarios"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesStatus && matchesRole
  })

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedUsers = filteredUsers.slice((safePage - 1) * USERS_PER_PAGE, safePage * USERS_PER_PAGE)

  const getUserInitials = (name: string) =>
    name
      .split(" ")
      .map((p) => p.charAt(0))
      .join("")
      .toUpperCase()

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active"
    try {
      setToggling(id)
      const token = localStorage.getItem("token")
      await axios.put(
        `${API_URL}/users/${id}`,
        { status: newStatus },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
      )
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, status: newStatus } : u)),
      )
    } catch {
      alert("Error al actualizar el estado del usuario")
    } finally {
      setToggling(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) return
    try {
      const token = localStorage.getItem("token")
      await axios.delete(`${API_URL}/users/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      setUsers((prev) => prev.filter((u) => u._id !== id))
    } catch {
      alert("Error al eliminar el usuario")
    }
  }

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return d
    }
  }

  const getDependencyLabel = (level?: string) => {
    if (!level) return null
    const labels: Record<string, string> = { low: "Baja", moderate: "Moderada", high: "Alta" }
    return labels[level] || level
  }

  if (loading) {
    return <LoadingState message="Cargando usuarios..." />
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
        <PageTitle>Gestión de Usuarios ({users.length})</PageTitle>
        <Button onClick={fetchUsers}>Actualizar</Button>
      </PageHeader>

      <SearchContainer>
        <Input
          placeholder="Buscar usuarios por nombre o email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          fullWidth
        />
      </SearchContainer>

      <MetaRow>
        <FilterContainer style={{ margin: 0 }}>
          <SelectFilter
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            aria-label="Filtrar por estado"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="pending">Pendientes</option>
          </SelectFilter>

          <SelectFilter
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value)
              setCurrentPage(1)
            }}
            aria-label="Filtrar por rol"
          >
            <option value="all">Todos los roles</option>
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </SelectFilter>
        </FilterContainer>
      </MetaRow>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Usuario</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Rol</TableHeader>
              <TableHeader>Dependencia</TableHeader>
              <TableHeader>Estado</TableHeader>
              <TableHeader>Registro</TableHeader>
              <TableHeader>Último Login</TableHeader>
              <TableHeader>Acciones</TableHeader>
            </TableRow>
          </TableHead>
          <tbody>
            {paginatedUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} style={{ textAlign: "center", opacity: 0.6 }}>
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            )}
            {paginatedUsers.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  <UserInfoContainer>
                    <UserAvatar>{getUserInitials(user.name)}</UserAvatar>
                    <span>{user.name}</span>
                  </UserInfoContainer>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell style={{ textTransform: "capitalize" }}>{user.role}</TableCell>
                <TableCell>
                  {user.dependencyLevel ? (
                    <DependencyBadge $level={user.dependencyLevel}>
                      {getDependencyLabel(user.dependencyLevel)}
                    </DependencyBadge>
                  ) : (
                    <span style={{ opacity: 0.4 }}>--</span>
                  )}
                </TableCell>
                <TableCell>
                  <UserStatus $status={user.status}>
                    {user.status === "active" ? "Activo" : user.status === "inactive" ? "Inactivo" : "Pendiente"}
                  </UserStatus>
                </TableCell>
                <TableCell style={{ fontSize: "0.85rem" }}>{formatDate(user.createdAt)}</TableCell>
                <TableCell style={{ fontSize: "0.85rem" }}>
                  {user.lastLogin ? formatDate(user.lastLogin) : <span style={{ opacity: 0.4 }}>Nunca</span>}
                </TableCell>
                <TableCell>
                  <ActionButton disabled={toggling === user._id} onClick={() => handleStatusToggle(user._id, user.status)}>
                    {user.status === "active" ? "Desactivar" : "Activar"}
                  </ActionButton>
                  <ActionButton onClick={() => handleDelete(user._id)}>Eliminar</ActionButton>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableContainer>

      {filteredUsers.length > USERS_PER_PAGE && (
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
    </PageContainer>
  )
}

export default UsersList