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
import { Calendar, User, ArrowRight } from "lucide-react"

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
  padding: 3rem 1.5rem;
`

const PageTitle = styled.h1`
  font-size: 2rem;
  color: ${AppColors.text};
  margin-bottom: 0.5rem;
  text-align: center;
`

const PageSubtitle = styled.p`
  text-align: center;
  color: ${AppColors.textSecondary};
  margin-bottom: 2rem;
  font-size: 1.05rem;
`

const FilterContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 2.5rem;
`

const FilterPill = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1.25rem;
  border-radius: 20px;
  background-color: ${(props) => (props.$active ? AppColors.primary : "transparent")};
  color: ${(props) => (props.$active ? "white" : AppColors.textSecondary)};
  border: 1px solid ${(props) => (props.$active ? AppColors.primary : AppColors.border)};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.25s ease;
  font-weight: ${(props) => (props.$active ? "600" : "400")};

  &:hover {
    border-color: ${AppColors.primary};
    color: ${(props) => (props.$active ? "white" : AppColors.primary)};
  }
`

const ArticlesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
`

const ArticleCard = styled(Card)`
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  border: 1px solid ${AppColors.border};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
    border-color: ${AppColors.primary}30;
  }
`

const ArticleImage = styled.div`
  height: 200px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  ${ArticleCard}:hover img {
    transform: scale(1.05);
  }
`

const ArticleBody = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
`

const CategoryBadge = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  background: linear-gradient(135deg, ${AppColors.primary}15, ${AppColors.tertiary});
  color: ${AppColors.accent};
  margin-bottom: 0.75rem;
  width: fit-content;
  text-transform: uppercase;
  letter-spacing: 0.03em;
`

const ArticleTitle = styled.h3`
  font-size: 1.1rem;
  color: ${AppColors.text};
  margin-bottom: 0.5rem;
  line-height: 1.4;
  font-weight: 600;
`

const ArticleMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: ${AppColors.textLight};
  margin-bottom: 0.75rem;
  align-items: center;
`

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`

const ArticleExcerpt = styled.p`
  color: ${AppColors.textSecondary};
  font-size: 0.875rem;
  line-height: 1.6;
  flex-grow: 1;
  margin-bottom: 1rem;
`

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 1rem;
`

const TagPill = styled.span`
  display: inline-flex;
  padding: 0.2rem 0.6rem;
  background-color: ${AppColors.surface};
  color: ${AppColors.textLight};
  border-radius: 4px;
  font-size: 0.7rem;
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
      <PageSubtitle>Información y recursos para ayudarte en tu camino para dejar de fumar.</PageSubtitle>

      <FilterContainer>
        {categories.map((cat) => (
          <FilterPill key={cat} $active={selectedCategory === cat} onClick={() => setSelectedCategory(cat)}>
            {cat === "Todas" ? "Todas" : cat}
          </FilterPill>
        ))}
      </FilterContainer>

      {error && <div style={{ textAlign: "center", color: AppColors.error, padding: "1rem" }}>{error}</div>}

      {!error && filteredArticles.length === 0 && (
        <div style={{ textAlign: "center", color: AppColors.textSecondary, padding: "2rem" }}>
          No hay artículos publicados actualmente.
        </div>
      )}

      <ArticlesGrid>
        {filteredArticles.map((article) => (
          <ArticleCard key={article._id}>
            <ArticleImage>
              <img src={article.image || "/placeholder.svg"} alt={article.title} />
            </ArticleImage>
            <ArticleBody>
              <CategoryBadge>{article.category}</CategoryBadge>
              <ArticleTitle>{article.title}</ArticleTitle>
              <ArticleMeta>
                {article.author && (
                  <MetaItem>
                    <User size={12} />
                    {article.author}
                  </MetaItem>
                )}
                <MetaItem>
                  <Calendar size={12} />
                  {new Date(article.createdAt).toLocaleDateString()}
                </MetaItem>
              </ArticleMeta>
              <ArticleExcerpt>{article.excerpt}</ArticleExcerpt>
              {article.tags && article.tags.length > 0 && (
                <TagsContainer>
                  {(article.tags || []).map((tag) => (
                    <TagPill key={tag}>{tag}</TagPill>
                  ))}
                </TagsContainer>
              )}
              <Button variant="outline" size="small" fullWidth>
                <Link to={`/articles/${article._id}`} style={{ color: "inherit", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  Leer más <ArrowRight size={14} />
                </Link>
              </Button>
            </ArticleBody>
          </ArticleCard>
        ))}
      </ArticlesGrid>
    </PageContainer>
  )
}

export default ArticlesPage