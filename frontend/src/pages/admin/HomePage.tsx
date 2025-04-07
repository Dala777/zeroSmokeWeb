"use client"

import type React from "react"
import { useState, useEffect } from "react"
import styled from "styled-components"
import { AppColors } from "../../styles/colors"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"
import Card from "../../components/ui/Card"
import { getHomePageData, updateHomePageData } from "../../services/storageService"

const PageContainer = styled.div`
  padding: 1.5rem;
  background-color: ${AppColors.background};
  border-radius: 8px;
`

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: ${AppColors.primary};
  margin-bottom: 1.5rem;
`

const FormSection = styled.div`
  margin-bottom: 2rem;
`

const FormLabel = styled.h3`
  font-size: 1.125rem;
  color: ${AppColors.textSecondary};
  margin-bottom: 1rem;
`

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`

const FeatureCard = styled(Card)`
  padding: 1.5rem;
  position: relative;
`

const FeatureCardOptions = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.5rem;
`

const OptionButton = styled.button`
  background-color: rgba(255, 255, 255, 0.1);
  color: ${AppColors.text};
  border: none;
  border-radius: 4px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
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

// Enhanced image preview with better UI
const ImagePreview = styled.div`
  width: 100%;
  height: 250px;
  background-color: ${AppColors.cardBackground};
  border: 1px dashed rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  overflow: hidden;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.2) 0%,
      rgba(0, 0, 0, 0.4) 100%
    );
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::after {
    opacity: 1;
  }
`

// Add image upload helper text
const ImageHelperText = styled.p`
  font-size: 0.85rem;
  color: ${AppColors.textSecondary};
  margin-top: 0.5rem;
  margin-bottom: 1rem;
`

// Reemplazar los estilos inline con componentes styled
const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`

const HomePageEdit: React.FC = () => {
  const [heroTitle, setHeroTitle] = useState("")
  const [heroSubtitle, setHeroSubtitle] = useState("")
  const [heroImage, setHeroImage] = useState("")
  const [features, setFeatures] = useState<any[]>([])
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    // Cargar datos actuales
    const homeData = getHomePageData()
    setHeroTitle(homeData.heroTitle)
    setHeroSubtitle(homeData.heroSubtitle)
    setHeroImage(homeData.heroImage)
    setFeatures(homeData.features)
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()

      reader.onload = (event) => {
        if (event.target?.result) {
          setHeroImage(event.target.result as string)
        }
      }

      reader.readAsDataURL(e.target.files[0])
    }
  }

  const handleSave = () => {
    // Guardar cambios
    updateHomePageData({
      heroTitle,
      heroSubtitle,
      heroImage,
      features,
    })

    // Mostrar mensaje de éxito
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleAddFeature = () => {
    const newFeature = {
      id: Date.now(),
      title: "Nueva Característica",
      description: "Descripción de la característica",
      icon: "🔍",
    }

    setFeatures([...features, newFeature])
  }

  const handleUpdateFeature = (id: number, field: "title" | "description" | "icon", value: string) => {
    setFeatures(features.map((feature) => (feature.id === id ? { ...feature, [field]: value } : feature)))
  }

  const handleDeleteFeature = (id: number) => {
    setFeatures(features.filter((feature) => feature.id !== id))
  }

  return (
    <PageContainer>
      <SectionTitle>Editar Página de Inicio</SectionTitle>

      {saveSuccess && (
        <SuccessMessage>
          ¡Cambios guardados con éxito! Los cambios ya son visibles en la página de inicio.
        </SuccessMessage>
      )}

      <FormSection>
        <FormLabel>Sección Hero</FormLabel>
        <Card>
          <ImagePreview>
            <img src={heroImage || "/placeholder.svg"} alt="Hero Preview" />
          </ImagePreview>

          <Input label="Imagen de Fondo" type="file" accept="image/*" onChange={handleImageChange} />
          <ImageHelperText>
            Para mejores resultados, utiliza una imagen de alta resolución (mínimo 1920x1080px) en formato horizontal.
          </ImageHelperText>

          <Input label="Título" fullWidth value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />

          <TextArea placeholder="Subtítulo" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} />
        </Card>
      </FormSection>

      <FormSection>
        <HeaderContainer>
          <FormLabel>Características Principales</FormLabel>
          <Button size="small" onClick={handleAddFeature}>
            + Añadir Característica
          </Button>
        </HeaderContainer>

        <GridContainer>
          {features.map((feature) => (
            <FeatureCard key={feature.id}>
              <FeatureCardOptions>
                <OptionButton onClick={() => handleDeleteFeature(feature.id)}>✕</OptionButton>
              </FeatureCardOptions>

              <Input
                label="Icono"
                value={feature.icon}
                onChange={(e) => handleUpdateFeature(feature.id, "icon", e.target.value)}
              />

              <Input
                label="Título"
                value={feature.title}
                onChange={(e) => handleUpdateFeature(feature.id, "title", e.target.value)}
              />

              <TextArea
                placeholder="Descripción"
                value={feature.description}
                onChange={(e) => handleUpdateFeature(feature.id, "description", e.target.value)}
              />
            </FeatureCard>
          ))}
        </GridContainer>
      </FormSection>

      <ButtonContainer>
        <Button variant="outline" size="medium">
          Cancelar
        </Button>
        <Button variant="primary" size="medium" onClick={handleSave}>
          Guardar Cambios
        </Button>
      </ButtonContainer>
    </PageContainer>
  )
}

// Añadir este nuevo estilo
const SuccessMessage = styled.div`
  background-color: rgba(76, 175, 80, 0.1);
  color: ${AppColors.success};
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
`

export default HomePageEdit

