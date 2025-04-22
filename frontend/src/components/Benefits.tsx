"use client"

import type React from "react"
import styled, { keyframes } from "styled-components"
import { AppColors } from "../styles/colors"
import Card from "./ui/Card"
import benefit1 from "../styles/images/benefit1.jpg"
import benefit2 from "../styles/images/benefit2.jpeg"
import benefit3 from "../styles/images/benefit3.jpg"
import benefit4 from "../styles/images/benefit4.webp"

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
const BenefitsSection = styled.section`
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
    background: radial-gradient(circle at bottom left, ${AppColors.cardBackground}40, transparent 70%);
    z-index: 0;
  }
`

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 3.5rem;
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
    margin-bottom: 2.5rem;
  }
`

const BenefitsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2.5rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
`

interface BenefitCardProps {
  delay: number
}

const BenefitCard = styled(Card)<BenefitCardProps>`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: ${AppColors.cardBackground};
  color: ${AppColors.text};
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: ${zoom} 0.5s ease-out;
  animation-fill-mode: both;
  animation-delay: ${(props) => props.delay}s;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  }
`

const BenefitImage = styled.img`
  height: 200px;
  width: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  
  ${BenefitCard}:hover & {
    transform: scale(1.05);
  }
`

const BenefitContent = styled.div`
  padding: 1.5rem;
  text-align: center;
`

const BenefitTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: ${AppColors.textSecondary};
  font-weight: 600;
`

const BenefitDescription = styled.p`
  color: ${AppColors.text};
  line-height: 1.7;
  font-size: 1.05rem;
`

// Datos de los beneficios
const benefitsData = [
  {
    image: benefit1,
    title: "Mejora tu Salud Física",
    description:
      "Dejar de fumar reduce el riesgo de enfermedades como el cáncer, EPOC y problemas cardíacos. Tu cuerpo comienza a sanar desde el primer día.",
  },
  {
    image: benefit2,
    title: "Incrementa tu Energía",
    description: "Mejorarás tu capacidad pulmonar y te sentirás con más energía para realizar actividades físicas.",
  },
  {
    image: benefit3,
    title: "Fortalece tus Finanzas",
    description: "Ahorrarás dinero al evitar comprar cigarrillos y reducirás los gastos médicos a largo plazo.",
  },
  {
    image: benefit4,
    title: "Mejora tu Apariencia",
    description:
      "Notarás una piel más saludable, dientes más blancos y un cabello más fuerte al eliminar las toxinas del tabaco.",
  },
]

const Benefits: React.FC = () => {
  return (
    <BenefitsSection id="benefits">
      <SectionTitle>Beneficios de Dejar de Fumar</SectionTitle>
      <BenefitsGrid>
        {benefitsData.map((benefit, index) => (
          <BenefitCard key={index} delay={index * 0.2}>
            <BenefitImage src={benefit.image} alt={benefit.title} />
            <BenefitContent>
              <BenefitTitle>{benefit.title}</BenefitTitle>
              <BenefitDescription>{benefit.description}</BenefitDescription>
            </BenefitContent>
          </BenefitCard>
        ))}
      </BenefitsGrid>
    </BenefitsSection>
  )
}

export default Benefits
