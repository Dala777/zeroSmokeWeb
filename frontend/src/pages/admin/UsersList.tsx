"use client"

import type React from "react"
import { useState } from "react"
import styled from "styled-components"
import { AppColors } from "../../styles/colors"
import Button from "../../components/ui/Button"
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

const UserStatus = styled.span<{ status: "active" | "inactive" | "pending" }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  background-color: ${(props) =>
    props.status === "active"
      ? "rgba(76, 175, 80, 0.2)"
      : props.status === "inactive"
        ? "rgba(229, 115, 115, 0.2)"
        : "rgba(255, 183, 77, 0.2)"};
  color: ${(props) =>
    props.status === "active" ? AppColors.success : props.status === "inactive" ? AppColors.error : AppColors.warning};
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
    : AppColors.text};
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

// Mock data
const mockUsers = [
  {
    id: 1,
    name: "Juan Pérez",
    email: "juan.perez@example.com",
    role: "user",
    status: "active" as const,
    lastLogin: "2023-07-15 10:30",
  },
  {
    id: 2,
    name: "María González",
    email: "maria.gonzalez@example.com",
    role: "user",
    status: "active" as const,
    lastLogin: "2023-07-14 15:45",
  },
  {
    id: 3,
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@example.com",
    role: "user",
    status: "inactive" as const,
    lastLogin: "2023-06-30 09:20",
  },
  {
    id: 4,
    name: "Ana Martínez",
    email: "ana.martinez@example.com",
    role: "user",
    status: "pending" as const,
    lastLogin: "Nunca",
  },
  {
    id: 5,
    name: "Luis Sánchez",
    email: "luis.sanchez@example.com",
    role: "admin",
    status: "active" as const,
    lastLogin: "2023-07-16 08:15",
  },
]

const UserInfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

const UsersList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [users, setUsers] = useState(mockUsers)

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    const matchesRole = roleFilter === "all" || user.role === roleFilter

    return matchesSearch && matchesStatus && matchesRole
  })

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
  }

  const handleStatusChange = (id: number, newStatus: "active" | "inactive" | "pending") => {
    setUsers(users.map((user) => (user.id === id ? { ...user, status: newStatus } : user)))
  }

  const handleDelete = (id: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      setUsers(users.filter((user) => user.id !== id))
    }
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Gestión de Usuarios</PageTitle>
        <Button>+ Nuevo Usuario</Button>
      </PageHeader>

      <SearchContainer>
        <Input
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />
      </SearchContainer>

      <FilterContainer>
        <label htmlFor="status-filter">
          <span className="sr-only">Filtrar por estado</span>
          <SelectFilter
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filtrar por estado"
            title="Filtrar por estado"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="pending">Pendientes</option>
          </SelectFilter>
        </label>

        <label htmlFor="role-filter">
          <span className="sr-only">Filtrar por rol</span>
          <SelectFilter
            id="role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            aria-label="Filtrar por rol"
            title="Filtrar por rol"
          >
            <option value="all">Todos los roles</option>
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </SelectFilter>
        </label>

        <Button 
          variant="outline" 
          size="small" 
          aria-label="Aplicar filtros"
        >
          Filtrar
        </Button>
      </FilterContainer>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Usuario</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Rol</TableHeader>
              <TableHeader>Estado</TableHeader>
              <TableHeader>Último Login</TableHeader>
              <TableHeader>Acciones</TableHeader>
            </TableRow>
          </TableHead>
          <tbody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <UserInfoContainer>
                    <UserAvatar>{getUserInitials(user.name)}</UserAvatar>
                    <span>{user.name}</span>
                  </UserInfoContainer>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell style={{ textTransform: "capitalize" }}>{user.role}</TableCell>
                <TableCell>
                  <UserStatus status={user.status}>
                    {user.status === "active" ? "Activo" : user.status === "inactive" ? "Inactivo" : "Pendiente"}
                  </UserStatus>
                </TableCell>
                <TableCell>{user.lastLogin}</TableCell>
                <TableCell>
                  <ActionButton>Editar</ActionButton>
                  {user.status === "active" ? (
                    <ActionButton onClick={() => handleStatusChange(user.id, "inactive")}>Desactivar</ActionButton>
                  ) : (
                    <ActionButton onClick={() => handleStatusChange(user.id, "active")}>Activar</ActionButton>
                  )}
                  <ActionButton onClick={() => handleDelete(user.id)}>Eliminar</ActionButton>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableContainer>

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
    </PageContainer>
  )
}

export default UsersList

