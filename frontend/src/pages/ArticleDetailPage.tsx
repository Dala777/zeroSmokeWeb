"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import styled from "styled-components"
import { AppColors } from "../styles/colors"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import { getArticleById, type Article, getArticles } from "../services/storageService"

const PageContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
`

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: ${AppColors.primary};
  margin-bottom: 1.5rem;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
  
  &:before {
    content: "←";
    margin-right: 0.5rem;
  }
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
  justify-content: space-between;
  font-size: 0.875rem;
  color: ${AppColors.textSecondary};
  margin-bottom: 1.5rem;
`

const ArticleImage = styled.div`
  width: 100%;
  height: 400px;
  background-color: ${AppColors.cardBackground};
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 2rem;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const ArticleContent = styled.div`
  color: ${AppColors.text};
  line-height: 1.8;
  font-size: 1.125rem;
  
  p {
    margin-bottom: 1.5rem;
  }
  
  h2, h3, h4 {
    color: ${AppColors.textSecondary};
    margin: 2rem 0 1rem;
  }
  
  ul, ol {
    margin-bottom: 1.5rem;
    padding-left: 1.5rem;
  }
  
  li {
    margin-bottom: 0.5rem;
  }
  
  strong {
    color: ${AppColors.textSecondary};
    font-weight: 600;
  }
`

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 2rem 0;
`

const TagPill = styled.span`
  display: inline-flex;
  padding: 0.25rem 0.75rem;
  background-color: rgba(76, 175, 80, 0.1);
  color: ${AppColors.primary};
  border-radius: 16px;
  font-size: 0.875rem;
`

const RelatedArticlesSection = styled.div`
  margin-top: 3rem;
`

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: ${AppColors.primary};
  margin-bottom: 1.5rem;
`

const RelatedArticlesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`

const RelatedArticleCard = styled(Card)`
  display: flex;
  flex-direction: column;
`

const RelatedArticleTitle = styled.h3`
  font-size: 1.125rem;
  color: ${AppColors.textSecondary};
  margin-bottom: 0.5rem;
`

const RelatedArticleExcerpt = styled.p`
  color: ${AppColors.text};
  font-size: 0.875rem;
  margin-bottom: 1rem;
  flex-grow: 1;
`

// Función para convertir texto con formato markdown simple a HTML
const formatContent = (content: string) => {
  // Convertir saltos de línea a <br>
  let formatted = content.replace(/\n/g, "<br>")

  // Convertir **texto** a <strong>texto</strong>
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

  // Convertir listas
  formatted = formatted.replace(/- (.*?)(?=\n|$)/g, "<li>$1</li>")

  return formatted
}

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [article, setArticle] = useState<Article | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([])

  useEffect(() => {
    // Cargar el artículo
    if (id) {
      const articleId = Number.parseInt(id)
      const articleData = getArticleById(articleId)

      if (articleData) {
        setArticle(articleData)

        // Cargar artículos relacionados (mismas etiquetas)
        const allArticles = getArticles().filter((a) => a.status === "published" && a.id !== articleId)
        const related = allArticles.filter((a) => a.tags.some((tag) => articleData.tags.includes(tag))).slice(0, 3)

        setRelatedArticles(related)
      }
    }
  }, [id])

  // Función para verificar actualizaciones
  useEffect(() => {
    if (!id) return

    const articleId = Number.parseInt(id)

    const checkForUpdates = () => {
      const updatedArticle = getArticleById(articleId)
      if (updatedArticle && JSON.stringify(updatedArticle) !== JSON.stringify(article)) {
        setArticle(updatedArticle)
      }
    }

    const intervalId = setInterval(checkForUpdates, 2000)
    return () => clearInterval(intervalId)
  }, [id, article])

  if (!article) {
    return (
      <PageContainer>
        <h2>Artículo no encontrado</h2>
        <BackLink to="/articulos">Volver a artículos</BackLink>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <BackLink to="/articulos">Volver a artículos</BackLink>

      <ArticleHeader>
        <ArticleTitle>{article.title}</ArticleTitle>
        <ArticleMeta>
          <span>Por: {article.author}</span>
          <span>Publicado: {new Date(article.createdAt).toLocaleDateString()}</span>
        </ArticleMeta>
      </ArticleHeader>

      <ArticleImage>
        <img src={article.image || "/placeholder.svg"} alt={article.title} />
      </ArticleImage>

      <ArticleContent dangerouslySetInnerHTML={{ __html: formatContent(article.content) }} />

      <TagsContainer>
        {article.tags.map((tag) => (
          <TagPill key={tag}>{tag}</TagPill>
        ))}
      </TagsContainer>

      {relatedArticles.length > 0 && (
        <RelatedArticlesSection>
          <SectionTitle>Artículos relacionados</SectionTitle>
          <RelatedArticlesGrid>
            {relatedArticles.map((relatedArticle) => (
              <RelatedArticleCard key={relatedArticle.id}>
                <RelatedArticleTitle>{relatedArticle.title}</RelatedArticleTitle>
                <RelatedArticleExcerpt>{relatedArticle.excerpt}</RelatedArticleExcerpt>
                <Button variant="outline" size="small">
                  <Link to={`/articles/${relatedArticle.id}`} style={{ color: "inherit" }}>
                    Leer más
                  </Link>
                </Button>
              </RelatedArticleCard>
            ))}
          </RelatedArticlesGrid>
        </RelatedArticlesSection>
      )}
    </PageContainer>
  )
}

export default ArticleDetailPage

