"use client"

import type React from "react"
import { useState, useEffect } from "react"
import styled from "styled-components"
import { Link } from "react-router-dom"
import { AppColors } from "../styles/colors"
import { articleAPI, faqAPI } from "../services/api"
import type { Article, FAQ } from "../types"

// Componentes estilizados
const HeroSection = styled.section`
  background-color: ${AppColors.primary};
  color: white;
  padding: 4rem 1rem;
  text-align: center;
`

const HeroTitle = styled.h1`
  font-size: 3rem;
  margin-bottom: 1.5rem;
`

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  max-width: 800px;
  margin: 0 auto 2rem;
`

const HeroButton = styled(Link)`
  display: inline-block;
  background-color: white;
  color: ${AppColors.primary};
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: bold;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.9);
    transform: translateY(-2px);
  }
`

const Section = styled.section`
  padding: 4rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
`

const SectionTitle = styled.h2`
  font-size: 2rem;
  color: ${AppColors.primary};
  text-align: center;
  margin-bottom: 2rem;
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

const FaqsContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`

const FaqItem = styled.div`
  margin-bottom: 1.5rem;
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`

const FaqQuestion = styled.h3`
  font-size: 1.25rem;
  color: ${AppColors.textSecondary};
  margin-bottom: 0.5rem;
`

const FaqAnswer = styled.p`
  color: ${AppColors.text};
`

const FaqsLink = styled(Link)`
  display: block;
  text-align: center;
  margin-top: 2rem;
  color: ${AppColors.primary};
  text-decoration: none;
  font-weight: bold;

  &:hover {
    text-decoration: underline;
  }
`

const HomePage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch articles
        const articlesResponse = await articleAPI.getAll()
        console.log("Articles response:", articlesResponse.data)

        // Fetch FAQs
        const faqsResponse = await faqAPI.getAll()
        console.log("FAQs response:", faqsResponse.data)

        // Filter published articles only
        const publishedArticles = articlesResponse.data.filter((article: Article) => article.status === "published")

        setArticles(publishedArticles)
        setFaqs(faqsResponse.data)
        setError("")
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Error al cargar los datos. Por favor, intenta de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <HeroSection>
        <HeroTitle>Bienvenido a ZeroSmoke</HeroTitle>
        <HeroSubtitle>
          Tu camino hacia una vida libre de tabaco comienza aquí. Ofrecemos apoyo, recursos y herramientas para ayudarte
          a dejar de fumar de manera efectiva y permanente.
        </HeroSubtitle>
        <HeroButton to="/contact">Comienza Ahora</HeroButton>
      </HeroSection>

      <Section>
        <SectionTitle>Artículos Recientes</SectionTitle>
        {loading ? (
          <p>Cargando artículos...</p>
        ) : error ? (
          <p>{error}</p>
        ) : articles.length === 0 ? (
          <p>No hay artículos disponibles en este momento.</p>
        ) : (
          <ArticlesGrid>
            {articles.slice(0, 3).map((article) => (
              <ArticleCard key={article._id || article.id}>
                <ArticleImage src={article.image || "/placeholder.svg?height=200&width=300"} alt={article.title} />
                <ArticleContent>
                  <ArticleTitle>{article.title}</ArticleTitle>
                  <ArticleExcerpt>{article.excerpt}</ArticleExcerpt>
                  <ArticleLink to={`/articles/${article._id || article.id}`}>Leer más</ArticleLink>
                </ArticleContent>
              </ArticleCard>
            ))}
          </ArticlesGrid>
        )}
        <ArticleLink to="/articles" style={{ display: "block", textAlign: "center", marginTop: "2rem" }}>
          Ver todos los artículos
        </ArticleLink>
      </Section>

      <Section style={{ backgroundColor: "#f9f9f9" }}>
        <SectionTitle>Preguntas Frecuentes</SectionTitle>
        {loading ? (
          <p>Cargando preguntas frecuentes...</p>
        ) : error ? (
          <p>{error}</p>
        ) : faqs.length === 0 ? (
          <p>No hay preguntas frecuentes disponibles en este momento.</p>
        ) : (
          <FaqsContainer>
            {faqs.slice(0, 3).map((faq) => (
              <FaqItem key={faq._id || faq.id}>
                <FaqQuestion>{faq.question}</FaqQuestion>
                <FaqAnswer>{faq.answer}</FaqAnswer>
              </FaqItem>
            ))}
            <FaqsLink to="/faqs">Ver todas las preguntas frecuentes</FaqsLink>
          </FaqsContainer>
        )}
      </Section>
    </div>
  )
}

export default HomePage

