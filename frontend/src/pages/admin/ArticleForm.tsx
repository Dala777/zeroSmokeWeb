"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import styled from "styled-components"
import { AppColors } from "../../styles/colors"
import { articleAPI } from "../../services/api"
import type { Article } from "../../types"

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
  min-height: 200px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${AppColors.primary};
  }
`

const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.05);
  color: ${AppColors.text};
  font-size: 1rem;
  appearance: none;

  &:focus {
    outline: none;
    border-color: ${AppColors.primary};
  }
`

const TagsInput = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.05);
  min-height: 3rem;
`

const Tag = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background-color: rgba(76, 175, 80, 0.2);
  color: ${AppColors.primary};
  border-radius: 4px;
  font-size: 0.75rem;
`

const TagRemoveButton = styled.button`
  background: none;
  border: none;
  color: ${AppColors.primary};
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`

const TagInput = styled.input`
  flex: 1;
  min-width: 100px;
  background: none;
  border: none;
  color: ${AppColors.text};
  font-size: 0.875rem;
  padding: 0.25rem;

  &:focus {
    outline: none;
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

const ArticleForm: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditMode = !!id

  const [formData, setFormData] = useState<Partial<Article>>({
    title: "",
    excerpt: "",
    content: "",
    image: "",
    status: "draft",
    tags: [],
  })

  const [tagInput, setTagInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (isEditMode) {
      const fetchArticle = async () => {
        try {
          const response = await articleAPI.getById(id!)
          setFormData(response.data)
        } catch (err) {
          console.error("Error fetching article:", err)
          setError("Error al cargar el artículo. Por favor, intenta de nuevo.")
        }
      }

      fetchArticle()
    }
  }, [id, isEditMode])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value)
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag()
    }
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !formData.tags?.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tag],
      }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      if (isEditMode) {
        await articleAPI.update(id!, formData)
        setSuccess("Artículo actualizado con éxito")
      } else {
        await articleAPI.create(formData)
        setSuccess("Artículo creado con éxito")
        setFormData({
          title: "",
          excerpt: "",
          content: "",
          image: "",
          status: "draft",
          tags: [],
        })
      }
    } catch (err: any) {
      console.error("Error saving article:", err)
      setError(err.response?.data?.message || "Error al guardar el artículo. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>{isEditMode ? "Editar Artículo" : "Nuevo Artículo"}</PageTitle>
      </PageHeader>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="title">Título</Label>
          <Input type="text" id="title" name="title" value={formData.title || ""} onChange={handleChange} required />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="excerpt">Extracto</Label>
          <TextArea id="excerpt" name="excerpt" value={formData.excerpt || ""} onChange={handleChange} rows={3} />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="content">Contenido</Label>
          <TextArea
            id="content"
            name="content"
            value={formData.content || ""}
            onChange={handleChange}
            required
            rows={10}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="image">URL de la Imagen</Label>
          <Input
            type="text"
            id="image"
            name="image"
            value={formData.image || ""}
            onChange={handleChange}
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </FormGroup>

        <div>
        <label id="status-label">Estado:</label>
        <select 
            aria-labelledby="status-label"
            id="status"
            name="status"
            value={formData.status || "draft"}
            onChange={handleChange}
            required
        >
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
        </select>
        </div>

        <FormGroup>
          <Label>Etiquetas</Label>
          <TagsInput>
            {formData.tags?.map((tag, index) => (
              <Tag key={index}>
                {tag}
                <TagRemoveButton type="button" onClick={() => removeTag(tag)}>
                  ×
                </TagRemoveButton>
              </Tag>
            ))}
            <TagInput
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagInputKeyDown}
              onBlur={addTag}
              placeholder="Añadir etiqueta..."
            />
          </TagsInput>
        </FormGroup>

        <ButtonGroup>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : isEditMode ? "Actualizar Artículo" : "Crear Artículo"}
          </Button>
          <Button type="button" onClick={() => navigate("/admin/articles")}>
            Cancelar
          </Button>
        </ButtonGroup>
      </Form>
    </PageContainer>
  )
}

export default ArticleForm

