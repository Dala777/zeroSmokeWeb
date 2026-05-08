"use client"

import type React from "react"
import styled, { keyframes } from "styled-components"
import { AppColors } from "../styles/colors"

// Animaciones
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const zoom = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`

// Componentes estilizados
const GallerySection = styled.section`
  padding: 6rem 0;
  background-color: ${AppColors.background};
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, ${AppColors.primary}05, ${AppColors.background});
    z-index: 0;
  }
`

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 1.5rem;
  color: ${AppColors.primary};
  position: relative;
  z-index: 1;
  animation: ${fadeIn} 1s ease-out;

  &::after {
    content: '';
    display: block;
    width: 80px;
    height: 4px;
    background-color: ${AppColors.accent};
    margin: 0.8rem auto 0;
    border-radius: 2px;
  }

  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
`

const SectionDescription = styled.p`
  text-align: center;
  max-width: 800px;
  margin: 0 auto 3rem;
  font-size: 1.1rem;
  color: ${AppColors.text};
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 2rem;
    padding: 0 1rem;
  }
`

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`

interface GalleryItemProps {
  delay: number
}

const GalleryItem = styled.div<GalleryItemProps>`
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  animation: ${zoom} 0.5s ease-out;
  animation-fill-mode: both;
  animation-delay: ${(props) => props.delay}s;
  height: 300px;
  
  &:hover img {
    transform: scale(1.05);
  }
  
  &:hover div {
    opacity: 1;
  }
  
  @media (max-width: 768px) {
    height: 250px;
  }
`

const GalleryImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
`

const GalleryOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
`

const GalleryTitle = styled.h3`
  font-size: 1.3rem;
  color: white;
  margin-bottom: 0.8rem;
  text-align: center;
  font-weight: 600;
`

const GalleryDescription = styled.p`
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  font-size: 0.95rem;
  line-height: 1.5;
`

// Datos de la galería con imágenes de la carpeta especificada
const galleryData = [
  {
    image: require("../styles/images/gallery1.jpg"),
    title: "Cáncer de Pulmón",
    description: "El tabaquismo es la principal causa del cáncer de pulmón en todo el mundo.",
  },
  {
    image: require("../styles/images/gallery2.avif"),
    title: "Enfermedad Pulmonar Obstructiva Crónica (EPOC)",
    description: "Fumar daña los pulmones, provocando dificultades respiratorias permanentes.",
  },
  {
    image: require("../styles/images/gallery3.jpg"),
    title: "Enfermedades Cardiovasculares",
    description: "Aumenta el riesgo de ataques cardíacos y accidentes cerebrovasculares.",
  },
  {
    image: require("../styles/images/gallery4.jpg"),
    title: "Envejecimiento Prematuro",
    description: "El tabaquismo acelera el envejecimiento de la piel y causa arrugas.",
  },
  {
    image: require("../styles/images/gallery5.jpg"),
    title: "Cáncer de Boca",
    description: "El tabaco puede causar lesiones y cáncer en la boca y garganta.",
  },
  {
    image: require("../styles/images/gallery6.jpg"),
    title: "Infertilidad",
    description: "Reduce la fertilidad tanto en hombres como en mujeres.",
  },
  {
    image: require("../styles/images/gallery7.webp"),
    title: "Daño en los Dientes",
    description: "Fumar mancha los dientes, provoca caries y pérdida dental.",
  },
  {
    image: require("../styles/images/gallery8.webp"),
    title: "Problemas de Embarazo",
    description: "Aumenta el riesgo de complicaciones durante el embarazo y parto.",
  },
]

const Gallery: React.FC = () => {
  return (
    <GallerySection id="consequences">
      <SectionTitle>Consecuencias del Tabaquismo</SectionTitle>
      <SectionDescription>
        El consumo de tabaco afecta prácticamente todos los órganos del cuerpo y es responsable de numerosas
        enfermedades. Conoce las principales consecuencias para tu salud.
      </SectionDescription>
      <GalleryGrid>
        {galleryData.map((item, index) => (
          <GalleryItem key={index} delay={index * 0.1}>
            <GalleryImage src={item.image} alt={item.title} />
            <GalleryOverlay>
              <GalleryTitle>{item.title}</GalleryTitle>
              <GalleryDescription>{item.description}</GalleryDescription>
            </GalleryOverlay>
          </GalleryItem>
        ))}
      </GalleryGrid>
    </GallerySection>
  )
}

export default Gallery
