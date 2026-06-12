"use client"

import type React from "react"
import { useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import { Link } from "react-router-dom"
import { AppColors } from "../styles/colors"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import LoadingState from "../components/admin/LoadingState"
import { articleAPI } from "../services/api"

interface PublicArticle {
  _id: string
  title: string
  excerpt?: string
  content: string
  image?: string
  category: string
  status: string
  author?: string
  tags: string[]
  createdAt: string
}

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`

const PageTitle = styled.h1`
  font-size: 2.5rem;
  color: ${AppColors.primary};
  margin-bottom: 1rem;
  text-align: center;
`

const FilterContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 2rem;
`

const FilterPill = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background-color: ${(props) => (props.active ? AppColors.primary : "rgba(255, 255, 255, 0.1)")};
  color: ${(props) => (props.active ? "white" : AppColors.text)};
  border: 1px solid ${(props) => (props.active ? AppColors.primary : "rgba(255,255,255,0.2)")};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    background-color: ${(props) => (props.active ? AppColors.primary : "rgba(255, 255, 255, 0.2)")};
  }
`

const ArticlesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`

const ArticleCard = styled(Card)`
  display: flex;
  flex-direction: column;
  height: 100%;
`

const ArticleImage = styled.div`
  height: 200px;
  background-color: ${AppColors.cardBackground};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
  img { width: 100%; height: 100%; object-fit: cover; }
`

const ArticleTitle = styled.h3`
  font-size: 1.25rem;
  color: ${AppColors.textSecondary};
  margin-bottom: 0.5rem;
`

const ArticleMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: ${AppColors.text};
  opacity: 0.7;
  margin-bottom: 0.5rem;
`

const CategoryBadge = styled.span`
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 4px;
  background-color: rgba(76, 175, 80, 0.1);
  color: ${AppColors.primary};
`

const ArticleExcerpt = styled.p`
  color: ${AppColors.text};
  margin-bottom: 1.5rem;
  flex-grow: 1;
`

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`

const TagPill = styled.span`
  display: inline-flex;
  padding: 0.25rem 0.75rem;
  background-color: rgba(76, 175, 80, 0.1);
  color: ${AppColors.primary};
  border-radius: 16px;
  font-size: 0.75rem;
`

const categories = ["Todas", "Educacion", "Salud", "Consejos", "Investigacion", "Motivacion", "General"]

const ArticlesPage: React.FC = () => {
  const [articles, setArticles] = useState<PublicArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todas")

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const res = await articleAPI.getAll()
      const published = res.data.filter((a: PublicArticle) => a.status === "published")
      setArticles(published)
    } catch {
      setError("Error al cargar artículos")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  const filteredArticles = selectedCategory === "Todas"
    ? articles
    : articles.filter((a) => a.category === selectedCategory)

  if (loading) return <LoadingState message="Cargando artículos..." />

  return (
    <PageContainer>
      <PageTitle>Artículos</PageTitle>

      <FilterContainer>
        {categories.map((cat) => (
          <FilterPill key={cat} active={selectedCategory === cat} onClick={() => setSelectedCategory(cat)}>
            {cat === "Todas" ? "Todas" : cat}
          </FilterPill>
        ))}
      </FilterContainer>

      {error && <div style={{ textAlign: "center", color: AppColors.error, padding: "1rem" }}>{error}</div>}

      {!error && filteredArticles.length === 0 && (
        <div style={{ textAlign: "center", color: AppColors.text, padding: "2rem" }}>
          No hay artículos publicados actualmente.
        </div>
      )}

      <ArticlesGrid>
        {filteredArticles.map((article) => (
          <ArticleCard key={article._id}>
            <ArticleImage>
              <img src={article.image || "/placeholder.svg"} alt={article.title} />
            </ArticleImage>
            <ArticleTitle>{article.title}</ArticleTitle>
            <ArticleMeta>
              <span>{article.author}</span>
              <CategoryBadge>{article.category}</CategoryBadge>
              <span>{new Date(article.createdAt).toLocaleDateString()}</span>
            </ArticleMeta>
            <ArticleExcerpt>{article.excerpt}</ArticleExcerpt>
            <TagsContainer>
              {(article.tags || []).map((tag) => (
                <TagPill key={tag}>{tag}</TagPill>
              ))}
            </TagsContainer>
            <Button variant="outline" size="small" fullWidth>
              <Link to={`/articles/${article._id}`} style={{ color: "inherit", textDecoration: "none" }}>
                Leer más
              </Link>
            </Button>
          </ArticleCard>
        ))}
      </ArticlesGrid>
    </PageContainer>
  )
}

export default ArticlesPage
