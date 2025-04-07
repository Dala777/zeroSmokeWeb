"use client"

import type React from "react"
import { useEffect, useState } from "react"
import styled, { keyframes } from "styled-components"
import { Link } from "react-router-dom"
import { AppColors } from "../styles/colors"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import { getHomePageData, type HomePageData } from "../services/storageService"

// Add subtle fade-in animation
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

// Enhanced hero section with better image handling
const HeroSection = styled.section`
  position: relative;
  height: 100vh;
  min-height: 600px;
  display: flex;
  align-items: center;
  background-color: ${AppColors.background};
  overflow: hidden;

  @media (max-width: 768px) {
    min-height: 500px;
  }
`

// Improved background image handling with overlay
const HeroBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  filter: brightness(0.7);
  transition: all 0.5s ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.4) 0%,
      rgba(0, 0, 0, 0.6) 100%
    );
  }
`

// Enhanced hero content with animation
const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  width: 100%;
  text-align: center;
  animation: ${fadeIn} 1s ease-out;
`

// Enhanced title with text shadow for better readability
const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: white;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`

// Enhanced subtitle with better contrast
const HeroSubtitle = styled.p`
  font-size: 1.5rem;
  margin-bottom: 2.5rem;
  color: rgba(255, 255, 255, 0.9);
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.5);
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`

// Improved button layout
const HeroButtons = styled.div`
  display: flex;
  gap: 1.5rem;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
    gap: 1rem;
  }
`

// Enhanced features section with subtle background
const FeaturesSection = styled.section`
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
    background: radial-gradient(circle at top right, ${AppColors.cardBackground}40, transparent 70%);
    z-index: 0;
  }
`

// Enhanced section title with underline
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

// Improved features grid with better spacing
const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2.5rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
`

// Enhanced feature card with hover effect
const FeatureCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2.5rem 2rem;
  background-color: ${AppColors.cardBackground};
  color: ${AppColors.text};
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  }
`

// Enhanced feature icon with animation
const FeatureIcon = styled.div`
  font-size: 3rem;
  color: ${AppColors.primary};
  margin-bottom: 1.5rem;
  background-color: ${AppColors.primary}15;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: transform 0.3s ease;
  
  ${FeatureCard}:hover & {
    transform: scale(1.1);
  }
`

// Enhanced feature title
const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: ${AppColors.textSecondary};
  font-weight: 600;
`

// Enhanced feature description
const FeatureDescription = styled.p`
  color: ${AppColors.text};
  line-height: 1.7;
  font-size: 1.05rem;
`

// Enhanced stats section with gradient background
const StatsSection = styled.section`
  padding: 6rem 0;
  background: linear-gradient(135deg, ${AppColors.cardBackground}, ${AppColors.cardBackground}90);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, ${AppColors.primary}10, transparent 70%);
    z-index: 0;
  }
`

// Improved stats grid
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
`

// Enhanced stat card with hover effect
const StatCard = styled.div`
  text-align: center;
  background-color: ${AppColors.background};
  padding: 2rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-8px);
  }
`

// Enhanced stat number with animation
const StatNumber = styled.div`
  font-size: 3.5rem;
  font-weight: 700;
  color: ${AppColors.primary};
  margin-bottom: 0.8rem;
  line-height: 1;
`

// Enhanced stat label
const StatLabel = styled.div`
  font-size: 1.2rem;
  color: ${AppColors.textSecondary};
  line-height: 1.4;
`

// Enhanced CTA section
const CtaSection = styled.section`
  padding: 7rem 0;
  background-color: ${AppColors.background};
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, ${AppColors.primary}10, transparent 70%);
    z-index: 0;
  }
`

// Enhanced CTA content
const CtaContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
`

// Enhanced CTA title
const CtaTitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: ${AppColors.primary};
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`

// Enhanced CTA description
const CtaDescription = styled.p`
  font-size: 1.25rem;
  margin-bottom: 2.5rem;
  color: ${AppColors.text};
  line-height: 1.6;
