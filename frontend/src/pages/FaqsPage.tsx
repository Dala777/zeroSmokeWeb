"use client"

import type React from "react"
import { useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import { AppColors } from "../styles/colors"
import Card from "../components/ui/Card"
import LoadingState from "../components/admin/LoadingState"
import { faqAPI } from "../services/api"

interface PublicFAQ {
  _id: string
  question: string
  answer: string
  category: string
  status: string
  order: number
}

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

const CategorySection = styled.div`
  margin-bottom: 2.5rem;
`

const CategoryTitle = styled.h2`
  font-size: 1.5rem;
  color: ${AppColors.accent};
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid ${AppColors.tertiary};
`

const FaqCard = styled(Card)`
  margin-bottom: 1rem;
`

const FaqQuestion = styled.button`
  width: 100%;
  background: none;
  border: none;
  font-size: 1.125rem;
  color: ${AppColors.text};
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  text-align: left;
  font-family: inherit;

  &:after {
    content: "+";
    font-size: 1.5rem;
    color: ${AppColors.primary};
    transition: transform 0.3s ease;
    flex-shrink: 0;
    margin-left: 1rem;
  }

  &[aria-expanded="true"]:after {
    content: "−";
  }
`

const FaqAnswer = styled.div<{ isOpen: boolean }>`
  color: ${AppColors.textSecondary};
  max-height: ${(props) => (props.isOpen ? "1000px" : "0")};
  overflow: hidden;
  transition: max-height 0.4s ease, margin 0.3s ease;
  margin-top: ${(props) => (props.isOpen ? "1rem" : "0")};
  line-height: 1.6;
`

const ErrorMessage = styled.div`
  text-align: center;
  color: ${AppColors.error};
  padding: 2rem;
`

const FaqsPage: React.FC = () => {
  const [faqs, setFaqs] = useState<PublicFAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [openFaqId, setOpenFaqId] = useState<string | null>(null)

  const fetchFaqs = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const res = await faqAPI.getActive()
      setFaqs(res.data)
    } catch {
      setError("Error al cargar las preguntas frecuentes")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFaqs()
  }, [fetchFaqs])

  const groupedByCategory = faqs.reduce<Record<string, PublicFAQ[]>>((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = []
    acc[faq.category].push(faq)
    return acc
  }, {})

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id)
  }

  if (loading) return <LoadingState message="Cargando preguntas frecuentes..." />

  if (error) {
    return (
      <PageContainer>
        <PageTitle>Preguntas Frecuentes</PageTitle>
        <ErrorMessage>{error}</ErrorMessage>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageTitle>Preguntas Frecuentes</PageTitle>

      {faqs.length === 0 ? (
        <div style={{ textAlign: "center", color: AppColors.textSecondary, padding: "2rem" }}>
          No hay preguntas frecuentes disponibles en este momento.
        </div>
      ) : (
        Object.entries(groupedByCategory).map(([category, categoryFaqs]) => (
          <CategorySection key={category}>
            <CategoryTitle>{category}</CategoryTitle>
            {categoryFaqs.map((faq) => (
              <FaqCard key={faq._id}>
                <FaqQuestion
                  onClick={() => toggleFaq(faq._id)}
                  aria-expanded={openFaqId === faq._id}
                >
                  {faq.question}
                </FaqQuestion>
                <FaqAnswer isOpen={openFaqId === faq._id}>{faq.answer}</FaqAnswer>
              </FaqCard>
            ))}
          </CategorySection>
        ))
      )}
    </PageContainer>
  )
}

export default FaqsPage
