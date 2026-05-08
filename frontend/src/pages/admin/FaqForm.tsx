"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import styled from "styled-components"
import { AppColors } from "../../styles/colors"
import { faqAPI } from "../../services/api"
import type { FAQ } from "../../types"

// Componentes estilizados
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Label = styled.label`
  font-size: 0.875rem;
  color: ${AppColors.textSecondary};
`

const Input = styled.input`
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

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.05);
  color: ${AppColors.text};
  font-size: 1rem;
  min-height: 150px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${AppColors.primary};
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`

const Button = styled.button<{ variant?: "primary" | "secondary" | "danger" }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  background-color: ${(props) =>
    props.variant === "primary"
      ? AppColors.primary
      : props.variant === "danger"
        ? AppColors.error
        : "rgba(255, 255, 255, 0.1)"};
  color: ${(props) => (props.variant === "primary" || props.variant === "danger" ? "white" : AppColors.text)};

  &:hover {
    background-color: ${(props) =>
      props.variant === "primary"
        ? AppColors.primaryDark
        : props.variant === "danger"
          ? AppColors.errorDark
          : "rgba(255, 255, 255, 0.2)"};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const ErrorMessage = styled.div`
  color: ${AppColors.error};
  background-color: rgba(244, 67, 54, 0.1);
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`

const SuccessMessage = styled.div`
  color: ${AppColors.success};
  background-color: rgba(76, 175, 80, 0.1);
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`

const FaqForm: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditMode = !!id

  const [formData, setFormData] = useState<Partial<FAQ>>({
    question: "",
    answer: "",
    category: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (isEditMode) {
      const fetchFaq = async () => {
        try {
          const response = await faqAPI.getById(id)
          setFormData(response.data)
        } catch (err) {
          console.error("Error fetching FAQ:", err)
          setError("Error al cargar la FAQ. Por favor, intenta de nuevo.")
        }
      }

      fetchFaq()
    }
  }, [id, isEditMode])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      if (isEditMode) {
        await faqAPI.update(id, formData)
        setSuccess("FAQ actualizada con éxito")
      } else {
        await faqAPI.create(formData)
        setSuccess("FAQ creada con éxito")
        setFormData({
          question: "",
          answer: "",
          category: "",
        })
      }
    } catch (err: any) {
      console.error("Error saving FAQ:", err)
      setError(err.response?.data?.message || "Error al guardar la FAQ. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>{isEditMode ? "Editar FAQ" : "Nueva FAQ"}</PageTitle>
      </PageHeader>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="question">Pregunta</Label>
          <Input
            type="text"
            id="question"
            name="question"
            value={formData.question || ""}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="answer">Respuesta</Label>
          <TextArea id="answer" name="answer" value={formData.answer || ""} onChange={handleChange} required />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="category">Categoría</Label>
          <Input
            type="text"
            id="category"
            name="category"
            value={formData.category || ""}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <ButtonGroup>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : isEditMode ? "Actualizar FAQ" : "Crear FAQ"}
          </Button>
          <Button type="button" onClick={() => navigate("/admin/faqs")}>
            Cancelar
          </Button>
        </ButtonGroup>
      </Form>
    </PageContainer>
  )
}

export default FaqForm

