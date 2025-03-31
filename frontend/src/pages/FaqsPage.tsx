"use client"

import type React from "react"
import { useEffect, useState } from "react"
import styled from "styled-components"
import { AppColors } from "../styles/colors"
import Card from "../components/ui/Card"
import { getFaqs, type FAQ } from "../services/storageService"

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

const CategoryFilter = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
  justify-content: center;
`

const CategoryPill = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background-color: ${(props) => (props.active ? AppColors.primary : "rgba(255, 255, 255, 0.1)")};
  color: ${(props) => (props.active ? "white" : AppColors.text)};
  border: none;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${(props) => (props.active ? AppColors.primary : "rgba(255, 255, 255, 0.2)")};
  }
`

const FaqCard = styled(Card)`
  margin-bottom: 1.5rem;
`

const FaqQuestion = styled.h3`
  font-size: 1.25rem;
  color: ${AppColors.textSecondary};
  margin-bottom: 1rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:after {
    content: "+";
    font-size: 1.5rem;
    transition: transform 0.3s ease;
  }

  &[aria-expanded="true"]:after {
    content: "-";
  }
`

const FaqAnswer = styled.div<{ isOpen: boolean }>`
  color: ${AppColors.text};
  max-height: ${(props) => (props.isOpen ? "1000px" : "0")};
  overflow: hidden;
  transition: max-height 0.5s ease;
  margin-top: ${(props) => (props.isOpen ? "1rem" : "0")};
`

const FaqCategory = styled.span`
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background-color: rgba(76, 175, 80, 0.1);
  color: ${AppColors.primary};
  margin-left: 1rem;
`

const FaqsPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [selectedCategory, setSelectedCategory] = useState("Todas")
  const [openFaqId, setOpenFaqId] = useState<number | null>(null)

  useEffect(() => {
    // Función para cargar FAQs
    const loadFaqs = () => {
      const faqsData = getFaqs()
      setFaqs(faqsData)
    }

    // Cargar FAQs inicialmente
    loadFaqs()

    // Configurar un intervalo para verificar actualizaciones
    const intervalId = setInterval(loadFaqs, 2000)

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId)
  }, [])

  // Obtener categorías únicas
  const categories = ["Todas", ...Array.from(new Set(faqs.map((faq) => faq.category)))]

  // Filtrar FAQs por categoría
  const filteredFaqs = selectedCategory === "Todas" ? faqs : faqs.filter((faq) => faq.category === selectedCategory)

  const toggleFaq = (id: number) => {
    setOpenFaqId(openFaqId === id ? null : id)
  }

  return (
    <PageContainer>
      <PageTitle>Preguntas Frecuentes</PageTitle>

      <CategoryFilter>
        {categories.map((category) => (
          <CategoryPill
            key={category}
            active={selectedCategory === category}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </CategoryPill>
        ))}
      </CategoryFilter>

      {filteredFaqs.map((faq) => (
        <FaqCard key={faq.id}>
          <FaqQuestion onClick={() => toggleFaq(faq.id)} aria-expanded={openFaqId === faq.id}>
            {faq.question}
            <FaqCategory>{faq.category}</FaqCategory>
          </FaqQuestion>
          <FaqAnswer isOpen={openFaqId === faq.id}>{faq.answer}</FaqAnswer>
        </FaqCard>
      ))}
    </PageContainer>
  )
}

export default FaqsPage

