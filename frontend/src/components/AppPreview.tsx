import type React from "react"
import styled, { keyframes } from "styled-components"
import { AppColors } from "../styles/colors"
import { Award, Clock, Heart, Shield } from "lucide-react"
import { Link } from "react-router-dom"
import Button from "./ui/Button"

// Import animations
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

const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`

const AppPreviewSection = styled.section`
  padding: 6rem 0;
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

const AppPreviewContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
  
  @media (max-width: 992px) {
    flex-direction: column;
    gap: 3rem;
  }
`

const PhoneContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  position: relative;
  
  @media (max-width: 992px) {
    order: 1;
  }
`

const PhoneFrame = styled.div`
  width: 280px;
  height: 570px;
  background-color: ${AppColors.cardBackground};
  border-radius: 36px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  padding: 12px;
  position: relative;
  z-index: 2;
  animation: ${float} 6s ease-in-out infinite;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 150px;
    height: 30px;
    background-color: ${AppColors.cardBackground};
    border-radius: 0 0 15px 15px;
    z-index: 3;
  }
`

const PhoneScreen = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
`

const ScreenImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const PhoneOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0));
  border-radius: 24px;
  pointer-events: none;
  z-index: 2;
`

const SecondaryPhone = styled(PhoneFrame)`
  position: absolute;
  top: 40px;
  left: -80px;
  transform: scale(0.85);
  opacity: 0.7;
  z-index: 1;
  animation: ${float} 6s ease-in-out infinite 1s;
  
  @media (max-width: 1200px) {
    display: none;
  }
`

const ThirdPhone = styled(PhoneFrame)`
  position: absolute;
  top: 40px;
  right: -80px;
  transform: scale(0.85);
  opacity: 0.7;
  z-index: 1;
  animation: ${float} 6s ease-in-out infinite 2s;
  
  @media (max-width: 1200px) {
    display: none;
  }
`

const FeaturesContainer = styled.div`
  flex: 1;
  padding-left: 3rem;
  
  @media (max-width: 992px) {
    padding-left: 0;
    order: 2;
  }
`

const FeaturesTitle = styled.h3`
  font-size: 2.2rem;
  margin-bottom: 1.5rem;
  color: ${AppColors.primary};
  animation: ${fadeIn} 0.8s ease-out;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
    text-align: center;
  }
`

const FeaturesDescription = styled.p`
  font-size: 1.1rem;
  margin-bottom: 2rem;
  color: ${AppColors.text};
  line-height: 1.6;
  animation: ${fadeIn} 0.8s ease-out 0.2s both;
  
  @media (max-width: 768px) {
    text-align: center;
  }
`

const FeaturesList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
`

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  animation: ${fadeIn} 0.8s ease-out;
  animation-fill-mode: both;
  
  &:nth-child(1) {
    animation-delay: 0.3s;
  }
  
  &:nth-child(2) {
    animation-delay: 0.4s;
  }
  
  &:nth-child(3) {
    animation-delay: 0.5s;
  }
  
  &:nth-child(4) {
    animation-delay: 0.6s;
  }
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`

const FeatureIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${AppColors.primary}20;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${AppColors.primary};
  flex-shrink: 0;
`

const FeatureText = styled.div`
  flex: 1;
`

const FeatureTitle = styled.h4`
  font-size: 1.2rem;
  margin-bottom: 0.3rem;
  color: ${AppColors.textSecondary};
`

const FeatureDescription = styled.p`
  font-size: 0.95rem;
  color: ${AppColors.text};
  line-height: 1.5;
`

const ButtonContainer = styled.div`
  margin-top: 2.5rem;
  animation: ${fadeIn} 0.8s ease-out 0.7s both;
  
  @media (max-width: 768px) {
    text-align: center;
  }
`

// App screenshots - Usando imágenes de la carpeta especificada
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
        {/* Contenedor de texto a la izquierda */}
        <FeaturesContainer>
          <FeaturesTitle>Lleva tu progreso contigo</FeaturesTitle>
          <FeaturesDescription>
            La aplicación ZeroSmoke te permite monitorear tu progreso, recibir apoyo personalizado y acceder a recursos
            exclusivos desde cualquier lugar.
          </FeaturesDescription>

          <FeaturesList>
            <FeatureItem>
              <FeatureIcon>
                <Award size={24} />
              </FeatureIcon>
              <FeatureText>
                <FeatureTitle>Sistema de logros</FeatureTitle>
                <FeatureDescription>
                  Gana medallas y recompensas por cada día sin fumar para mantenerte motivado.
                </FeatureDescription>
              </FeatureText>
            </FeatureItem>

            <FeatureItem>
              <FeatureIcon>
                <Clock size={24} />
              </FeatureIcon>
              <FeatureText>
                <FeatureTitle>Seguimiento en tiempo real</FeatureTitle>
                <FeatureDescription>
                  Visualiza tu progreso, ahorro económico y mejoras en tu salud día a día.
                </FeatureDescription>
              </FeatureText>
            </FeatureItem>

            <FeatureItem>
              <FeatureIcon>
                <Heart size={24} />
              </FeatureIcon>
              <FeatureText>
                <FeatureTitle>Apoyo emocional</FeatureTitle>
                <FeatureDescription>
                  Chatbot inteligente que te brinda apoyo en momentos de ansiedad o deseo de fumar.
                </FeatureDescription>
              </FeatureText>
            </FeatureItem>

            <FeatureItem>
              <FeatureIcon>
                <Shield size={24} />
              </FeatureIcon>
              <FeatureText>
                <FeatureTitle>Recursos personalizados</FeatureTitle>
                <FeatureDescription>
                  Accede a estrategias y contenido educativo adaptado a tu perfil y nivel de dependencia.
                </FeatureDescription>
              </FeatureText>
            </FeatureItem>
          </FeaturesList>

          <ButtonContainer>
            <Button size="medium">
              <Link to="/app" style={{ color: "inherit", textDecoration: "none" }}>
                Descargar Aplicación
              </Link>
            </Button>
          </ButtonContainer>
        </FeaturesContainer>

        {/* Contenedor de teléfonos a la derecha con posición ajustada */}
        <PhoneContainer>
          <SecondaryPhone>
            <PhoneScreen>
              <ScreenImage src={appScreenshots[1]} alt="App Screenshot" />
              <PhoneOverlay />
            </PhoneScreen>
          </SecondaryPhone>

          <PhoneFrame>
            <PhoneScreen>
              <ScreenImage src={appScreenshots[0]} alt="App Screenshot" />
              <PhoneOverlay />
            </PhoneScreen>
          </PhoneFrame>

          <ThirdPhone>
            <PhoneScreen>
              <ScreenImage src={appScreenshots[2]} alt="App Screenshot" />
              <PhoneOverlay />
            </PhoneScreen>
          </ThirdPhone>
        </PhoneContainer>
      </AppPreviewContainer>
    </AppPreviewSection>
  )
}

export default AppPreview
