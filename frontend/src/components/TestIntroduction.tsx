import type React from "react"
import styled, { keyframes } from "styled-components"
import { AppColors } from "../styles/colors"
import Button from "./ui/Button"
import { Link } from "react-router-dom"
import { ClipboardCheck, Clock, BarChartIcon as ChartBar, Shield, ArrowRight } from "lucide-react"

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`

const TestIntroContainer = styled.section`
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
    background: radial-gradient(circle at bottom right, ${AppColors.surface}80, transparent 70%);
  }
`

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1.5rem;
  position: relative;
  z-index: 1;
`

const IntroHeader = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
  animation: ${fadeIn} 1s ease-out;
`

const IntroTitle = styled.h2`
  font-size: 2rem;
  color: ${AppColors.text};
  margin-bottom: 1rem;

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

const IntroDescription = styled.p`
  font-size: 1.05rem;
  max-width: 700px;
  margin: 0 auto;
  color: ${AppColors.textSecondary};

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
  margin-bottom: 2.5rem;

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
  border: 1px solid ${AppColors.border};
  transition: all 0.3s ease;
  animation: ${slideUp} 0.8s ease-out both;

  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }
  &:nth-child(4) { animation-delay: 0.4s; }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
    border-color: ${AppColors.primary}30;
  }
`

const FeatureIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, ${AppColors.primary}20, ${AppColors.tertiary});
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${AppColors.accent};
  margin-bottom: 0.75rem;
`

const FeatureTitle = styled.h3`
  font-size: 1.05rem;
  margin-bottom: 0.5rem;
  color: ${AppColors.text};
  font-weight: 600;
`

const FeatureDescription = styled.p`
  color: ${AppColors.textSecondary};
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.5;
`

const TestInfo = styled.div`
  background-color: ${AppColors.cardBackground};
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid ${AppColors.border};
  margin-bottom: 2.5rem;
  animation: ${fadeIn} 1s ease-out 0.5s both;
`

const InfoTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: ${AppColors.text};
`

const InfoList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem;
`

const InfoItem = styled.li`
  padding: 0.4rem 0;
  padding-left: 1.75rem;
  position: relative;
  color: ${AppColors.textSecondary};
  font-size: 0.925rem;

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
            <FeatureIcon><ClipboardCheck size={22} /></FeatureIcon>
            <FeatureTitle>Evaluación Completa</FeatureTitle>
            <FeatureDescription>
              14 preguntas diseñadas por expertos para evaluar tu nivel de dependencia física y psicológica.
            </FeatureDescription>
          </FeatureItem>

          <FeatureItem>
            <FeatureIcon><Clock size={22} /></FeatureIcon>
            <FeatureTitle>Rápido y Sencillo</FeatureTitle>
            <FeatureDescription>
              Completa el test en menos de 5 minutos y recibe resultados al instante, sin registro.
            </FeatureDescription>
          </FeatureItem>

          <FeatureItem>
            <FeatureIcon><ChartBar size={22} /></FeatureIcon>
            <FeatureTitle>Resultados Detallados</FeatureTitle>
            <FeatureDescription>
              Obtén una evaluación clara de tu nivel de dependencia y factores que influyen en tu hábito.
            </FeatureDescription>
          </FeatureItem>

          <FeatureItem>
            <FeatureIcon><Shield size={22} /></FeatureIcon>
            <FeatureTitle>Privacidad Garantizada</FeatureTitle>
            <FeatureDescription>
              Tus respuestas son confidenciales y no se comparten con terceros ni requieren identificación.
            </FeatureDescription>
          </FeatureItem>
        </FeaturesGrid>

        <TestInfo>
          <InfoTitle>¿Por qué realizar este test?</InfoTitle>
          <InfoList>
            <InfoItem>Conocer tu nivel de dependencia es el primer paso para desarrollar una estrategia efectiva.</InfoItem>
            <InfoItem>Identificarás los factores emocionales y situacionales que desencadenan tu deseo de fumar.</InfoItem>
            <InfoItem>Recibirás recomendaciones personalizadas basadas en tu perfil específico.</InfoItem>
            <InfoItem>Podrás medir tu progreso realizando el test nuevamente después de comenzar tu proceso.</InfoItem>
          </InfoList>

          <InfoTitle>¿Cómo interpretar los resultados?</InfoTitle>
          <p style={{ color: AppColors.textSecondary, fontSize: "0.925rem", lineHeight: 1.6, margin: 0 }}>
            Al finalizar el test, recibirás una clasificación de tu nivel de dependencia (baja, moderada, alta o muy
            alta) junto con una explicación detallada y recomendaciones específicas. Este test es una herramienta
            informativa y no reemplaza el consejo médico profesional.
          </p>
        </TestInfo>

        <CtaContainer>
          <Button size="large">
            <Link to="/test/start" style={{ color: "inherit", textDecoration: "none" }}>
              Comenzar Test
            </Link>
            <ArrowRight size={18} />
          </Button>
        </CtaContainer>
      </Container>
    </TestIntroContainer>
  )
}

export default TestIntroduction