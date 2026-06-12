import type React from "react"
import styled from "styled-components"
import { AppColors } from "../styles/colors"
import Card from "./ui/Card"
import { Link } from "react-router-dom"
import { ArrowRight, Brain, Heart, TreesIcon as Lungs, Thermometer } from "lucide-react"

const EducationContainer = styled.section`
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
    background: radial-gradient(circle at top right, ${AppColors.surface}80, transparent 70%);
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

const SectionSubtitle = styled.p`
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

const EducationGrid = styled.div`
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

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const EducationCard = styled(Card)`
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  border: 1px solid ${AppColors.border};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
    border-color: ${AppColors.primary}30;
  }
`

const CardIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, ${AppColors.primary}20, ${AppColors.tertiary});
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${AppColors.accent};
  margin-bottom: 1rem;
  transition: transform 0.3s ease;

  ${EducationCard}:hover & {
    transform: scale(1.1);
  }
`

const CardTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: ${AppColors.text};
  font-weight: 600;
`

const CardDescription = styled.p`
  color: ${AppColors.textSecondary};
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  flex-grow: 1;
`

const CardLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: ${AppColors.primary};
  transition: all 0.25s ease;

  &:hover {
    gap: 0.7rem;
    color: ${AppColors.accent};
  }
`

const TimelineSection = styled.div`
  max-width: 800px;
  margin: 3rem auto 0;
  position: relative;
  z-index: 1;
  padding: 0 1.5rem;
`

const TimelineTitle = styled.h3`
  text-align: center;
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: ${AppColors.text};
`

const Timeline = styled.div`
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 24px;
    width: 2px;
    background: linear-gradient(to bottom, ${AppColors.primary}40, ${AppColors.primary}08);
  }
`

const TimelineItem = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  padding-left: 52px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 20px;
    left: 17px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: ${AppColors.primary};
    border: 3px solid ${AppColors.cardBackground};
    box-shadow: 0 0 0 3px ${AppColors.primary}30;
    z-index: 1;
  }
`

const TimelineContent = styled.div`
  background-color: ${AppColors.cardBackground};
  border-radius: 10px;
  padding: 1rem 1.25rem;
  border: 1px solid ${AppColors.border};
  transition: all 0.3s ease;
  width: 100%;

  &:hover {
    border-color: ${AppColors.primary}30;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  }
`

const TimelineTime = styled.div`
  font-weight: 700;
  font-size: 0.95rem;
  color: ${AppColors.accent};
  margin-bottom: 0.2rem;
`

const TimelineText = styled.p`
  font-size: 0.875rem;
  color: ${AppColors.textSecondary};
  margin: 0;
`

const EducationSection: React.FC = () => {
  return (
    <EducationContainer id="education">
      <SectionTitle>Educación sobre el Tabaquismo</SectionTitle>
      <SectionSubtitle>
        Conocer los efectos del tabaco en tu cuerpo es el primer paso para tomar decisiones informadas.
      </SectionSubtitle>

      <EducationGrid>
        <EducationCard hoverable>
          <CardIcon><Lungs size={22} /></CardIcon>
          <CardTitle>Sistema Respiratorio</CardTitle>
          <CardDescription>
            El tabaco daña los pulmones y las vías respiratorias, causando EPOC, bronquitis crónica y aumentando el riesgo de infecciones.
          </CardDescription>
          <CardLink to="/education/respiratory">
            Aprender más <ArrowRight size={14} />
          </CardLink>
        </EducationCard>

        <EducationCard hoverable>
          <CardIcon><Heart size={22} /></CardIcon>
          <CardTitle>Sistema Cardiovascular</CardTitle>
          <CardDescription>
            Fumar aumenta la presión arterial, daña los vasos sanguíneos y aumenta el riesgo de enfermedades cardíacas.
          </CardDescription>
          <CardLink to="/education/cardiovascular">
            Aprender más <ArrowRight size={14} />
          </CardLink>
        </EducationCard>

        <EducationCard hoverable>
          <CardIcon><Brain size={22} /></CardIcon>
          <CardTitle>Salud Mental</CardTitle>
          <CardDescription>
            Fumar no reduce el estrés a largo plazo. Está asociado con mayor ansiedad, depresión y otros problemas.
          </CardDescription>
          <CardLink to="/education/mental">
            Aprender más <ArrowRight size={14} />
          </CardLink>
        </EducationCard>

        <EducationCard hoverable>
          <CardIcon><Thermometer size={22} /></CardIcon>
          <CardTitle>Sistema Inmunológico</CardTitle>
          <CardDescription>
            El tabaco debilita el sistema inmunológico, haciendo tu cuerpo más susceptible a infecciones.
          </CardDescription>
          <CardLink to="/education/immune">
            Aprender más <ArrowRight size={14} />
          </CardLink>
        </EducationCard>
      </EducationGrid>

      <TimelineSection>
        <TimelineTitle>Beneficios de Dejar de Fumar</TimelineTitle>
        <Timeline>
          <TimelineItem>
            <TimelineContent>
              <TimelineTime>20 minutos</TimelineTime>
              <TimelineText>Tu presión arterial y frecuencia cardíaca disminuyen.</TimelineText>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineContent>
              <TimelineTime>12 horas</TimelineTime>
              <TimelineText>Los niveles de monóxido de carbono en sangre vuelven a la normalidad.</TimelineText>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineContent>
              <TimelineTime>2-3 días</TimelineTime>
              <TimelineText>Tu sentido del gusto y el olfato comienzan a mejorar.</TimelineText>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineContent>
              <TimelineTime>1-3 meses</TimelineTime>
              <TimelineText>La circulación mejora y la función pulmonar aumenta hasta un 30%.</TimelineText>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineContent>
              <TimelineTime>1 año</TimelineTime>
              <TimelineText>El riesgo de enfermedad coronaria se reduce a la mitad.</TimelineText>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineContent>
              <TimelineTime>5-15 años</TimelineTime>
              <TimelineText>El riesgo de cáncer disminuye significativamente.</TimelineText>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      </TimelineSection>
    </EducationContainer>
  )
}

export default EducationSection