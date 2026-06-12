import type React from "react"
import { useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import { useNavigate } from "react-router-dom"
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
  category: string
  status: "published" | "draft"
  authorId: string
  author?: string
  tags: string[]
  createdAt: string
  updatedAt?: string
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

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`

const SelectFilter = styled.select`
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
  background-color: #F9FAFB;
  border-radius: 8px;
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
  color: #111827;
  font-weight: 600;
  margin-bottom: 0.5rem;
`

const ArticleStatus = styled.span<{ $status: "published" | "draft" }>`
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 500;
  background-color: ${(p) => (p.$status === "published" ? "#DCFCE7" : "#FEF3C7")};
  color: ${(p) => (p.$status === "published" ? "#15803D" : "#D97706")};
`

const ArticleMeta = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #6B7280;
`

const ArticleExcerpt = styled.p`
  color: #6B7280;
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
`

const ViewLink = styled.a`
  background: none;
  border: none;
  padding: 4px 8px;
  font-size: 13px;
  cursor: pointer;
  color: #16a34a;
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    opacity: 0.8;
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

const ArticlesList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
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
    const matchesCategory = categoryFilter === "all" || article.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
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
        <SelectFilter
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value)
            setCurrentPage(1)
          }}
          aria-label="Filtrar artículos por categoría"
        >
          <option value="all">Todas las categorías</option>
          <option value="Educacion">Educación</option>
          <option value="Salud">Salud</option>
          <option value="Consejos">Consejos</option>
          <option value="Investigacion">Investigación</option>
          <option value="Motivacion">Motivación</option>
          <option value="General">General</option>
        </SelectFilter>
      </FilterContainer>

      {paginatedArticles.length === 0 && (
        <div style={{ textAlign: "center", padding: 32, opacity: 0.6, color: "#6B7280" }}>
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
              <span>Categoría: {article.category || "General"}</span>
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
              <ActionButton $variant="danger" onClick={() => handleDelete(article._id)}>Eliminar</ActionButton>
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