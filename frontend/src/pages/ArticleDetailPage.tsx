"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import styled from "styled-components"
import { AppColors } from "../styles/colors"
import { articleAPI } from "../services/api"
import type { Article } from "../types"

// Componentes estilizados
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`

const ArticleHeader = styled.div`
  margin-bottom: 2rem;
`

const ArticleTitle = styled.h1`
  font-size: 2.5rem;
  color: ${AppColors.primary};
  margin-bottom: 1rem;
`

const ArticleMeta = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: ${AppColors.text};
  opacity: 0.7;
`

const ArticleImage = styled.img`
  width: 100%;
  max-height: 500px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 2rem;
`

const ArticleContent = styled.div`
  color: ${AppColors.text};
  line-height: 1.8;
  font-size: 1.1rem;
  white-space: pre-wrap;
`

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 2rem 0;
`

const Tag = styled.span`
  background-color: rgba(76, 175, 80, 0.1);
  color: ${AppColors.primary};
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
`

const RelatedArticlesSection = styled.div`
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: ${AppColors.primary};
  margin-bottom: 1.5rem;
`

const RelatedArticlesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`

const RelatedArticleCard = styled.div`
  background-color: ${AppColors.cardBackground};
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`

const RelatedArticleImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
`

const RelatedArticleContent = styled.div`
  padding: 1rem;
`

const RelatedArticleTitle = styled.h3`
  font-size: 1.1rem;
  color: ${AppColors.textSecondary};
  margin-bottom: 0.5rem;
`

const RelatedArticleLink = styled(Link)`
  color: ${AppColors.primary};
  text-decoration: none;
  font-weight: bold;
  font-size: 0.875rem;

  &:hover {
    text-decoration: underline;
  }
`

const BackLink = styled(Link)`
  display: inline-block;
  margin-bottom: 1rem;
  color: ${AppColors.primary};
  text-decoration: none;
  font-size: 0.875rem;

  &:hover {
    text-decoration: underline;
  }
`

const LoadingMessage = styled.p`
  text-align: center;
  padding: 2rem;
  color: ${AppColors.text};
`

const ErrorMessage = styled.div`
  color: ${AppColors.error};
  background-color: rgba(244, 67, 54, 0.1);
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [article, setArticle] = useState<Article | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true)
        const response = await articleAPI.getById(id!)
        setArticle(response.data)
        setError("")
      } catch (err) {
        console.error("Error fetching article:", err)
        setError("Error al cargar el artículo. Por favor, intenta de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchArticle()
    }
  }, [id])

  useEffect(() => {
    const fetchRelatedArticles = async () => {
      if (!article || !article.tags || article.tags.length === 0) return

      try {
        const response = await articleAPI.getAll()

        // Filter published articles and exclude current article
        const publishedArticles = response.data.filter(
          (a: Article) => a.status === "published" && a._id !== article._id,
        )

        // Find articles with matching tags
        const related = publishedArticles.filter((a: Article) => {
          if (!a.tags) return false
          return a.tags.some((tag) => article.tags.includes(tag))
        })

        setRelatedArticles(related.slice(0, 3))
      } catch (err) {
        console.error("Error fetching related articles:", err)
      }
    }

    if (article) {
      fetchRelatedArticles()
    }
  }, [article])

  if (loading) {
    return <LoadingMessage>Cargando artículo...</LoadingMessage>
  }

  if (error) {
    return (
      <PageContainer>
        <BackLink to="/articles">← Volver a Artículos</BackLink>
        <ErrorMessage>{error}</ErrorMessage>
      </PageContainer>
    )
  }

  if (!article) {
    return (
      <PageContainer>
        <BackLink to="/articles">← Volver a Artículos</BackLink>
        <ErrorMessage>Artículo no encontrado</ErrorMessage>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <BackLink to="/articles">← Volver a Artículos</BackLink>

      <ArticleHeader>
        <ArticleTitle>{article.title}</ArticleTitle>
        <ArticleMeta>
          <span>Por: {article.author || "Admin"}</span>
          <span>
            {new Date(article.createdAt).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </ArticleMeta>
      </ArticleHeader>

      {article.image && <ArticleImage src={article.image} alt={article.title} />}

      <ArticleContent>{article.content}</ArticleContent>

      {article.tags && article.tags.length > 0 && (
        <TagsContainer>
          {article.tags.map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </TagsContainer>
      )}

      {relatedArticles.length > 0 && (
        <RelatedArticlesSection>
          <SectionTitle>Artículos Relacionados</SectionTitle>
          <RelatedArticlesGrid>
            {relatedArticles.map((relatedArticle) => (
              <RelatedArticleCard key={relatedArticle._id || relatedArticle.id}>
                <RelatedArticleImage
                  src={relatedArticle.image || "/placeholder.svg?height=150&width=300"}
                  alt={relatedArticle.title}
                />
                <RelatedArticleContent>
                  <RelatedArticleTitle>{relatedArticle.title}</RelatedArticleTitle>
                  <RelatedArticleLink to={`/articles/${relatedArticle._id || relatedArticle.id}`}>
                    Leer más
                  </RelatedArticleLink>
                </RelatedArticleContent>
              </RelatedArticleCard>
            ))}
          </RelatedArticlesGrid>
        </RelatedArticlesSection>
      )}
    </PageContainer>
  )
}

export default ArticleDetailPage

