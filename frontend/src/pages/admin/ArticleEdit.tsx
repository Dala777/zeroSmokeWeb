import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import styled from "styled-components"
import { AppColors } from "../../styles/colors"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"
import Card from "../../components/ui/Card"
import LoadingState from "../../components/admin/LoadingState"
import ErrorState from "../../components/admin/ErrorState"
import { articleAPI } from "../../services/api"
import { Eye, EyeOff } from "lucide-react"

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

const PreviewCard = styled(Card)`
  margin-bottom: 1.5rem;
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

interface ArticleForm {
  title: string
  content: string
  excerpt: string
  category: string
  author: string
  status: "published" | "draft"
  image: string
  tags: string[]
}

const ArticleEdit: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = id !== "new"

  const [article, setArticle] = useState<ArticleForm>({
    title: "",
    content: "",
    excerpt: "",
    category: "General",
    author: "",
    status: "draft",
    image: "/placeholder.svg?height=400&width=600",
    tags: [],
  })
  const [newTag, setNewTag] = useState("")
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [showPreview, setShowPreview] = useState(false)

  const fetchArticle = useCallback(async () => {
    if (!id || id === "new") return
    try {
      setLoading(true)
      setError("")
      const res = await articleAPI.getById(id)
      const a = res.data
      setArticle({
        title: a.title || "",
        content: a.content || "",
        excerpt: a.excerpt || "",
        category: a.category || "General",
        author: a.author || "",
        status: a.status || "draft",
        image: a.image || "/placeholder.svg?height=400&width=600",
        tags: a.tags || [],
      })
    } catch {
      setError("Error al cargar el artículo")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (isEditing) fetchArticle()
  }, [isEditing, fetchArticle])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setArticle((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onload = (evt) => {
        const target = evt.target
        if (target?.result) {
          setArticle((prev) => ({ ...prev, image: target.result as string }))
        }
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const handleAddTag = () => {
    const tag = newTag.trim()
    if (tag && !article.tags.includes(tag)) {
      setArticle((prev) => ({ ...prev, tags: [...prev.tags, tag] }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setArticle((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tagToRemove) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      const payload = {
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        category: article.category,
        author: article.author,
        status: article.status,
        image: article.image,
        tags: article.tags,
      }

      if (isEditing && id) {
        await articleAPI.update(id, payload)
      } else {
        await articleAPI.create(payload)
      }
      navigate("/admin/articles")
    } catch {
      alert(`Error al ${isEditing ? "actualizar" : "crear"} el artículo`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState message="Cargando artículo..." />

  if (error) {
    return (
      <PageContainer>
        <ErrorState message={error} />
        <div style={{ marginTop: 16 }}>
          <Button onClick={() => navigate("/admin/articles")}>Volver a artículos</Button>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>{isEditing ? "Editar Artículo" : "Crear Nuevo Artículo"}</PageTitle>
        <Button variant="outline" size="small" onClick={() => setShowPreview(!showPreview)}>
          {showPreview ? <EyeOff size={16} style={{ marginRight: 6 }} /> : <Eye size={16} style={{ marginRight: 6 }} />}
          {showPreview ? "Ocultar Vista Previa" : "Vista Previa"}
        </Button>
      </PageHeader>

      {showPreview && (
        <PreviewCard>
          <h3 style={{ color: AppColors.primary, marginBottom: "0.5rem" }}>{article.title || "Sin título"}</h3>
          <p style={{ color: AppColors.textSecondary, fontSize: "0.875rem", marginBottom: "1rem" }}>
            {article.category} &middot; {article.author || "Sin autor"}
          </p>
          {article.image && (
            <div style={{ width: "100%", height: 200, overflow: "hidden", borderRadius: 8, marginBottom: "1rem" }}>
              <img src={article.image} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
          <p style={{ color: AppColors.textSecondary, marginBottom: "1rem" }}>{article.excerpt}</p>
          <div style={{ color: AppColors.text, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{article.content}</div>
        </PreviewCard>
      )}

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
              <FlexItem>
                <Input label="Autor" name="author" value={article.author} onChange={handleChange} fullWidth />
              </FlexItem>
              <FlexItem>
                <FormLabel>Categoría</FormLabel>
                <SelectFilter name="category" value={article.category} onChange={handleChange}>
                  <option value="Educacion">Educación</option>
                  <option value="Salud">Salud</option>
                  <option value="Consejos">Consejos</option>
                  <option value="Investigacion">Investigación</option>
                  <option value="Motivacion">Motivación</option>
                  <option value="General">General</option>
                </SelectFilter>
              </FlexItem>
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
          <Button type="submit" disabled={saving}>
            {saving ? "Guardando..." : isEditing ? "Actualizar Artículo" : "Crear Artículo"}
          </Button>
        </ButtonContainer>
      </form>
    </PageContainer>
  )
}

export default ArticleEdit