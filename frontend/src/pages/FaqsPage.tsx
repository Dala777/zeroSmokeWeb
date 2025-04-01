"use client"

import type React from "react"
import { useState } from "react"
import styled from "styled-components"
import { AppColors } from "../styles/colors"
import Card from "../components/ui/Card"

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

// Mock data para pruebas
const mockFaqs = [
  {
    id: 1,
    question: "¿Cuáles son los beneficios inmediatos de dejar de fumar?",
    answer:
      "Los beneficios inmediatos incluyen una mejora en la circulación sanguínea, normalización de la presión arterial y la frecuencia cardíaca, y un aumento en los niveles de oxígeno en la sangre. Además, el sentido del gusto y el olfato comienzan a mejorar en pocos días.",
    category: "Beneficios",
  },
  {
    id: 2,
    question: "¿Cómo puedo manejar los antojos de nicotina?",
    answer:
      "Para manejar los antojos, puedes intentar técnicas como respiración profunda, beber agua, mantener las manos ocupadas con actividades, masticar chicle sin azúcar, y evitar situaciones que asocias con fumar. También puedes considerar terapias de reemplazo de nicotina como parches o chicles.",
    category: "Consejos",
  },
  {
    id: 3,
    question: "¿Cuánto tiempo duran los síntomas de abstinencia?",
    answer:
      "Los síntomas físicos de abstinencia suelen alcanzar su punto máximo en los primeros 3-5 días y disminuyen gradualmente durante 2-4 semanas. Sin embargo, los antojos psicológicos pueden persistir durante meses, aunque con menor frecuencia e intensidad con el tiempo.",
    category: "Abstinencia",
  },
  {
    id: 4,
    question: "¿Es efectiva la terapia de reemplazo de nicotina?",
    answer:
      "Sí, la terapia de reemplazo de nicotina (TRN) ha demostrado ser efectiva para ayudar a las personas a dejar de fumar. Proporciona nicotina en forma controlada sin las toxinas dañinas del humo del tabaco, ayudando a reducir los síntomas de abstinencia mientras se rompe el hábito.",
    category: "Tratamientos",
  },
]

const FaqsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("Todas")
  const [openFaqId, setOpenFaqId] = useState<number | null>(null)

  // Obtener categorías únicas
  const categories = ["Todas", ...Array.from(new Set(mockFaqs.map((faq) => faq.category)))]

  // Filtrar FAQs por categoría
  const filteredFaqs =
    selectedCategory === "Todas" ? mockFaqs : mockFaqs.filter((faq) => faq.category === selectedCategory)

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

