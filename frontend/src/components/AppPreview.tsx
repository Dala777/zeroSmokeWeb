import type React from "react"
import styled, { keyframes } from "styled-components"
import { AppColors } from "../styles/colors"
import { Award, Clock, Heart, Shield, Smartphone } from "lucide-react"
import { Link } from "react-router-dom"
import Button from "./ui/Button"

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`

const AppPreviewSection = styled.section`
  padding: 4rem 0;
  background-color: ${AppColors.background};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at top right, ${AppColors.cardBackground}40, transparent 70%);
    z-index: 0;
  }
`

const SectionTitle = styled.h2`
  font-size: 2rem;
  text-align: center;
  margin-bottom: 2.5rem;
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
    margin-bottom: 2rem;
  }
`

const AppPreviewContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  gap: 4rem;
  position: relative;
  z-index: 1;

  @media (max-width: 1024px) {
    flex-direction: column;
    gap: 3rem;
  }
`

const PhoneContainer = styled.div`
  flex: 0 0 280px;
  display: flex;
  justify-content: center;
  position: relative;

  @media (max-width: 1024px) {
    flex: 0 0 auto;
    order: -1;
  }
`

const PhoneFrame = styled.div`
  width: 260px;
  height: 530px;
  background-color: ${AppColors.cardBackground};
  border-radius: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  padding: 10px;
  position: relative;
  animation: ${float} 6s ease-in-out infinite;
  border: 1px solid ${AppColors.border};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 24px;
    background-color: ${AppColors.cardBackground};
    border-radius: 0 0 12px 12px;
    z-index: 3;
  }
`

const PhoneScreen = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 22px;
  overflow: hidden;
  position: relative;
`

const ScreenImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const FeaturesContainer = styled.div`
  flex: 1;
  min-width: 0;

  @media (max-width: 1024px) {
    width: 100%;
  }
`

const FeaturesTitle = styled.h3`
  font-size: 1.75rem;
  margin-bottom: 1rem;
  color: ${AppColors.text};
  animation: ${fadeIn} 0.8s ease-out;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    text-align: center;
  }
`

const FeaturesDescription = styled.p`
  font-size: 1rem;
  margin-bottom: 1.5rem;
  color: ${AppColors.textSecondary};
  line-height: 1.6;
  animation: ${fadeIn} 0.8s ease-out 0.2s both;

  @media (max-width: 768px) {
    text-align: center;
  }
`

const FeaturesList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const FeatureItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background-color: ${AppColors.surface};
  border-radius: 12px;
  animation: ${fadeIn} 0.8s ease-out both;
  transition: all 0.25s ease;

  &:hover {
    background-color: ${AppColors.primary}10;
    transform: translateX(4px);
  }

  &:nth-child(1) { animation-delay: 0.3s; }
  &:nth-child(2) { animation-delay: 0.4s; }
  &:nth-child(3) { animation-delay: 0.5s; }
  &:nth-child(4) { animation-delay: 0.6s; }
`

const FeatureIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, ${AppColors.primary}20, ${AppColors.tertiary});
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${AppColors.accent};
  flex-shrink: 0;
`

const FeatureTextContainer = styled.div`
  flex: 1;
`

const FeatureTitle = styled.h4`
  font-size: 0.95rem;
  margin-bottom: 0.2rem;
  color: ${AppColors.text};
  font-weight: 600;
`

const FeatureDescription = styled.p`
  font-size: 0.85rem;
  color: ${AppColors.textSecondary};
  line-height: 1.4;
  margin: 0;
`

const ButtonContainer = styled.div`
  margin-top: 2rem;
  animation: ${fadeIn} 0.8s ease-out 0.7s both;

  @media (max-width: 768px) {
    text-align: center;
  }
`

const appScreenshots = [
  require("../styles/images/app_screen1.png"),
  require("../styles/images/app_screen2.png"),
  require("../styles/images/app_screen3.png"),
]

const AppPreview: React.FC = () => {
  return (
    <AppPreviewSection id="app-preview">
      <SectionTitle>Nuestra Aplicación Móvil</SectionTitle>
      <AppPreviewContainer>
        <PhoneContainer>
          <PhoneFrame>
            <PhoneScreen>
              <ScreenImage src={appScreenshots[0]} alt="App Screenshot" />
            </PhoneScreen>
          </PhoneFrame>
        </PhoneContainer>

        <FeaturesContainer>
          <FeaturesTitle>Lleva tu progreso contigo</FeaturesTitle>
          <FeaturesDescription>
            La aplicación ZeroSmoke te permite monitorear tu progreso, recibir apoyo personalizado y acceder a recursos
            exclusivos desde cualquier lugar.
          </FeaturesDescription>

          <FeaturesList>
            <FeatureItem>
              <FeatureIcon><Award size={20} /></FeatureIcon>
              <FeatureTextContainer>
                <FeatureTitle>Sistema de logros</FeatureTitle>
                <FeatureDescription>Gana medallas y recompensas por cada día sin fumar.</FeatureDescription>
              </FeatureTextContainer>
            </FeatureItem>

            <FeatureItem>
              <FeatureIcon><Clock size={20} /></FeatureIcon>
              <FeatureTextContainer>
                <FeatureTitle>Seguimiento en tiempo real</FeatureTitle>
                <FeatureDescription>Visualiza tu progreso, ahorro y mejoras en tu salud.</FeatureDescription>
              </FeatureTextContainer>
            </FeatureItem>

            <FeatureItem>
              <FeatureIcon><Heart size={20} /></FeatureIcon>
              <FeatureTextContainer>
                <FeatureTitle>Apoyo emocional</FeatureTitle>
                <FeatureDescription>Chatbot inteligente para momentos de ansiedad.</FeatureDescription>
              </FeatureTextContainer>
            </FeatureItem>

            <FeatureItem>
              <FeatureIcon><Shield size={20} /></FeatureIcon>
              <FeatureTextContainer>
                <FeatureTitle>Recursos personalizados</FeatureTitle>
                <FeatureDescription>Contenido educativo adaptado a tu perfil.</FeatureDescription>
              </FeatureTextContainer>
            </FeatureItem>
          </FeaturesList>

          <ButtonContainer>
            <Button size="medium">
              <Smartphone size={18} />
              <Link to="/app" style={{ color: "inherit", textDecoration: "none" }}>
                Descargar Aplicación
              </Link>
            </Button>
          </ButtonContainer>
        </FeaturesContainer>
      </AppPreviewContainer>
    </AppPreviewSection>
  )
}

export default AppPreview