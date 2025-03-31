"use client"

import type React from "react"
import { useState } from "react"
import styled from "styled-components"
import { AppColors } from "../../styles/colors"
import Button from "../../components/ui/Button"
import Card from "../../components/ui/Card"
import Input from "../../components/ui/Input"

const PageContainer = styled.div`
  padding: 1.5rem;
  background-color: ${AppColors.background};
  border-radius: 8px;
`

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`

const PageTitle = styled.h2`
  font-size: 1.5rem;
  color: ${AppColors.primary};
`

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`

const CategoryFilter = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
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

// Crear un componente wrapper para manejar el onClick
const ClickableCard = styled(Card)`
  margin-bottom: 1rem;
  cursor: pointer;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`

const FaqHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`

const FaqQuestion = styled.h3`
  font-size: 1.125rem;
  color: ${AppColors.textSecondary};
  margin-bottom: 0.5rem;
`

const FaqCategory = styled.span`
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background-color: rgba(76, 175, 80, 0.1);
  color: ${AppColors.primary};
`

const FaqAnswer = styled.p`
  color: ${AppColors.text};
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const FaqActions = styled.div`
  display: flex;
  gap: 0.5rem;
`

const ActionButton = styled.button`
  background-color: rgba(255, 255, 255, 0.1);
  color: ${AppColors.text};
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: ${AppColors.primary};
    color: white;
  }
`

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.05);
  color: ${AppColors.text};
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${AppColors.primary};
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const ModalContent = styled(Card)`
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  color: ${AppColors.primary};
`

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${AppColors.text};
  font-size: 1.5rem;
  cursor: pointer;
`

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${AppColors.textSecondary};
`

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
`

const SelectFilter = styled.select`
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
`

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`

// Mock data
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

const categories = ["Todas", "Beneficios", "Consejos", "Abstinencia", "Tratamientos"]

const FaqsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todas")
  const [faqs, setFaqs] = useState(mockFaqs)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentFaq, setCurrentFaq] = useState<{
    id: number | null
    question: string
    answer: string
    category: string
  }>({
    id: null,
    question: "",
    answer: "",
    category: "Beneficios",
  })

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "Todas" || faq.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const handleOpenModal = (faq?: (typeof mockFaqs)[0]) => {
    if (faq) {
      setCurrentFaq({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
      })
    } else {
      setCurrentFaq({
        id: null,
        question: "",
        answer: "",
        category: "Beneficios",
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setCurrentFaq({ ...currentFaq, [name]: value })
  }

  const handleSave = () => {
    if (currentFaq.id) {
      // Update existing FAQ
      setFaqs(faqs.map((faq) => (faq.id === currentFaq.id ? { ...currentFaq, id: faq.id } : faq)))
    } else {
      // Add new FAQ
      const newId = Math.max(...faqs.map((faq) => faq.id)) + 1
      setFaqs([...faqs, { ...currentFaq, id: newId }])
    }

    handleCloseModal()
  }

  const handleDelete = (id: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta pregunta?")) {
      setFaqs(faqs.filter((faq) => faq.id !== id))
    }
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Gestión de Preguntas Frecuentes</PageTitle>
        <Button onClick={() => handleOpenModal()}>+ Nueva Pregunta</Button>
      </PageHeader>

      <SearchContainer>
        <Input
          placeholder="Buscar preguntas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />
      </SearchContainer>

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
        <div key={faq.id} onClick={() => handleOpenModal(faq)}>
          <ClickableCard>
            <FaqHeader>
              <FaqQuestion>{faq.question}</FaqQuestion>
              <FaqCategory>{faq.category}</FaqCategory>
            </FaqHeader>

            <FaqAnswer>{faq.answer}</FaqAnswer>

            <FaqActions onClick={(e) => e.stopPropagation()}>
              <ActionButton
                onClick={(e) => {
                  e.stopPropagation()
                  handleOpenModal(faq)
                }}
              >
                Editar
              </ActionButton>
              <ActionButton
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(faq.id)
                }}
              >
                Eliminar
              </ActionButton>
            </FaqActions>
          </ClickableCard>
        </div>
      ))}

      {isModalOpen && (
        <Modal onClick={handleCloseModal}>
          <div onClick={(e) => e.stopPropagation()}>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>{currentFaq.id ? "Editar Pregunta" : "Nueva Pregunta"}</ModalTitle>
                <CloseButton onClick={handleCloseModal}>×</CloseButton>
              </ModalHeader>

              <FormGroup>
                <Input
                  label="Pregunta"
                  name="question"
                  value={currentFaq.question}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Respuesta</FormLabel>
                <TextArea name="answer" value={currentFaq.answer} onChange={handleChange} required />
              </FormGroup>

              <FormGroup>
                <FormLabel>Categoría</FormLabel>
                <SelectFilter
                  name="category"
                  value={currentFaq.category}
                  onChange={handleChange}
                  aria-label="Categoría de la pregunta"
                >
                  {categories
                    .filter((c) => c !== "Todas")
                    .map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                </SelectFilter>
              </FormGroup>

              <ButtonContainer>
                <Button variant="outline" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>{currentFaq.id ? "Actualizar" : "Crear"}</Button>
              </ButtonContainer>
            </ModalContent>
          </div>
        </Modal>
      )}
    </PageContainer>
  )
}

export default FaqsList

