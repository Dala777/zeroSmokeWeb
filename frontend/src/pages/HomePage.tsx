"use client"

import type React from "react"
import { useEffect, useState } from "react"
import styled, { keyframes } from "styled-components"
import { Link } from "react-router-dom"
import { AppColors } from "../styles/colors"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import Benefits from "../components/Benefits"
import { getHomePageData, type HomePageData } from "../services/storageService"
import { ArrowDown } from 'lucide-react'
import AppPreview from "../components/AppPreview"

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`

const HeroSection = styled.section`
  position: relative;
  min-height: 85vh;
  display: flex;
  align-items: center;
  background-color: ${AppColors.background};
  overflow: hidden;
`

const HeroBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  filter: brightness(0.5);

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%);
  }
`

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  width: 100%;
  animation: ${fadeIn} 0.8s ease-out;
`

const HeroTitle = styled.h1`
  font-size: 2.75rem;
  font-weight: 800;
  margin-bottom: 1.25rem;
  color: white;
  max-width: 750px;
  text-shadow: 0 2px 15px rgba(0, 0, 0, 0.4);
  line-height: 1.2;
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.75rem;
  }
`

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.9);
  max-width: 600px;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.4);
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1.05rem;
  }
`

const HeroButtons = styled.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    max-width: 320px;
  }
`

const FeaturesSection = styled.section`
  padding: 4rem 0;
  background-color: ${AppColors.background};
  position: relative;
`

const SectionTitle = styled.h2`
  font-size: 2rem;
  text-align: center;
  margin-bottom: 2.5rem;
  color: ${AppColors.text};
  position: relative;

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

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
`

const FeatureCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem 1.5rem;
  border: 1px solid ${AppColors.border};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
    border-color: ${AppColors.primary}30;
  }
`

const FeatureIcon = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, ${AppColors.primary}20, ${AppColors.tertiary});
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
  font-size: 1.75rem;
  color: ${AppColors.accent};
  transition: transform 0.3s ease;
  overflow: hidden;

  ${FeatureCard}:hover & {
    transform: scale(1.1);
  }
`

const FeatureImage = styled.img`
  width: 64px;
  height: 64px;
  object-fit: contain;
  padding: 8px;
`

const FeatureTitle = styled.h3`
  font-size: 1.15rem;
  margin-bottom: 0.75rem;
  color: ${AppColors.text};
  font-weight: 600;
`

const FeatureDescription = styled.p`
  color: ${AppColors.textSecondary};
  line-height: 1.6;
  font-size: 0.925rem;
  margin: 0;
`

const StatsSection = styled.section`
  padding: 4rem 0;
  background: linear-gradient(135deg, ${AppColors.cardBackground}, ${AppColors.surface});
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -30%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, ${AppColors.primary}08, transparent 70%);
    border-radius: 50%;
  }
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
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

const StatCard = styled.div`
  text-align: center;
  background-color: ${AppColors.cardBackground};
  padding: 2rem 1.5rem;
  border-radius: 16px;
  border: 1px solid ${AppColors.border};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
    border-color: ${AppColors.primary}30;
  }
`

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  color: ${AppColors.accent};
  margin-bottom: 0.5rem;
  line-height: 1;
  letter-spacing: -0.03em;
`

const StatLabel = styled.div`
  font-size: 0.95rem;
  color: ${AppColors.textSecondary};
  line-height: 1.4;
`

const CtaSection = styled.section`
  padding: 4rem 0;
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
    background: radial-gradient(circle at center, ${AppColors.primary}08, transparent 70%);
  }
`

const CtaContent = styled.div`
  max-width: 650px;
  margin: 0 auto;
  padding: 0 1.5rem;
  position: relative;
  z-index: 1;
`

const CtaTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: ${AppColors.text};

  @media (max-width: 768px) {
    font-size: 1.625rem;
  }
`

const CtaDescription = styled.p`
  font-size: 1.1rem;
  margin-bottom: 2rem;
  color: ${AppColors.textSecondary};
  line-height: 1.6;
`

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
  opacity: 0.7;
  transition: opacity 0.3s ease;
  cursor: pointer;

  &:hover { opacity: 1; }

  @media (max-width: 768px) {
    bottom: 20px;
  }
`

const ScrollText = styled.span`
  font-size: 0.8rem;
  margin-bottom: 6px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
`

const ArrowIcon = styled.div`
  animation: ${float} 2s ease-in-out infinite;
`

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
  width: 40px;
  height: 40px;
  border: 3px solid ${AppColors.secondary}30;
  border-top: 3px solid ${AppColors.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  margin-bottom: 1rem;
`

const LoadingText = styled.p`
  color: ${AppColors.textSecondary};
  font-size: 1rem;
`

const HomePage: React.FC = () => {
  const [homeData, setHomeData] = useState<HomePageData | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const data = getHomePageData()
    setHomeData(data)
    setIsLoaded(true)
  }, [])

  const scrollToFeatures = () => {
    const el = document.getElementById("features")
    if (el) el.scrollIntoView({ behavior: "smooth" })
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
            transition: "opacity 0.8s ease-in-out",
          }}
        />
        <HeroContent>
          <HeroTitle>{homeData.heroTitle}</HeroTitle>
          <HeroSubtitle>{homeData.heroSubtitle}</HeroSubtitle>
          <HeroButtons>
            <Button size="large">
              <Link to="/test" style={{ color: "inherit", textDecoration: "none" }}>
                Realizar Test
              </Link>
            </Button>
            <Button variant="outline" size="large" style={{ borderColor: "rgba(255,255,255,0.5)", color: "white" }}>
              <Link to="/app" style={{ color: "inherit", textDecoration: "none" }}>
                Descargar App
              </Link>
            </Button>
          </HeroButtons>
        </HeroContent>
        <ScrollIndicator onClick={scrollToFeatures}>
          <ScrollText>Descubre más</ScrollText>
          <ArrowIcon>
            <ArrowDown size={20} />
          </ArrowIcon>
        </ScrollIndicator>
      </HeroSection>

      <FeaturesSection id="features">
        <SectionTitle>¿Por qué elegir ZeroSmoke?</SectionTitle>
        <FeaturesGrid>
          {homeData.features.map((feature) => (
            <FeatureCard key={feature.id} hoverable>
              <FeatureIcon>
                {feature.image ? (
                  <FeatureImage src={feature.image} alt={feature.title} />
                ) : (
                  <span style={{ fontSize: "1.75rem" }}>{feature.icon}</span>
                )}
              </FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </FeaturesSection>

      <AppPreview />

      <Benefits />

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
            <StatLabel>Desarrollan enfermedades graves</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>10+</StatNumber>
            <StatLabel>Años recuperados al dejar de fumar</StatLabel>
          </StatCard>
        </StatsGrid>
      </StatsSection>

      <CtaSection>
        <CtaContent>
          <CtaTitle>¿Listo para dar el primer paso?</CtaTitle>
          <CtaDescription>
            Descarga nuestra aplicación móvil y comienza tu camino hacia una vida más saludable y libre de tabaco hoy mismo.
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

export default HomePage