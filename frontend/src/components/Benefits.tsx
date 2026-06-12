import type React from "react"
import styled, { keyframes } from "styled-components"
import { AppColors } from "../styles/colors"
import { Heart, DollarSign, Brain, Smile, Clock, Users, Zap, Leaf } from "lucide-react"

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`

const BenefitsSection = styled.section`
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
    background: radial-gradient(circle at bottom right, ${AppColors.surface}, transparent 70%);
    z-index: 0;
  }
`

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  position: relative;
  z-index: 1;
`

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`

const SectionTitle = styled.h2`
  font-size: 2rem;
  color: ${AppColors.text};
  margin-bottom: 0.75rem;

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

const SectionDescription = styled.p`
  font-size: 1.05rem;
  max-width: 700px;
  margin: 0 auto;
  color: ${AppColors.textSecondary};
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`

const BenefitsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`

const BenefitCard = styled.div`
  background-color: ${AppColors.cardBackground};
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid ${AppColors.border};
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.8s ease-out both;
  display: flex;
  flex-direction: column;

  &:nth-child(1) { animation-delay: 0.05s; }
  &:nth-child(2) { animation-delay: 0.1s; }
  &:nth-child(3) { animation-delay: 0.15s; }
  &:nth-child(4) { animation-delay: 0.2s; }
  &:nth-child(5) { animation-delay: 0.25s; }
  &:nth-child(6) { animation-delay: 0.3s; }
  &:nth-child(7) { animation-delay: 0.35s; }
  &:nth-child(8) { animation-delay: 0.4s; }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
    border-color: ${AppColors.primary}30;
  }
`

const BenefitIcon = styled.div`
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

  ${BenefitCard}:hover & {
    transform: scale(1.1);
  }
`

const BenefitTitle = styled.h3`
  font-size: 1.05rem;
  margin-bottom: 0.5rem;
  color: ${AppColors.text};
  font-weight: 600;
`

const BenefitDescription = styled.p`
  color: ${AppColors.textSecondary};
  font-size: 0.875rem;
  line-height: 1.5;
  flex-grow: 1;
  margin: 0;
`

const TimelineContainer = styled.div`
  margin-top: 3rem;
`

const TimelineTitle = styled.h3`
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 2rem;
  color: ${AppColors.text};
`

const Timeline = styled.div`
  position: relative;
  max-width: 800px;
  margin: 0 auto;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    height: 100%;
    background: linear-gradient(to bottom, ${AppColors.primary}40, ${AppColors.primary}10);

    @media (max-width: 768px) {
      left: 24px;
    }
  }
`

const TimelineItem = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-right: calc(50% + 30px);
  position: relative;
  margin-bottom: 2rem;

  &:nth-child(even) {
    align-self: flex-end;
    justify-content: flex-start;
    padding-right: 0;
    padding-left: calc(50% + 30px);
  }

  &::before {
    content: '';
    position: absolute;
    top: 20px;
    right: -6px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: ${AppColors.primary};
    border: 3px solid ${AppColors.cardBackground};
    box-shadow: 0 0 0 3px ${AppColors.primary}30;
    z-index: 1;
  }

  &:nth-child(even)::before {
    right: auto;
    left: -6px;
  }

  @media (max-width: 768px) {
    width: 100%;
    padding-right: 0;
    padding-left: 48px;
    justify-content: flex-start;

    &:nth-child(even) {
      padding-left: 48px;
    }

    &::before, &:nth-child(even)::before {
      left: 17px;
      right: auto;
    }
  }
`

const TimelineContent = styled.div`
  background-color: ${AppColors.cardBackground};
  border-radius: 10px;
  padding: 1.25rem;
  border: 1px solid ${AppColors.border};
  transition: all 0.3s ease;
  width: 100%;

  &:hover {
    border-color: ${AppColors.primary}30;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  }
`

const TimelineTime = styled.h4`
  font-size: 1rem;
  margin-bottom: 0.25rem;
  color: ${AppColors.accent};
  font-weight: 700;
`

const TimelineText = styled.p`
  font-size: 0.9rem;
  color: ${AppColors.textSecondary};
  line-height: 1.5;
  margin: 0;
`

