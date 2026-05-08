import type React from "react"
import styled, { keyframes } from "styled-components"
import { AppColors } from "../styles/colors"
import { Heart, DollarSign, Brain, Smile, Clock, Users, Zap, Leaf } from "lucide-react"

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

const BenefitsSection = styled.section`
  padding: 5rem 0;
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
    background: radial-gradient(circle at center right, ${AppColors.cardBackground}40, transparent 70%);
    z-index: 0;
  }
`

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
`

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  color: ${AppColors.primary};
  margin-bottom: 1rem;
  
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

const SectionDescription = styled.p`
  font-size: 1.1rem;
  max-width: 800px;
  margin: 0 auto;
  color: ${AppColors.text};
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`

// Mejoramos el grid para asegurar 4 elementos por fila en pantallas grandes,
// 2 en tablets y 1 en móviles
const BenefitsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  
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
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: ${fadeIn} 0.8s ease-out both;
  height: 100%;
  display: flex;
  flex-direction: column;
  
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
  
  &:nth-child(5) {
    animation-delay: 0.5s;
  }
  
  &:nth-child(6) {
    animation-delay: 0.6s;
  }
  
  &:nth-child(7) {
    animation-delay: 0.7s;
  }
  
  &:nth-child(8) {
    animation-delay: 0.8s;
  }
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
  }
`

const BenefitIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${AppColors.primary}20;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${AppColors.primary};
  margin-bottom: 1.2rem;
`

const BenefitTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 0.8rem;
  color: ${AppColors.textSecondary};
`

const BenefitDescription = styled.p`
  color: ${AppColors.text};
  font-size: 0.95rem;
  line-height: 1.5;
  flex-grow: 1;
`

const TimelineContainer = styled.div`
  margin-top: 4rem;
`

const TimelineTitle = styled.h3`
  font-size: 1.8rem;
  text-align: center;
  margin-bottom: 2rem;
  color: ${AppColors.textSecondary};
`

const Timeline = styled.div`
  position: relative;
  max-width: 900px;
  margin: 0 auto;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 100%;
    background-color: ${AppColors.primary}30;
    
    @media (max-width: 768px) {
      left: 30px;
    }
  }
`

const TimelineItem = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-right: 30px;
  position: relative;
  margin-bottom: 2.5rem;
  width: 50%;
  
  &:nth-child(even) {
    align-self: flex-end;
    justify-content: flex-start;
    padding-right: 0;
    padding-left: 30px;
    left: 50%;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 15px;
    right: -13px;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background-color: ${AppColors.primary};
    z-index: 1;
  }
  
  &:nth-child(even)::before {
    right: auto;
    left: -13px;
  }
  
  @media (max-width: 768px) {
    width: calc(100% - 60px);
    padding-right: 0;
    padding-left: 60px;
    left: 0;
    
    &:nth-child(even) {
      left: 0;
      padding-left: 60px;
    }
    
    &::before {
      left: 17px;
      right: auto;
    }
    
    &:nth-child(even)::before {
      left: 17px;
    }
  }
`

const TimelineContent = styled.div`
  background-color: ${AppColors.cardBackground};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  animation: ${fadeIn} 0.8s ease-out both;
