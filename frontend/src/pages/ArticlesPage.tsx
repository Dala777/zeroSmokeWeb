"use client"

import type React from "react"
import { useEffect, useState } from "react"
import styled from "styled-components"
import { Link } from "react-router-dom"
import { AppColors } from "../styles/colors"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import { getArticles, type Article } from "../services/storageService"

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

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
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

const LoadingContainer = styled.div`
  text-align: center;
  margin-top: 2rem;
  color: ${AppColors.text};
`

const ArticlesPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        const articlesData = await getArticles();
        setArticles(articlesData.filter((article) => article.status === "published"));
      } catch (error) {
        console.error("Error loading articles:", error);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();

    // Configurar un intervalo para verificar actualizaciones
    const intervalId = setInterval(loadArticles, 10000);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, []);

  if (loading && articles.length === 0) {
    return (
      <PageContainer>
        <PageTitle>Artículos</PageTitle>
        <LoadingContainer>Cargando artículos...</LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageTitle>Artículos</PageTitle>

      {articles.length === 0 ? (
        <LoadingContainer>No hay artículos publicados actualmente.</LoadingContainer>
      ) : (
        <ArticlesGrid>
          {articles.map((article) => (
            <ArticleCard key={article._id || article.id}>
              <ArticleImage>
                <img src={article.image || "/placeholder.svg"} alt={article.title} />
              </ArticleImage>

              <ArticleTitle>{article.title}</ArticleTitle>

              <ArticleMeta>
                <span>{article.author}</span>
                <span>{new Date(article.createdAt).toLocaleDateString()}</span>
              </ArticleMeta>

              <ArticleExcerpt>{article.excerpt}</ArticleExcerpt>

              <TagsContainer>
                {article.tags.map((tag) => (
                  <TagPill key={tag}>{tag}</TagPill>
                ))}
              </TagsContainer>

              <Button variant="outline" size="small" fullWidth>
                <Link to={`/articles/${article._id || article.id}`} style={{ color: "inherit" }}>
                  Leer más
                </Link>
              </Button>
            </ArticleCard>
          ))}
        </ArticlesGrid>
      )}
    </PageContainer>
  );
};

export default ArticlesPage;