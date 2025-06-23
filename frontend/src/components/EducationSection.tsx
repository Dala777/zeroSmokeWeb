import type React from "react"
import styled, { keyframes } from "styled-components"
import { AppColors } from "../styles/colors"
import Card from "./ui/Card"
import { Link } from "react-router-dom"
import { ArrowRight, Brain, Heart, TreesIcon as Lungs, Thermometer } from "lucide-react"

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

const EducationContainer = styled.section`
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

const SectionSubtitle = styled.p`
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

const EducationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`

const EducationCard = styled(Card)`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  background-color: ${AppColors.cardBackground};
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
  }
`

const CardIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${AppColors.primary}20;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: ${AppColors.primary};
  transition: transform 0.3s ease, background-color 0.3s ease;
  
  ${EducationCard}:hover & {
    transform: scale(1.1);
    background-color: ${AppColors.primary}30;
  }
`

const CardTitle = styled.h3`
  font-size: 1.4rem;
  margin-bottom: 1rem;
  color: ${AppColors.textSecondary};
`

const CardDescription = styled.p`
  color: ${AppColors.text};
  margin-bottom: 1.5rem;
  flex-grow: 1;
`

const CardLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: ${AppColors.primary};
  transition: gap 0.3s ease, color 0.3s ease;
  
  &:hover {
    gap: 0.8rem;
    color: ${AppColors.accent};
  }
`

const TimelineSection = styled.div`
  max-width: 1000px;
  margin: 5rem auto;
  position: relative;
  z-index: 1;
  padding: 0 2rem;
`

const TimelineTitle = styled.h3`
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 3rem;
  color: ${AppColors.primary};
`

const Timeline = styled.div`
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 4px;
    background-color: ${AppColors.primary}30;
    transform: translateX(-50%);
  }
  
  @media (max-width: 768px) {
    &::before {
      left: 30px;
    }
  }
`

const TimelineItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 3rem;
  
  &:nth-child(even) {
    flex-direction: row-reverse;
  }
  
  @media (max-width: 768px) {
    flex-direction: row !important;
  }
`

const TimelineContent = styled.div`
  width: 45%;
  padding: 1.5rem;
  background-color: ${AppColors.cardBackground};
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 20px;
    width: 20px;
    height: 20px;
    background-color: ${AppColors.primary};
    border-radius: 50%;
  }
  
  ${TimelineItem}:nth-child(odd) &::before {
    right: -60px;
  }
  
  ${TimelineItem}:nth-child(even) &::before {
    left: -60px;
  }
  
  @media (max-width: 768px) {
    width: calc(100% - 80px);
    margin-left: 80px;
    
    &::before {
      left: -50px !important;
    }
  }
`

const TimelineTime = styled.div`
  font-weight: 600;
  color: ${AppColors.primary};
  margin-bottom: 0.5rem;
`

const TimelineText = styled.p`
  margin: 0;
`

const EducationSection: React.FC = () => {
  return (
    <EducationContainer id="education">
      <SectionTitle>Educación sobre el Tabaquismo</SectionTitle>
      <SectionSubtitle>
        Conocer los efectos del tabaco en tu cuerpo es el primer paso para tomar decisiones informadas. Descubre cómo el
        tabaco afecta diferentes aspectos de tu salud y bienestar.
      </SectionSubtitle>

      <EducationGrid>
        <EducationCard>
          <CardIcon>
            <Lungs size={28} />
          </CardIcon>
          <CardTitle>Sistema Respiratorio</CardTitle>
          <CardDescription>
            El tabaco daña los pulmones y las vías respiratorias, causando enfermedades como EPOC, bronquitis crónica y
            aumentando el riesgo de infecciones respiratorias.
          </CardDescription>
          <CardLink to="/education/respiratory">
            Aprender más <ArrowRight size={16} />
          </CardLink>
        </EducationCard>

        <EducationCard>
          <CardIcon>
            <Heart size={28} />
          </CardIcon>
          <CardTitle>Sistema Cardiovascular</CardTitle>
          <CardDescription>
            Fumar aumenta la presión arterial, daña los vasos sanguíneos y aumenta significativamente el riesgo de
            enfermedades cardíacas y accidentes cerebrovasculares.
          </CardDescription>
          <CardLink to="/education/cardiovascular">
            Aprender más <ArrowRight size={16} />
          </CardLink>
        </EducationCard>

        <EducationCard>
          <CardIcon>
            <Brain size={28} />
          </CardIcon>
          <CardTitle>Salud Mental</CardTitle>
          <CardDescription>
            Contrario a la creencia popular, fumar no reduce el estrés a largo plazo. Está asociado con mayor ansiedad,
            depresión y otros problemas de salud mental.
          </CardDescription>
          <CardLink to="/education/mental">
            Aprender más <ArrowRight size={16} />
          </CardLink>
        </EducationCard>

        <EducationCard>
          <CardIcon>
            <Thermometer size={28} />
          </CardIcon>
          <CardTitle>Sistema Inmunológico</CardTitle>
          <CardDescription>
            El tabaco debilita el sistema inmunológico, haciendo que tu cuerpo sea más susceptible a infecciones y
            enfermedades, y retrasando la curación de heridas.
          </CardDescription>
          <CardLink to="/education/immune">
            Aprender más <ArrowRight size={16} />
          </CardLink>
        </EducationCard>
      </EducationGrid>

      <TimelineSection>
        <TimelineTitle>Beneficios de Dejar de Fumar: Línea de Tiempo</TimelineTitle>
        <Timeline>
          <TimelineItem>
            <TimelineContent>
              <TimelineTime>20 minutos</TimelineTime>
              <TimelineText>
                Tu presión arterial y frecuencia cardíaca disminuyen, acercándose a niveles normales.
              </TimelineText>
            </TimelineContent>
          </TimelineItem>

          <TimelineItem>
            <TimelineContent>
              <TimelineTime>12 horas</TimelineTime>
              <TimelineText>
                Los niveles de monóxido de carbono en tu sangre vuelven a la normalidad, aumentando los niveles de
                oxígeno.
              </TimelineText>
            </TimelineContent>
          </TimelineItem>

          <TimelineItem>
            <TimelineContent>
              <TimelineTime>2-3 días</TimelineTime>
              <TimelineText>
                Tu sentido del gusto y el olfato comienzan a mejorar. Los nervios terminales comienzan a regenerarse.
              </TimelineText>
            </TimelineContent>
          </TimelineItem>

          <TimelineItem>
            <TimelineContent>
              <TimelineTime>1-3 meses</TimelineTime>
              <TimelineText>
                La circulación mejora y la función pulmonar aumenta hasta en un 30%. Disminuye la tos y la fatiga.
              </TimelineText>
            </TimelineContent>
          </TimelineItem>

          <TimelineItem>
            <TimelineContent>
              <TimelineTime>1 año</TimelineTime>
              <TimelineText>El riesgo de enfermedad coronaria se reduce a la mitad del de un fumador.</TimelineText>
            </TimelineContent>
          </TimelineItem>

          <TimelineItem>
            <TimelineContent>
              <TimelineTime>5-15 años</TimelineTime>
              <TimelineText>
                El riesgo de accidente cerebrovascular se reduce al de un no fumador. El riesgo de cáncer disminuye
                significativamente.
              </TimelineText>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      </TimelineSection>
    </EducationContainer>
  )
}

export default EducationSection
