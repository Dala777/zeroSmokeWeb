"use client"

import type React from "react"
import styled, { keyframes } from "styled-components"
import { AppColors } from "../styles/colors"

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`

const GallerySection = styled.section`
  padding: 4rem 0;
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
  font-size: 2rem;
  text-align: center;
  margin-bottom: 1rem;
  color: ${AppColors.text};
  position: relative;
  z-index: 1;

  &::after {
    content: '';
    display: block;
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, ${AppColors.primary}, ${AppColors.accent});
    margin: 0.75rem auto 0;
    border-radius: 2px;
  }

  @media (max-width: 768px) {
    font-size: 1.625rem;
  }
`

const SectionDescription = styled.p`
  text-align: center;
  max-width: 700px;
  margin: 0 auto 2.5rem;
  font-size: 1.05rem;
  color: ${AppColors.textSecondary};
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    font-size: 0.95rem;
    padding: 0 1rem;
  }
`

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
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
  $delay: number
}

const GalleryItem = styled.div<GalleryItemProps>`
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  animation: ${fadeIn} 0.5s ease-out;
  animation-fill-mode: both;
  animation-delay: ${(props) => props.$delay}s;
  height: 280px;

  &:hover img {
    transform: scale(1.08);
  }

  &:hover div {
    opacity: 1;
  }

  @media (max-width: 768px) {
    height: 240px;
  }
`

const GalleryImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
`

const GalleryOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.2) 60%, transparent 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1.5rem;
  opacity: 0;
  transition: opacity 0.35s ease;

  @media (max-width: 768px) {
    opacity: 1;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 100%);
  }
`

const GalleryTitle = styled.h3`
  font-size: 1.1rem;
  color: white;
  margin-bottom: 0.3rem;
  font-weight: 600;
`

const GalleryDescription = styled.p`
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.85rem;
  line-height: 1.4;
  margin: 0;
`

const galleryData = [
  { image: require("../styles/images/gallery1.jpg"), title: "Cáncer de Pulmón", description: "El tabaquismo es la principal causa del cáncer de pulmón en el mundo." },
  { image: require("../styles/images/gallery2.avif"), title: "EPOC", description: "Fumar daña los pulmones, provocando dificultades respiratorias permanentes." },
  { image: require("../styles/images/gallery3.jpg"), title: "Enfermedades Cardiovasculares", description: "Aumenta el riesgo de ataques cardíacos y accidentes cerebrovasculares." },
  { image: require("../styles/images/gallery4.jpg"), title: "Envejecimiento Prematuro", description: "El tabaquismo acelera el envejecimiento de la piel." },
  { image: require("../styles/images/gallery5.jpg"), title: "Cáncer de Boca", description: "El tabaco puede causar lesiones y cáncer en la boca y garganta." },
  { image: require("../styles/images/gallery6.jpg"), title: "Infertilidad", description: "Reduce la fertilidad tanto en hombres como en mujeres." },
  { image: require("../styles/images/gallery7.webp"), title: "Daño Dental", description: "Fumar mancha los dientes, provoca caries y pérdida dental." },
  { image: require("../styles/images/gallery8.webp"), title: "Problemas de Embarazo", description: "Aumenta el riesgo de complicaciones durante el embarazo." },
]

const Gallery: React.FC = () => {
  return (
    <GallerySection id="consequences">
      <SectionTitle>Consecuencias del Tabaquismo</SectionTitle>
      <SectionDescription>
        El consumo de tabaco afecta prácticamente todos los órganos del cuerpo. Conoce las principales consecuencias.
      </SectionDescription>
      <GalleryGrid>
        {galleryData.map((item, index) => (
          <GalleryItem key={index} $delay={index * 0.08}>
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