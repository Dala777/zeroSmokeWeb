import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { AppColors } from "../styles/colors";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { getHomePageData, HomePageData } from "../services/storageService";

const HeroSection = styled.section`
  position: relative;
  height: 80vh;
  min-height: 500px;
  display: flex;
  align-items: center;
  background-color: ${AppColors.background};
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      135deg,
      rgba(10, 31, 13, 0.9) 0%,
      rgba(19, 34, 24, 0.8) 100%
    );
    z-index: 1;
  }
`

const HeroBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/placeholder.svg?height=1080&width=1920');
  background-size: cover;
  background-position: center;
  filter: brightness(0.4);
`

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  width: 100%;
`

const HeroTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: ${AppColors.text};
  max-width: 700px;
  
  @media (max-width: 768px) {
    font-size: 2.25rem;
  }
`

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  margin-bottom: 2rem;
  color: ${AppColors.textSecondary};
  max-width: 600px;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`

const HeroButtons = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }
`

const FeaturesSection = styled.section`
  padding: 5rem 0;
  background-color: ${AppColors.background};
`

const SectionTitle = styled.h2`
  font-size: 2.25rem;
  text-align: center;
  margin-bottom: 3rem;
  color: ${AppColors.primary};
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`

const FeatureCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
`

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  color: ${AppColors.primary};
  margin-bottom: 1.5rem;
`

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: ${AppColors.textSecondary};
`

const FeatureDescription = styled.p`
  color: ${AppColors.text};
  line-height: 1.6;
`

const StatsSection = styled.section`
  padding: 5rem 0;
  background-color: ${AppColors.cardBackground};
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`

const StatCard = styled.div`
  text-align: center;
`

const StatNumber = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: ${AppColors.primary};
  margin-bottom: 0.5rem;
`

const StatLabel = styled.div`
  font-size: 1.125rem;
  color: ${AppColors.textSecondary};
`

const CtaSection = styled.section`
  padding: 5rem 0;
  background-color: ${AppColors.background};
  text-align: center;
`

const CtaContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
`

const CtaTitle = styled.h2`
  font-size: 2.25rem;
  margin-bottom: 1.5rem;
  color: ${AppColors.primary};
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`

const CtaDescription = styled.p`
  font-size: 1.125rem;
  margin-bottom: 2rem;
  color: ${AppColors.text};
`

const HomePage: React.FC = () => {
  const [homeData, setHomeData] = useState<HomePageData | null>(null);
  
  useEffect(() => {
    // Cargar datos de la página de inicio
    const data = getHomePageData();
    setHomeData(data);
  }, []);
  
  if (!homeData) {
    return <div>Cargando...</div>;
  }
  return (
    <>
      <HeroSection>
        <HeroBackground style={{ backgroundImage: `url(${homeData.heroImage})` }} />
        <HeroContent>
          <HeroTitle>{homeData.heroTitle}</HeroTitle>
          <HeroSubtitle>{homeData.heroSubtitle}</HeroSubtitle>
          <HeroButtons>
            <Button size="large">
              <Link to="/test" style={{ color: "inherit" }}>
                Realizar Test de Dependencia
              </Link>
            </Button>
            <Button variant="outline" size="large">
              <Link to="/app" style={{ color: "inherit" }}>
                Descargar App
              </Link>
            </Button>
          </HeroButtons>
        </HeroContent>
      </HeroSection>

      <FeaturesSection>
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
            <Link to="/app" style={{ color: "inherit" }}>
              Descargar App
            </Link>
          </Button>
        </CtaContent>
      </CtaSection>
    </>
  )
}

export default HomePage