`

// Add scroll indicator for better UX
const ScrollIndicator = styled.div`
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  opacity: 0.8;
  transition: opacity 0.3s ease;
  cursor: pointer;
  
  &:hover {
    opacity: 1;
  }
  
  @media (max-width: 768px) {
    bottom: 20px;
  }
`

const ScrollText = styled.span`
  font-size: 0.9rem;
  margin-bottom: 8px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
`

const ScrollArrow = keyframes`
  0% {
    transform: translateY(0);
    opacity: 0.8;
  }
  50% {
    transform: translateY(10px);
    opacity: 1;
  }
  100% {
    transform: translateY(0);
    opacity: 0.8;
  }
`

const ArrowIcon = styled.div`
  font-size: 1.5rem;
  animation: ${ScrollArrow} 2s infinite;
`

const HomePage: React.FC = () => {
  const [homeData, setHomeData] = useState<HomePageData | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Cargar datos de la página de inicio
    const data = getHomePageData()
    setHomeData(data)
    setIsLoaded(true)
  }, [])

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("features")
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  if (!homeData) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Cargando...</LoadingText>
      </LoadingContainer>
    )
  }

  return (
    <>
      <HeroSection>
        <HeroBackground
          style={{
            backgroundImage: `url(${homeData.heroImage})`,
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 1s ease-in-out",
          }}
        />
        <HeroContent>
          <HeroTitle>{homeData.heroTitle}</HeroTitle>
          <HeroSubtitle>{homeData.heroSubtitle}</HeroSubtitle>
          <HeroButtons>
            <Button size="large">
              <Link to="/test" style={{ color: "inherit", textDecoration: "none" }}>
                Realizar Test de Dependencia
              </Link>
            </Button>
            <Button variant="outline" size="large">
              <Link to="/app" style={{ color: "inherit", textDecoration: "none" }}>
                Descargar App
              </Link>
            </Button>
          </HeroButtons>
        </HeroContent>
        <ScrollIndicator onClick={scrollToFeatures}>
          <ScrollText>Descubre más</ScrollText>
          <ArrowIcon>↓</ArrowIcon>
        </ScrollIndicator>
      </HeroSection>

      <FeaturesSection id="features">
        <SectionTitle>¿Por qué elegir ZeroSmoke?</SectionTitle>
        <FeaturesGrid>
          {homeData.features.map((feature) => (
            <FeatureCard key={feature.id}>
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </FeaturesSection>

      <StatsSection>
        <SectionTitle>El impacto del tabaco</SectionTitle>
        <StatsGrid>
          <StatCard>
            <StatNumber>8M+</StatNumber>
            <StatLabel>Muertes anuales por tabaco</StatLabel>
          </StatCard>

          <StatCard>
            <StatNumber>1.3B</StatNumber>
            <StatLabel>Fumadores en el mundo</StatLabel>
          </StatCard>

          <StatCard>
            <StatNumber>50%</StatNumber>
            <StatLabel>Fumadores desarrollan enfermedades graves</StatLabel>
          </StatCard>

          <StatCard>
            <StatNumber>10+</StatNumber>
            <StatLabel>Años de vida recuperados al dejar de fumar</StatLabel>
          </StatCard>
        </StatsGrid>
      </StatsSection>

      <CtaSection>
        <CtaContent>
          <CtaTitle>¿Listo para dar el primer paso?</CtaTitle>
          <CtaDescription>
            Descarga nuestra aplicación móvil y comienza tu camino hacia una vida más saludable y libre de tabaco hoy
            mismo.
          </CtaDescription>
          <Button size="large">
            <Link to="/app" style={{ color: "inherit", textDecoration: "none" }}>
              Descargar App
            </Link>
          </Button>
        </CtaContent>
      </CtaSection>
    </>
  )
}

// Add loading components
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: ${AppColors.background};
`

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid ${AppColors.secondary}30;
  border-top: 5px solid ${AppColors.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 20px;
`

const LoadingText = styled.p`
  color: ${AppColors.textSecondary};
  font-size: 1.2rem;
`

export default HomePage

