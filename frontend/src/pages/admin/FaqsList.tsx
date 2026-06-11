import type React from "react"
import { useCallback, useEffect, useState } from "react"
import styled from "styled-components"
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
`

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`

const PageTitle = styled.h2`
  font-size: 1.5rem;
  color: #111827;
  font-weight: 700;
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
  padding: 6px 16px;
  border-radius: 20px;
  background-color: ${(p) => (p.active ? "#16a34a" : "#F3F4F6")};
  color: ${(p) => (p.active ? "white" : "#6B7280")};
  border: 1px solid ${(p) => (p.active ? "#16a34a" : "#D1D5DB")};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(p) => (p.active ? "#15803d" : "#E5E7EB")};
  }
`

const ClickableCard = styled(Card)`
  margin-bottom: 1rem;
  cursor: pointer;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
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
  color: #111827;
  font-weight: 600;
  margin-bottom: 0.5rem;
`

const FaqCategory = styled.span`
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 500;
  background-color: #DCFCE7;
  color: #15803D;
`

const FaqAnswer = styled.p`
  color: #6B7280;
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

const ActionButton = styled.button<{ $variant?: "warning" | "danger" }>`
  background: none;
  border: none;
  padding: 4px 8px;
  font-size: 13px;
  cursor: pointer;
  color: ${(p) => (p.$variant === "danger" ? "#DC2626" : "#D97706")};
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    opacity: 0.8;
  }
`

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 10px 14px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  background-color: #FFFFFF;
  color: #111827;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #16a34a;
    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.15);
  }

  &::placeholder {
    color: #9CA3AF;
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
  color: #111827;
  font-weight: 700;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #6B7280;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 4px;
  line-height: 1;

  &:hover {
    color: #111827;
  }
`

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6B7280;
`

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
`

const SelectFilter = styled.select`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  background-color: #FFFFFF;
  color: #111827;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #16a34a;
    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.15);
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
        <div style={{ textAlign: "center", padding: 32, opacity: 0.6, color: "#6B7280" }}>
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
              <ActionButton $variant="danger" onClick={() => handleDelete(faq._id)}>Eliminar</ActionButton>
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