const Benefits: React.FC = () => {
  return (
    <BenefitsSection id="benefits">
      <Container>
        <SectionHeader>
          <SectionTitle>Beneficios de Dejar de Fumar</SectionTitle>
          <SectionDescription>
            Dejar de fumar es una de las mejores decisiones que puedes tomar para tu salud. Descubre los numerosos
            beneficios que experimentarás desde el primer día.
          </SectionDescription>
        </SectionHeader>

        <BenefitsGrid>
          <BenefitCard>
            <BenefitIcon><Heart size={22} /></BenefitIcon>
            <BenefitTitle>Salud Cardiovascular</BenefitTitle>
            <BenefitDescription>
              Reduce el riesgo de enfermedades cardíacas, normaliza la presión arterial y mejora la circulación.
            </BenefitDescription>
          </BenefitCard>

          <BenefitCard>
            <BenefitIcon><DollarSign size={22} /></BenefitIcon>
            <BenefitTitle>Ahorro Económico</BenefitTitle>
            <BenefitDescription>
              Ahorra miles al año que antes gastabas en cigarrillos y reduce gastos médicos.
            </BenefitDescription>
          </BenefitCard>

          <BenefitCard>
            <BenefitIcon><Brain size={22} /></BenefitIcon>
            <BenefitTitle>Claridad Mental</BenefitTitle>
            <BenefitDescription>
              Mejora la concentración, la memoria y la capacidad cognitiva al eliminar la nicotina.
            </BenefitDescription>
          </BenefitCard>

          <BenefitCard>
            <BenefitIcon><Smile size={22} /></BenefitIcon>
            <BenefitTitle>Mejor Apariencia</BenefitTitle>
            <BenefitDescription>
              Piel más saludable, dientes más blancos y aliento fresco sin olor a tabaco.
            </BenefitDescription>
          </BenefitCard>

          <BenefitCard>
            <BenefitIcon><Clock size={22} /></BenefitIcon>
            <BenefitTitle>Mayor Longevidad</BenefitTitle>
            <BenefitDescription>
              Aumenta tu esperanza de vida al reducir el riesgo de enfermedades mortales.
            </BenefitDescription>
          </BenefitCard>

          <BenefitCard>
            <BenefitIcon><Users size={22} /></BenefitIcon>
            <BenefitTitle>Mejores Relaciones</BenefitTitle>
            <BenefitDescription>
              Protege a tus seres queridos del humo de segunda mano.
            </BenefitDescription>
          </BenefitCard>

          <BenefitCard>
            <BenefitIcon><Zap size={22} /></BenefitIcon>
            <BenefitTitle>Más Energía</BenefitTitle>
            <BenefitDescription>
              Mayor resistencia física al mejorar la capacidad pulmonar y oxigenación.
            </BenefitDescription>
          </BenefitCard>

          <BenefitCard>
            <BenefitIcon><Leaf size={22} /></BenefitIcon>
            <BenefitTitle>Sentidos Mejorados</BenefitTitle>
            <BenefitDescription>
              Recupera tu sentido del gusto y del olfato.
            </BenefitDescription>
          </BenefitCard>
        </BenefitsGrid>

        <TimelineContainer>
          <TimelineTitle>Cronología de Beneficios</TimelineTitle>
          <Timeline>
            <TimelineItem>
              <TimelineContent>
                <TimelineTime>20 minutos</TimelineTime>
                <TimelineText>Tu presión arterial y frecuencia cardíaca comienzan a normalizarse.</TimelineText>
              </TimelineContent>
            </TimelineItem>

            <TimelineItem>
              <TimelineContent>
                <TimelineTime>24 horas</TimelineTime>
                <TimelineText>El monóxido de carbono es eliminado de tu cuerpo.</TimelineText>
              </TimelineContent>
            </TimelineItem>

            <TimelineItem>
              <TimelineContent>
                <TimelineTime>48 horas</TimelineTime>
                <TimelineText>Tu sentido del gusto y del olfato comienzan a mejorar.</TimelineText>
              </TimelineContent>
            </TimelineItem>

            <TimelineItem>
              <TimelineContent>
                <TimelineTime>2-3 semanas</TimelineTime>
                <TimelineText>La función pulmonar aumenta hasta un 30%.</TimelineText>
              </TimelineContent>
            </TimelineItem>

            <TimelineItem>
              <TimelineContent>
                <TimelineTime>1-9 meses</TimelineTime>
                <TimelineText>Los cilios pulmonares se regeneran, reduciendo la tos.</TimelineText>
              </TimelineContent>
            </TimelineItem>

            <TimelineItem>
              <TimelineContent>
                <TimelineTime>1 año</TimelineTime>
                <TimelineText>El riesgo de enfermedad coronaria se reduce a la mitad.</TimelineText>
              </TimelineContent>
            </TimelineItem>
          </Timeline>
        </TimelineContainer>
      </Container>
    </BenefitsSection>
  )
}

export default Benefits