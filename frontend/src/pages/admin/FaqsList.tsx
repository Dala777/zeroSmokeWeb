import type React from "react"
import { useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import { AppColors } from "../../styles/colors"
import Button from "../../components/ui/Button"
import Card from "../../components/ui/Card"
import Input from "../../components/ui/Input"
import LoadingState from "../../components/admin/LoadingState"
import ErrorState from "../../components/admin/ErrorState"
import { faqAPI } from "../../services/api"

interface AdminFAQ {
  _id: string
  question: string
  answer: string
  category: string
  createdAt: string
  updatedAt?: string
}

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
  background-color: ${(p) => (p.active ? AppColors.primary : "rgba(255, 255, 255, 0.1)")};
  color: ${(p) => (p.active ? "white" : AppColors.text)};
  border: none;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${(p) => (p.active ? AppColors.primary : "rgba(255, 255, 255, 0.2)")};
  }
`

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

const FaqsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todas")
  const [faqs, setFaqs] = useState<AdminFAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentFaq, setCurrentFaq] = useState<{
    _id: string | null
    question: string
    answer: string
    category: string
  }>({
    _id: null,
    question: "",
    answer: "",
    category: "Beneficios",
  })

  const categories = ["Todas", "Beneficios", "Consejos", "Abstinencia", "Tratamientos", "Salud", "General"]

  const fetchFaqs = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const res = await faqAPI.getAll()
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

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "Todas" || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleOpenModal = (faq?: AdminFAQ) => {
    if (faq) {
      setCurrentFaq({
        _id: faq._id,
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
      })
    } else {
      setCurrentFaq({ _id: null, question: "", answer: "", category: "Beneficios" })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => setIsModalOpen(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setCurrentFaq((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      if (currentFaq._id) {
        const res = await faqAPI.update(currentFaq._id, {
          question: currentFaq.question,
          answer: currentFaq.answer,
          category: currentFaq.category,
        })
        setFaqs((prev) => prev.map((f) => (f._id === currentFaq._id ? res.data : f)))
      } else {
        const res = await faqAPI.create({
          question: currentFaq.question,
          answer: currentFaq.answer,
          category: currentFaq.category,
        })
        setFaqs((prev) => [...prev, res.data])
      }
      handleCloseModal()
    } catch {
      alert("Error al guardar la pregunta")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta pregunta?")) return
    try {
      await faqAPI.delete(id)
      setFaqs((prev) => prev.filter((f) => f._id !== id))
    } catch {
      alert("Error al eliminar la pregunta")
    }
  }

  if (loading) return <LoadingState message="Cargando preguntas frecuentes..." />

  if (error && faqs.length === 0) {
    return (
      <PageContainer>
        <ErrorState message={error} />
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <Button onClick={fetchFaqs}>Reintentar</Button>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Gestión de Preguntas Frecuentes ({faqs.length})</PageTitle>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="outline" onClick={fetchFaqs}>
            Actualizar
          </Button>
          <Button onClick={() => handleOpenModal()}>+ Nueva Pregunta</Button>
        </div>
      </PageHeader>

      {error && (
        <div style={{ marginBottom: 16 }}>
          <ErrorState message={error} />
        </div>
      )}

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

      {filteredFaqs.length === 0 && (
        <div style={{ textAlign: "center", padding: 32, opacity: 0.6, color: AppColors.textSecondary }}>
          {searchTerm || selectedCategory !== "Todas"
            ? "No se encontraron preguntas con los filtros actuales."
            : "No hay preguntas frecuentes registradas."}
        </div>
      )}

      {filteredFaqs.map((faq) => (
        <div key={faq._id} onClick={() => handleOpenModal(faq)}>
          <ClickableCard>
            <FaqHeader>
              <FaqQuestion>{faq.question}</FaqQuestion>
              <FaqCategory>{faq.category}</FaqCategory>
            </FaqHeader>

            <FaqAnswer>{faq.answer}</FaqAnswer>

            <FaqActions onClick={(e) => e.stopPropagation()}>
              <ActionButton onClick={() => handleOpenModal(faq)}>Editar</ActionButton>
              <ActionButton onClick={() => handleDelete(faq._id)}>Eliminar</ActionButton>
            </FaqActions>
          </ClickableCard>
        </div>
      ))}

      {isModalOpen && (
        <Modal onClick={handleCloseModal}>
          <div onClick={(e) => e.stopPropagation()}>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>{currentFaq._id ? "Editar Pregunta" : "Nueva Pregunta"}</ModalTitle>
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
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Guardando..." : currentFaq._id ? "Actualizar" : "Crear"}
                </Button>
              </ButtonContainer>
            </ModalContent>
          </div>
        </Modal>
      )}
    </PageContainer>
  )
}

export default FaqsList