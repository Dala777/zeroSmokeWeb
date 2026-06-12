"use client"

import type React from "react"
import { useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import { AppColors } from "../styles/colors"
import { ChevronDown, HelpCircle } from "lucide-react"
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
  max-width: 800px;
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
  margin-bottom: 2.5rem;
  font-size: 1.05rem;
`

const CategorySection = styled.div`
  margin-bottom: 2.5rem;
`

const CategoryTitle = styled.h2`
  font-size: 1.125rem;
  color: ${AppColors.accent};
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid ${AppColors.tertiary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const FaqItem = styled.div`
  background-color: ${AppColors.cardBackground};
  border: 1px solid ${AppColors.border};
  border-radius: 12px;
  margin-bottom: 0.75rem;
  overflow: hidden;
  transition: all 0.25s ease;

  &:hover {
    border-color: ${AppColors.primary}30;
  }
`

const FaqQuestion = styled.button<{ $isOpen: boolean }>`
  width: 100%;
  background: none;
  border: none;
  font-size: 1rem;
  color: ${(props) => (props.$isOpen ? AppColors.accent : AppColors.text)};
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.125rem 1.25rem;
  text-align: left;
  font-family: inherit;
  transition: color 0.2s ease;

  &:hover {
    color: ${AppColors.accent};
  }
`

const ChevronIcon = styled(ChevronDown)<{ $isOpen: boolean }>`
  flex-shrink: 0;
  transition: transform 0.3s ease;
  transform: ${(props) => (props.$isOpen ? "rotate(180deg)" : "rotate(0)")};
  color: ${AppColors.primary};
`

const FaqAnswer = styled.div<{ $isOpen: boolean }>`
  color: ${AppColors.textSecondary};
  max-height: ${(props) => (props.$isOpen ? "1000px" : "0")};
  overflow: hidden;
  transition: all 0.35s ease;
  line-height: 1.7;
  font-size: 0.95rem;

  > div {
    padding: 0 1.25rem 1.125rem;
  }
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
      <PageSubtitle>Encuentra respuestas a las preguntas más comunes sobre ZeroSmoke y el proceso para dejar de fumar.</PageSubtitle>

      {faqs.length === 0 ? (
        <div style={{ textAlign: "center", color: AppColors.textSecondary, padding: "2rem" }}>
          No hay preguntas frecuentes disponibles en este momento.
        </div>
      ) : (
        Object.entries(groupedByCategory).map(([category, categoryFaqs]) => (
          <CategorySection key={category}>
            <CategoryTitle>
              <HelpCircle size={18} />
              {category}
            </CategoryTitle>
            {categoryFaqs.map((faq) => (
              <FaqItem key={faq._id}>
                <FaqQuestion
                  onClick={() => toggleFaq(faq._id)}
                  $isOpen={openFaqId === faq._id}
                >
                  {faq.question}
                  <ChevronIcon size={20} $isOpen={openFaqId === faq._id} />
                </FaqQuestion>
                <FaqAnswer $isOpen={openFaqId === faq._id}>
                  <div>{faq.answer}</div>
                </FaqAnswer>
              </FaqItem>
            ))}
          </CategorySection>
        ))
      )}
    </PageContainer>
  )
}

export default FaqsPage