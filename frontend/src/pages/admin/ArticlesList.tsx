import type React from "react"
import { useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import { useNavigate } from "react-router-dom"
import { AppColors } from "../../styles/colors"
import Button from "../../components/ui/Button"
import Card from "../../components/ui/Card"
import Input from "../../components/ui/Input"
import LoadingState from "../../components/admin/LoadingState"
import ErrorState from "../../components/admin/ErrorState"
import { articleAPI } from "../../services/api"

interface AdminArticle {
  _id: string
  title: string
  excerpt?: string
  content: string
  image?: string
  status: "published" | "draft"
  authorId: string
  author?: string
  tags: string[]
  createdAt: string
  updatedAt?: string
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

const ArticleCard = styled(Card)`
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`

const ArticleImage = styled.div`
  width: 100%;
  height: 200px;
  background-color: ${AppColors.cardBackground};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;

  @media (min-width: 768px) {
    width: 200px;
    height: 150px;
    margin-bottom: 0;
    margin-right: 1.5rem;
    flex-shrink: 0;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const ArticleContent = styled.div`
  flex: 1;
`

const ArticleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`

const ArticleTitle = styled.h3`
  font-size: 1.25rem;
  color: ${AppColors.textSecondary};
  margin-bottom: 0.5rem;
`

const ArticleStatus = styled.span<{ $status: "published" | "draft" }>`
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background-color: ${(p) => (p.$status === "published" ? "rgba(76, 175, 80, 0.2)" : "rgba(255, 183, 77, 0.2)")};
  color: ${(p) => (p.$status === "published" ? AppColors.success : AppColors.warning)};
`

const ArticleMeta = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: ${AppColors.text};
  opacity: 0.7;
`

const ArticleExcerpt = styled.p`
  color: ${AppColors.text};
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const ArticleActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
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

const ViewLink = styled.a`
  background-color: rgba(255, 255, 255, 0.1);
  color: ${AppColors.text};
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  text-decoration: none;
  display: inline-block;

  &:hover {
    background-color: ${AppColors.primary};
    color: white;
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

const PaginationInfo = styled.span`
  color: ${AppColors.textSecondary};
  font-size: 0.875rem;
`

const ArticlesList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [articles, setArticles] = useState<AdminArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const ARTICLES_PER_PAGE = 10

  const navigate = useNavigate()

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const res = await articleAPI.getAll()
      setArticles(res.data)
    } catch {
      setError("Error al cargar los artículos")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    const matchesStatus = statusFilter === "all" || article.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedArticles = filteredArticles.slice((safePage - 1) * ARTICLES_PER_PAGE, safePage * ARTICLES_PER_PAGE)

  const handleStatusChange = async (id: string, newStatus: "published" | "draft") => {
    try {
      const res = await articleAPI.update(id, { status: newStatus })
      setArticles((prev) => prev.map((a) => (a._id === id ? { ...a, ...res.data } : a)))
    } catch {
      alert("Error al cambiar el estado del artículo")
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este artículo?")) return
    try {
      await articleAPI.delete(id)
      setArticles((prev) => prev.filter((a) => a._id !== id))
    } catch {
      alert("Error al eliminar el artículo")
    }
  }

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "numeric" })
    } catch {
      return d
    }
  }

  if (loading) return <LoadingState message="Cargando artículos..." />

  if (error && articles.length === 0) {
    return (
      <PageContainer>
        <ErrorState message={error} />
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <Button onClick={fetchArticles}>Reintentar</Button>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Gestión de Artículos ({articles.length})</PageTitle>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="outline" onClick={fetchArticles}>
            Actualizar
          </Button>
          <Button variant="primary" onClick={() => navigate("/admin/articles/new")}>
            + Nuevo Artículo
          </Button>
        </div>
      </PageHeader>

      {error && (
        <div style={{ marginBottom: 16 }}>
          <ErrorState message={error} />
        </div>
      )}

      <SearchContainer>
        <Input
          placeholder="Buscar artículos..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          fullWidth
        />
      </SearchContainer>

      <FilterContainer>
        <SelectFilter
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setCurrentPage(1)
          }}
          aria-label="Filtrar artículos por estado"
        >
          <option value="all">Todos los estados</option>
          <option value="published">Publicados</option>
          <option value="draft">Borradores</option>
        </SelectFilter>
      </FilterContainer>

      {paginatedArticles.length === 0 && (
        <div style={{ textAlign: "center", padding: 32, opacity: 0.6, color: AppColors.textSecondary }}>
          {searchTerm || statusFilter !== "all"
            ? "No se encontraron artículos con los filtros actuales."
            : "No hay artículos registrados."}
        </div>
      )}

      {paginatedArticles.map((article) => (
        <ArticleCard key={article._id}>
          <ArticleImage>
            <img src={article.image || "/placeholder.svg"} alt={article.title} />
          </ArticleImage>

          <ArticleContent>
            <ArticleHeader>
              <ArticleTitle>{article.title}</ArticleTitle>
              <ArticleStatus $status={article.status}>
                {article.status === "published" ? "Publicado" : "Borrador"}
              </ArticleStatus>
            </ArticleHeader>

            <ArticleMeta>
              <span>Autor: {article.author || "Desconocido"}</span>
              <span>Fecha: {formatDate(article.createdAt)}</span>
            </ArticleMeta>

            <ArticleExcerpt>{article.excerpt || "Sin extracto"}</ArticleExcerpt>

            <ArticleActions>
              <ActionButton onClick={() => navigate(`/admin/articles/edit/${article._id}`)}>Editar</ActionButton>
              {article.status === "draft" ? (
                <ActionButton onClick={() => handleStatusChange(article._id, "published")}>Publicar</ActionButton>
              ) : (
                <ActionButton onClick={() => handleStatusChange(article._id, "draft")}>Pasar a borrador</ActionButton>
              )}
              <ActionButton onClick={() => handleDelete(article._id)}>Eliminar</ActionButton>
              <ViewLink href={`/articles/${article._id}`} target="_blank" rel="noopener noreferrer">
                Ver
              </ViewLink>
            </ArticleActions>
          </ArticleContent>
        </ArticleCard>
      ))}

      {filteredArticles.length > ARTICLES_PER_PAGE && (
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

export default ArticlesList