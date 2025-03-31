"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import styled from "styled-components"
import { AppColors } from "../../styles/colors"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"
import Card from "../../components/ui/Card"

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

const FormSection = styled.div`
  margin-bottom: 2rem;
`

const FormLabel = styled.h3`
  font-size: 1.125rem;
  color: ${AppColors.textSecondary};
  margin-bottom: 1rem;
`

const TextArea = styled.textarea`
  width: 100%;
  min-height: 200px;
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

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`

const ImagePreview = styled.div`
  width: 100%;
  height: 200px;
  background-color: ${AppColors.cardBackground};
  border: 1px dashed rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  overflow: hidden;
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: cover;
  }
`

// Mock article data
const mockArticle = {
  id: 1,
  title: "Efectos del tabaco en el sistema respiratorio",
  content: `Los efectos nocivos del tabaco en el sistema respiratorio son extensos y bien documentados. Desde la irritación inmediata hasta enfermedades graves a largo plazo, el tabaquismo afecta negativamente a todo el sistema respiratorio.

El humo del tabaco contiene más de 7,000 sustancias químicas, muchas de las cuales son tóxicas y dañinas para los pulmones. Algunas de estas sustancias son conocidas por causar cáncer.

**Efectos a corto plazo:**
- Irritación de las vías respiratorias
- Aumento de la mucosidad
- Tos y respiración sibilante
- Dificultad para respirar durante el ejercicio

**Efectos a largo plazo:**
- Enfermedad Pulmonar Obstructiva Crónica (EPOC)
- Cáncer de pulmón
- Asma
- Mayor susceptibilidad a infecciones respiratorias`,
  excerpt:
    "Los efectos nocivos del tabaco en el sistema respiratorio son extensos y bien documentados. Desde la irritación inmediata hasta enfermedades graves...",
  author: "Dr. Juan Pérez",
  date: "2023-05-15",
  status: "published" as const,
  image: "/placeholder.svg?height=400&width=600",
  tags: ["salud", "respiratorio", "tabaco", "pulmones"],
}

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`

const InputWithButtonContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`

const FlexContainer = styled.div`
  display: flex;
  gap: 1rem;
`

const FlexItem = styled.div`
  flex: 1;
`

const HelpText = styled.p`
  font-size: 0.875rem;
  color: ${AppColors.textSecondary};
  margin-top: 0.5rem;
`

const ArticleEdit: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = id !== "new"

  const [article, setArticle] = useState<{
    title: string
    content: string
    excerpt: string
    author: string
    status: "published" | "draft"
    image: string
    tags: string[]
  }>({
    title: "",
    content: "",
    excerpt: "",
    author: "",
    status: "draft" as "published" | "draft",
    image: "/placeholder.svg?height=400&width=600",
    tags: [],
  })

  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    if (isEditing) {
      // Here you would fetch the article from your API
      // For now, using mock data
      setArticle(mockArticle)
    }
  }, [isEditing])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setArticle({ ...article, [name]: value })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()

      reader.onload = (event) => {
        if (event.target?.result) {
          setArticle({ ...article, image: event.target.result as string })
        }
      }

      reader.readAsDataURL(e.target.files[0])
    }
  }

  const handleAddTag = () => {
    if (newTag && !article.tags.includes(newTag)) {
      setArticle({ ...article, tags: [...article.tags, newTag] })
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setArticle({
      ...article,
      tags: article.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Here you would save the article to your API
    // For now, just navigate back to the list
    alert(`Artículo ${isEditing ? "actualizado" : "creado"} con éxito!`)
    navigate("/admin/articles")
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>{isEditing ? "Editar Artículo" : "Crear Nuevo Artículo"}</PageTitle>
      </PageHeader>

      <form onSubmit={handleSubmit}>
        <Card>
          <FormSection>
            <FormLabel>Información Básica</FormLabel>
            <Input label="Título" name="title" value={article.title} onChange={handleChange} fullWidth required />

            <TextArea
              name="excerpt"
              placeholder="Extracto (breve descripción para mostrar en listados)"
              value={article.excerpt}
              onChange={handleChange}
              style={{ minHeight: "80px" }}
            />

            <FlexContainer>
              <Input label="Autor" name="author" value={article.author} onChange={handleChange} fullWidth />

              <FlexItem>
                <FormLabel>Estado</FormLabel>
                <SelectFilter name="status" value={article.status} onChange={handleChange}>
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                </SelectFilter>
              </FlexItem>
            </FlexContainer>
          </FormSection>

          <FormSection>
            <FormLabel>Imagen Principal</FormLabel>
            <ImagePreview>
              <img src={article.image || "/placeholder.svg"} alt="Preview" />
            </ImagePreview>

            <Input type="file" accept="image/*" onChange={handleImageChange} />
          </FormSection>

          <FormSection>
            <FormLabel>Contenido del Artículo</FormLabel>
            <TextArea
              name="content"
              placeholder="Escribe el contenido del artículo aquí..."
              value={article.content}
              onChange={handleChange}
              required
            />
            <HelpText>Puedes usar formato markdown para dar estilo al contenido.</HelpText>
          </FormSection>

          <FormSection>
            <FormLabel>Etiquetas</FormLabel>
            <InputWithButtonContainer>
              <Input
                placeholder="Añadir etiqueta"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                fullWidth
              />
              <Button type="button" onClick={handleAddTag} size="small">
                Añadir
              </Button>
            </InputWithButtonContainer>

            <TagsContainer>
              {article.tags.map((tag) => (
                <TagPill key={tag}>
                  {tag}
                  <TagRemove onClick={() => handleRemoveTag(tag)}>×</TagRemove>
                </TagPill>
              ))}
            </TagsContainer>
          </FormSection>
        </Card>

        <ButtonContainer>
          <Button type="button" variant="outline" onClick={() => navigate("/admin/articles")}>
            Cancelar
          </Button>
          <Button type="submit">{isEditing ? "Actualizar Artículo" : "Crear Artículo"}</Button>
        </ButtonContainer>
      </form>
    </PageContainer>
  )
}

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

const TagPill = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  background-color: ${AppColors.primary};
  color: white;
  border-radius: 16px;
  font-size: 0.875rem;
`

const TagRemove = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.25rem;
  margin-left: 0.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    opacity: 0.8;
  }
`

export default ArticleEdit