`

const TimelineTime = styled.h4`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: ${AppColors.primary};
`

const TimelineText = styled.p`
  font-size: 0.95rem;
  color: ${AppColors.text};
  line-height: 1.5;
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
            <BenefitIcon>
              <Heart size={28} />
            </BenefitIcon>
            <BenefitTitle>Salud Cardiovascular</BenefitTitle>
            <BenefitDescription>
              Reduce significativamente el riesgo de enfermedades cardíacas, normaliza la presión arterial y mejora la
              circulación sanguínea.
            </BenefitDescription>
          </BenefitCard>

          <BenefitCard>
            <BenefitIcon>
              <DollarSign size={28} />
            </BenefitIcon>
            <BenefitTitle>Ahorro Económico</BenefitTitle>
            <BenefitDescription>
              Ahorra miles de pesos al año que antes gastabas en cigarrillos y reduce los gastos médicos asociados al
              tabaquismo.
            </BenefitDescription>
          </BenefitCard>

          <BenefitCard>
            <BenefitIcon>
              <Brain size={28} />
            </BenefitIcon>
            <BenefitTitle>Claridad Mental</BenefitTitle>
            <BenefitDescription>
              Mejora la concentración, la memoria y la capacidad cognitiva al eliminar los efectos negativos de la
              nicotina en el cerebro.
            </BenefitDescription>
          </BenefitCard>

          <BenefitCard>
            <BenefitIcon>
              <Smile size={28} />
            </BenefitIcon>
            <BenefitTitle>Mejor Apariencia</BenefitTitle>
            <BenefitDescription>
              Disfruta de una piel más saludable, dientes más blancos, cabello más fuerte y un aliento fresco sin el
              olor a tabaco.
            </BenefitDescription>
          </BenefitCard>

          <BenefitCard>
            <BenefitIcon>
              <Clock size={28} />
            </BenefitIcon>
            <BenefitTitle>Mayor Longevidad</BenefitTitle>
            <BenefitDescription>
              Aumenta tu esperanza de vida al reducir el riesgo de enfermedades mortales asociadas con el tabaquismo.
            </BenefitDescription>
          </BenefitCard>

          <BenefitCard>
            <BenefitIcon>
              <Users size={28} />
            </BenefitIcon>
            <BenefitTitle>Mejores Relaciones</BenefitTitle>
            <BenefitDescription>
              Protege a tus seres queridos del humo de segunda mano y mejora tus relaciones sociales sin las
              interrupciones para fumar.
            </BenefitDescription>
          </BenefitCard>

          <BenefitCard>
            <BenefitIcon>
              <Zap size={28} />
            </BenefitIcon>
            <BenefitTitle>Más Energía</BenefitTitle>
            <BenefitDescription>
              Experimenta niveles de energía más altos y mejor resistencia física al mejorar la capacidad pulmonar y la
              oxigenación.
            </BenefitDescription>
          </BenefitCard>

          <BenefitCard>
            <BenefitIcon>
              <Leaf size={28} />
            </BenefitIcon>
            <BenefitTitle>Sentidos Mejorados</BenefitTitle>
            <BenefitDescription>
              Recupera tu sentido del gusto y del olfato, permitiéndote disfrutar más de los alimentos y los aromas.
            </BenefitDescription>
          </BenefitCard>
        </BenefitsGrid>

        <TimelineContainer>
          <TimelineTitle>Cronología de Beneficios</TimelineTitle>
          <Timeline>
            <TimelineItem>
              <TimelineContent>
                <TimelineTime>20 minutos</TimelineTime>
                <TimelineText>
                  Tu presión arterial y frecuencia cardíaca comienzan a normalizarse, mejorando la circulación.
                </TimelineText>
              </TimelineContent>
            </TimelineItem>

            <TimelineItem>
              <TimelineContent>
                <TimelineTime>24 horas</TimelineTime>
                <TimelineText>
                  El monóxido de carbono es eliminado de tu cuerpo, permitiendo que tus pulmones funcionen mejor.
                </TimelineText>
              </TimelineContent>
            </TimelineItem>

            <TimelineItem>
              <TimelineContent>
                <TimelineTime>48 horas</TimelineTime>
                <TimelineText>
                  Tu sentido del gusto y del olfato comienzan a mejorar, y los terminales nerviosos empiezan a
                  regenerarse.
                </TimelineText>
              </TimelineContent>
            </TimelineItem>

            <TimelineItem>
              <TimelineContent>
                <TimelineTime>2-3 semanas</TimelineTime>
                <TimelineText>
                  Tu sistema circulatorio mejora y la función pulmonar aumenta hasta un 30%, facilitando la actividad
                  física.
                </TimelineText>
              </TimelineContent>
            </TimelineItem>

            <TimelineItem>
              <TimelineContent>
                <TimelineTime>1-9 meses</TimelineTime>
                <TimelineText>
                  Los cilios pulmonares se regeneran, reduciendo la tos, la congestión y el riesgo de infecciones.
                </TimelineText>
              </TimelineContent>
            </TimelineItem>

            <TimelineItem>
              <TimelineContent>
                <TimelineTime>1 año</TimelineTime>
                <TimelineText>
                  El riesgo de enfermedad coronaria se reduce a la mitad en comparación con un fumador activo.
                </TimelineText>
              </TimelineContent>
            </TimelineItem>
          </Timeline>
        </TimelineContainer>
      </Container>
    </BenefitsSection>
  )
}

export default Benefits
