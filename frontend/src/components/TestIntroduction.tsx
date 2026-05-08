import type React from "react"
import styled, { keyframes } from "styled-components"
import { AppColors } from "../styles/colors"
import Button from "./ui/Button"
import { Link } from "react-router-dom"
import { ClipboardCheck, Clock, BarChartIcon as ChartBar, Shield } from "lucide-react"

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const TestIntroContainer = styled.section`
  padding: 5rem 0;
  background-color: ${AppColors.background};
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at bottom right, ${AppColors.cardBackground}40, transparent 70%);
    z-index: 0;
  }
`

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
`

const IntroHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  animation: ${fadeIn} 1s ease-out;
`

const IntroTitle = styled.h2`
  font-size: 2.5rem;
  color: ${AppColors.primary};
  margin-bottom: 1.5rem;

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
  }
`

const IntroDescription = styled.p`
  font-size: 1.1rem;
  max-width: 800px;
  margin: 0 auto;
  color: ${AppColors.text};
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`

// Modificamos el grid para asegurar que siempre haya 4 elementos en una fila
const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`

const FeatureItem = styled.div`
  background-color: ${AppColors.cardBackground};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: ${slideUp} 0.8s ease-out both;
  
  &:nth-child(1) {
    animation-delay: 0.1s;
  }
  
  &:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  &:nth-child(3) {
    animation-delay: 0.3s;
  }
  
  &:nth-child(4) {
    animation-delay: 0.4s;
  }
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
  }
`

const FeatureIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background-color: ${AppColors.primary}20;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${AppColors.primary};
  margin-bottom: 1rem;
`

const FeatureTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.8rem;
  color: ${AppColors.textSecondary};
`

const FeatureDescription = styled.p`
  color: ${AppColors.text};
  font-size: 0.95rem;
  margin: 0;
`

const TestInfo = styled.div`
  background-color: ${AppColors.cardBackground};
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 3rem;
  animation: ${fadeIn} 1s ease-out 0.5s both;
`

const InfoTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: ${AppColors.textSecondary};
`

const InfoList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
`

const InfoItem = styled.li`
  padding: 0.5rem 0;
  padding-left: 1.8rem;
  position: relative;
  
  &::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: ${AppColors.primary};
    font-weight: bold;
  }
`

const CtaContainer = styled.div`
  text-align: center;
  animation: ${fadeIn} 1s ease-out 0.8s both;
`

// Mejoramos el botón para que responda más rápido
const ActionButton = styled(Button)`
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    background: rgba(255, 255, 255, 0.5);
    opacity: 0;
    border-radius: 100%;
    transform: scale(1, 1) translate(-50%);
    transform-origin: 50% 50%;
  }
  
  &:focus:not(:active)::after {
    animation: ripple 1s ease-out;
  }
  
  @keyframes ripple {
    0% {
      transform: scale(0, 0);
      opacity: 0.5;
    }
    20% {
      transform: scale(25, 25);
      opacity: 0.3;
    }
    100% {
      opacity: 0;
      transform: scale(40, 40);
    }
  }
`

const TestIntroduction: React.FC = () => {
  return (
    <TestIntroContainer>
      <Container>
        <IntroHeader>
          <IntroTitle>Test de Dependencia al Tabaco</IntroTitle>
          <IntroDescription>
            Nuestro test de dependencia te ayudará a entender tu relación con el tabaco y te proporcionará
            recomendaciones personalizadas para comenzar tu camino hacia una vida libre de humo.
          </IntroDescription>
        </IntroHeader>

        <FeaturesGrid>
          <FeatureItem>
            <FeatureIcon>
              <ClipboardCheck size={24} />
            </FeatureIcon>
            <FeatureTitle>Evaluación Completa</FeatureTitle>
            <FeatureDescription>
              14 preguntas diseñadas por expertos para evaluar con precisión tu nivel de dependencia física y
              psicológica.
            </FeatureDescription>
          </FeatureItem>

          <FeatureItem>
            <FeatureIcon>
              <Clock size={24} />
            </FeatureIcon>
            <FeatureTitle>Rápido y Sencillo</FeatureTitle>
            <FeatureDescription>
              Completa el test en menos de 5 minutos y recibe tus resultados al instante, sin necesidad de registro.
            </FeatureDescription>
          </FeatureItem>

          <FeatureItem>
            <FeatureIcon>
              <ChartBar size={24} />
            </FeatureIcon>
            <FeatureTitle>Resultados Detallados</FeatureTitle>
            <FeatureDescription>
              Obtén una evaluación clara de tu nivel de dependencia y comprende los factores que influyen en tu hábito.
            </FeatureDescription>
          </FeatureItem>

          <FeatureItem>
            <FeatureIcon>
              <Shield size={24} />
            </FeatureIcon>
            <FeatureTitle>Privacidad Garantizada</FeatureTitle>
            <FeatureDescription>
              Tus respuestas son completamente confidenciales y no se comparten con terceros ni requieren
              identificación.
            </FeatureDescription>
          </FeatureItem>
        </FeaturesGrid>

        <TestInfo>
          <InfoTitle>¿Por qué realizar este test?</InfoTitle>
          <InfoList>
            <InfoItem>
              Conocer tu nivel de dependencia es el primer paso para desarrollar una estrategia efectiva para dejar de
              fumar.
            </InfoItem>
            <InfoItem>
              Identificarás los factores emocionales y situacionales que desencadenan tu deseo de fumar.
            </InfoItem>
            <InfoItem>Recibirás recomendaciones personalizadas basadas en tu perfil específico.</InfoItem>
            <InfoItem>
              Podrás medir tu progreso realizando el test nuevamente después de comenzar tu proceso de cesación.
            </InfoItem>
          </InfoList>

          <InfoTitle>¿Cómo interpretar los resultados?</InfoTitle>
          <p>
            Al finalizar el test, recibirás una clasificación de tu nivel de dependencia (baja, moderada, alta o muy
            alta) junto con una explicación detallada y recomendaciones específicas para tu situación. Recuerda que este
            test es una herramienta informativa y no reemplaza el consejo médico profesional.
          </p>
        </TestInfo>

        <CtaContainer>
          {/* Reemplazamos el botón normal por nuestro ActionButton mejorado */}
          <ActionButton size="large">
            <Link to="/test/start" style={{ color: "inherit", textDecoration: "none" }}>
              Comenzar Test
            </Link>
          </ActionButton>
        </CtaContainer>
      </Container>
    </TestIntroContainer>
  )
}

export default TestIntroduction
