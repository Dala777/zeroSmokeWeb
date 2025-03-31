"use client"

import type React from "react"
import { useState, useEffect } from "react"
import styled from "styled-components"
import { useNavigate } from "react-router-dom"
import { AppColors } from "../../styles/colors"
import Button from "../../components/ui/Button"
import Card from "../../components/ui/Card"
import Input from "../../components/ui/Input"
import { articleService } from "../../services/api"

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

const ArticleStatus = styled.span<{ status: "published" | "draft" }>`
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background-color: ${(props) => (props.status === "published" ? "rgba(76, 175, 80, 0.2)" : "rgba(255, 183, 77, 0.2)")};
  color: ${(props) => (props.status === "published" ? AppColors.success : AppColors.warning)};
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

// Define the article type to avoid TypeScript errors
interface Article {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  status: "published" | "draft";
  image?: string;
}

// Mock data
const mockArticles: Article[] = [
  {
    id: 1,
    title: "Efectos del tabaco en el sistema respiratorio",
    excerpt:
      "Los efectos nocivos del tabaco en el sistema respiratorio son extensos y bien documentados. Desde la irritación inmediata hasta enfermedades graves...",
    author: "Dr. Juan Pérez",
    date: "2023-05-15",
    status: "published",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    title: "Beneficios inmediatos al dejar de fumar",
    excerpt:
      "Dejar de fumar tiene beneficios inmediatos para la salud. En tan solo 20 minutos después de su último cigarrillo, su cuerpo comienza un proceso de recuperación...",
    author: "Dra. María González",
    date: "2023-06-02",
    status: "published",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    title: "Estrategias efectivas para dejar de fumar",
    excerpt:
      "Hay varias estrategias que han demostrado ser efectivas para ayudar a las personas a dejar de fumar. Desde terapias de reemplazo de nicotina hasta...",
    author: "Dr. Carlos Rodríguez",
    date: "2023-06-20",
    status: "draft",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 4,
    title: "El tabaquismo pasivo y sus riesgos",
    excerpt:
      "El tabaquismo pasivo, también conocido como humo de segunda mano, es la inhalación involuntaria del humo de tabaco por los no fumadores...",
    author: "Dra. Ana Martínez",
    date: "2023-07-05",
    status: "published",
    image: "/placeholder.svg?height=200&width=300",
  },
]

const ArticlesList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const navigate = useNavigate()

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true)
        const response = await articleService.getAll(statusFilter !== "all" ? statusFilter : undefined)
        setArticles(response.data)
        setError("")
      } catch (err) {
        console.error("Error fetching articles:", err)
        setError("Error al cargar los artículos. Por favor, intenta de nuevo.")
        // Fallback to mockArticles if API fails
        setArticles(mockArticles)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [statusFilter])

  const filteredArticles = articles.filter((article) => {
    return (
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este artículo?")) {
      try {
        await articleService.delete(id)
        setArticles(articles.filter((article) => article.id !== id))
      } catch (err) {
        console.error("Error deleting article:", err)
        alert("Error al eliminar el artículo. Por favor, intenta de nuevo.")
      }
    }
  }

  const handleStatusChange = async (id: number, newStatus: "published" | "draft") => {
    try {
      await articleService.update(id, { status: newStatus })
      setArticles(
        articles.map((article) =>
          article.id === id ? { ...article, status: newStatus } : article
        )
      )
    } catch (err) {
      console.error("Error updating article status:", err)
      alert("Error al actualizar el estado del artículo. Por favor, intenta de nuevo.")
    }
  }

  if (loading) {
    return <div>Cargando artículos...</div>
  }

  if (error && articles.length === 0) {
    return <div>{error}</div>
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Gestión de Artículos</PageTitle>
        <Button variant="primary" onClick={() => navigate("/admin/articles/new")}>
          + Nuevo Artículo
        </Button>
      </PageHeader>

      <SearchContainer>
        <Input
          placeholder="Buscar artículos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />
      </SearchContainer>

      <FilterContainer>
        <label htmlFor="status-filter">
          <span className="sr-only">Filtrar artículos por estado</span>
          <SelectFilter
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filtrar artículos por estado"
            aria-describedby="status-filter-description"
          >
            <option value="all">Todos los estados</option>
            <option value="published">Publicados</option>
            <option value="draft">Borradores</option>
          </SelectFilter>
        </label>
        <span id="status-filter-description" className="sr-only">
          Seleccione un estado para filtrar los artículos
        </span>

        <Button variant="outline" size="small">
          Filtrar
        </Button>
      </FilterContainer>

      {filteredArticles.length === 0 ? (
        <div>No se encontraron artículos que coincidan con los criterios de búsqueda.</div>
      ) : (
        filteredArticles.map((article) => (
          <ArticleCard key={article.id}>
            <ArticleImage>
              <img src={article.image || "/placeholder.svg"} alt={article.title} />
            </ArticleImage>

            <ArticleContent>
              <ArticleHeader>
                <ArticleTitle>{article.title}</ArticleTitle>
                <ArticleStatus status={article.status}>
                  {article.status === "published" ? "Publicado" : "Borrador"}
                </ArticleStatus>
              </ArticleHeader>

              <ArticleMeta>
                <span>Autor: {article.author}</span>
                <span>Fecha: {article.date}</span>
              </ArticleMeta>

              <ArticleExcerpt>{article.excerpt}</ArticleExcerpt>

              <ArticleActions>
                <ActionButton onClick={() => navigate(`/admin/articles/edit/${article.id}`)}>Editar</ActionButton>
                {article.status === "draft" ? (
                  <ActionButton onClick={() => handleStatusChange(article.id, "published")}>Publicar</ActionButton>
                ) : (
                  <ActionButton onClick={() => handleStatusChange(article.id, "draft")}>Pasar a borrador</ActionButton>
                )}
                <ActionButton onClick={() => handleDelete(article.id)}>Eliminar</ActionButton>
                <ViewLink href={`/articles/${article.id}`} target="_blank">
                  Ver
                </ViewLink>
              </ArticleActions>
            </ArticleContent>
          </ArticleCard>
        ))
      )}

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

export default ArticlesList