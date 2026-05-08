"use client"

import type React from "react"
import { useState, useEffect } from "react"
import styled from "styled-components"
import { Link } from "react-router-dom"
import { AppColors } from "../styles/colors"
import { articleAPI } from "../services/api"
import type { Article } from "../types"

// Componentes estilizados
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`

const PageTitle = styled.h1`
  font-size: 2.5rem;
  color: ${AppColors.primary};
  margin-bottom: 2rem;
  text-align: center;
`

const SearchContainer = styled.div`
  margin-bottom: 2rem;
`

const SearchInput = styled.input`
  width: 100%;
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

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`

const ArticlesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`

const ArticleCard = styled.div`
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`

const ArticleImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`

const ArticleContent = styled.div`
  padding: 1.5rem;
`

const ArticleTitle = styled.h3`
  font-size: 1.25rem;
  color: ${AppColors.textSecondary};
  margin-bottom: 0.5rem;
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
`

const ArticleLink = styled(Link)`
  color: ${AppColors.primary};
  text-decoration: none;
  font-weight: bold;

  &:hover {
    text-decoration: underline;
  }
`

const ArticlesPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([])
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true)
        const response = await articleAPI.getAll()
        console.log("Articles response:", response.data)

        // Filter published articles only
        const publishedArticles = response.data.filter((article: Article) => article.status === "published")

        setArticles(publishedArticles)
        setFilteredArticles(publishedArticles)
        setError("")
      } catch (err) {
        console.error("Error fetching articles:", err)
        setError("Error al cargar los artículos. Por favor, intenta de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredArticles(articles)
    } else {
      const filtered = articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (article.content && article.content.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredArticles(filtered)
    }
  }, [searchTerm, articles])

  return (
    <PageContainer>
      <PageTitle>Artículos</PageTitle>

      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Buscar artículos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchContainer>

      {loading ? (
        <p>Cargando artículos...</p>
      ) : error ? (
        <p>{error}</p>
      ) : filteredArticles.length === 0 ? (
        <p>No se encontraron artículos que coincidan con tu búsqueda.</p>
      ) : (
        <ArticlesGrid>
          {filteredArticles.map((article) => (
            <ArticleCard key={article._id || article.id}>
              <ArticleImage src={article.image || "/placeholder.svg?height=200&width=300"} alt={article.title} />
              <ArticleContent>
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
                <ArticleExcerpt>{article.excerpt}</ArticleExcerpt>
                <ArticleLink to={`/articles/${article._id || article.id}`}>Leer más</ArticleLink>
              </ArticleContent>
            </ArticleCard>
          ))}
        </ArticlesGrid>
      )}
    </PageContainer>
  )
}

export default ArticlesPage

