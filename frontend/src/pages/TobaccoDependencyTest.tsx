"use client"

import type React from "react"
import { useState } from "react"
import styled, { keyframes } from "styled-components"
import { AppColors } from "../styles/colors"

// Importar las imágenes
import bajaImage from "../styles/images/baja-dependencia.webp"
import moderadaImage from "../styles/images/dependencia-moderada.webp"
import altaImage from "../styles/images/dependencia-alta.webp"

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

const slideInFromLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
  100% {
    transform: scale(1);
  }
`

const TestContainer = styled.div`
  max-width: 700px;
  width: 90%;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid ${AppColors.secondary};
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  background-color: ${AppColors.cardBackground};
  color: ${AppColors.text};
  animation: ${fadeIn} 0.8s ease-in-out;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 95%;
    padding: 15px;
    margin: 15px auto;
  }

  &::before {
    content: "";
    position: absolute;
    top: -30px;
    left: -30px;
    width: 120px;
    height: 120px;
    background: ${AppColors.primary}20;
    border-radius: 50%;
    z-index: -1;
  }
`

const Title = styled.h2`
  text-align: center;
  color: ${AppColors.text};
  margin-bottom: 10px;
  font-size: 1.8rem;
  font-weight: 700;
  animation: ${slideInFromLeft} 0.8s ease-in-out;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`

const Subtitle = styled.p`
  text-align: center;
  color: ${AppColors.textSecondary};
  font-size: 0.9rem;
  margin-bottom: 15px;
  font-style: italic;
`

const Question = styled.h3`
  color: ${AppColors.text};
  font-weight: 600;
  margin-bottom: 15px;
  text-align: left;
  font-size: 1.1rem;
  line-height: 1.4;
  animation: ${fadeIn} 0.6s ease-in-out;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 12px;
  }
`

const Option = styled.div<{ isSelected: boolean }>`
  color: ${AppColors.text};
  padding: 12px 15px;
  border: 1px solid ${AppColors.secondary};
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  background-color: ${(props) => (props.isSelected ? `${AppColors.accent}20` : AppColors.cardBackground)};

  &:hover {
    background-color: ${AppColors.tertiary}40;
    transform: translateY(-2px);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  }

  &.selected {
    background-color: ${AppColors.accent}40;
    border-color: ${AppColors.accent};
    color: ${AppColors.accent};
    font-weight: 600;
    transform: translateY(-2px);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 10px 12px;
    font-size: 0.95rem;
  }
`

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  background-color: ${AppColors.primary};
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  margin: 0 8px;

  &:hover {
    background-color: ${AppColors.accent};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 0.95rem;
  }
`

const ResultCard = styled.div`
  text-align: center;
  padding: 20px;
  border: 1px solid ${AppColors.secondary};
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  background-color: ${AppColors.cardBackground};
  color: ${AppColors.text};
  animation: ${fadeIn} 0.8s ease-in-out, ${pulse} 2s ease-in-out 1s;
  
  h3 {
    font-size: 1.6rem;
    margin-bottom: 15px;
    color: ${AppColors.accent};
  }
  
  p {
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 15px;
    text-align: justify;
  }
  
  @media (max-width: 768px) {
    padding: 15px;
    
    h3 {
      font-size: 1.4rem;
    }
    
    p {
      font-size: 0.95rem;
    }
  }
`

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: ${AppColors.secondary}40;
  border-radius: 3px;
  margin-bottom: 15px;
  overflow: hidden;
`

const ProgressFill = styled.div<{ width: string }>`
  height: 100%;
  width: ${(props) => props.width};
  background-color: ${AppColors.accent};
  border-radius: 3px;
  transition: width 0.5s ease-in-out;
`

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 8px;
  }
`

const QuestionCounter = styled.div`
  text-align: center;
  margin-bottom: 10px;
  font-size: 0.85rem;
  color: ${AppColors.textSecondary};
`

const ResultImage = styled.img`
  width: 100%;
  max-width: 350px;
  height: auto;
  margin: 20px auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: block;
  animation: ${fadeIn} 0.8s ease-in-out;
  object-fit: cover;
  
  @media (max-width: 768px) {
    max-width: 280px;
  }
`

const ScoreBox = styled.div`
  background-color: ${AppColors.tertiary}40;
  border-left: 4px solid ${AppColors.accent};
  padding: 15px;
  margin: 15px 0;
  border-radius: 6px;
  font-weight: 600;
  color: ${AppColors.text};
`

const AnimatedDiv = styled.div`
  transition: opacity 0.3s ease, transform 0.3s ease;
`

interface QuestionType {
  id: number
  question: string
  options: Array<{
    text: string
    score: number
  }>
}

const fagersstromQuestions: QuestionType[] = [
  {
    id: 1,
    question: "¿Cuánto tiempo después de despertar fuma su primer cigarrillo?",
    options: [
      { text: "Dentro de 5 minutos", score: 3 },
      { text: "De 6 a 30 minutos", score: 2 },
      { text: "De 31 a 60 minutos", score: 1 },
      { text: "Más de 60 minutos", score: 0 },
    ],
  },
  {
    id: 2,
    question: "¿Le resulta difícil abstenerse de fumar en lugares donde está prohibido?",
    options: [
      { text: "Sí, me resulta muy difícil", score: 1 },
      { text: "No, me resulta fácil", score: 0 },
    ],
  },
  {
    id: 3,
    question: "¿Cuál es el cigarrillo que le cuesta más trabajo dejarlo de fumar?",
    options: [
      { text: "El primero después de despertar", score: 1 },
      { text: "Cualquier otro", score: 0 },
    ],
  },
  {
    id: 4,
    question: "¿Cuántos cigarrillos fuma cada día?",
    options: [
      { text: "10 o menos", score: 0 },
      { text: "11-20", score: 1 },
      { text: "21-30", score: 2 },
      { text: "31 o más", score: 3 },
    ],
  },
  {
    id: 5,
    question: "¿Fuma más durante las primeras horas después de despertar que durante el resto del día?",
    options: [
      { text: "Sí", score: 1 },
      { text: "No", score: 0 },
    ],
  },
  {
    id: 6,
    question: "¿Fuma aunque esté enfermo y en la cama la mayor parte del día?",
    options: [
      { text: "Sí", score: 1 },
      { text: "No", score: 0 },
    ],
  },
]

interface Result {
  level: string
  score: number
  description: string
  icon: string
  imagePath: string
}

const getResultInfo = (score: number): Result => {
  if (score <= 3) {
    return {
      level: "Dependencia Baja",
      score,
      description:
        "Su dependencia a la nicotina es baja. Aunque fuma, su patrón sugiere que tiene cierto control sobre el consumo. Con motivación y apoyo adecuado, podría ser más sencillo dejar de fumar. Se recomienda trabajar en estrategias de reducción progresiva.",
      icon: "🟢",
      imagePath: bajaImage,
    }
  } else if (score <= 6) {
    return {
      level: "Dependencia Moderada",
      score,
      description:
        "Su dependencia a la nicotina es moderada. Experimenta síntomas de dependencia significativos y presenta patrones de consumo consolidados. Se recomienda un plan personalizado de reducción con apoyo profesional y posibles intervenciones conductuales.",
      icon: "🟡",
      imagePath: moderadaImage,
    }
  } else {
    return {
      level: "Dependencia Alta",
      score,
      description:
        "Su dependencia a la nicotina es alta. Posiblemente experimenta síntomas de abstinencia severos cuando no fuma. Se recomienda encarecidamente buscar ayuda profesional, incluyendo intervenciones cognitivo-conductuales y apoyo médico especializado.",
      icon: "🔴",
      imagePath: altaImage,
    }
  }
}

const TobaccoDependencyTest: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [result, setResult] = useState<Result | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleAnswerChange = (score: number) => {
    setAnswers((prev) => ({
      ...prev,
      [fagersstromQuestions[currentQuestion].id]: score,
    }))
  }

  const calculateScore = (): number => {
    let totalScore = 0
    for (const score of Object.values(answers)) {
      totalScore += score
    }
    return totalScore
  }

  const handleNext = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentQuestion((prev) => Math.min(prev + 1, fagersstromQuestions.length - 1))
      setIsAnimating(false)
    }, 300)
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentQuestion((prev) => Math.max(prev - 1, 0))
        setIsAnimating(false)
      }, 300)
    }
  }

  const handleSubmit = () => {
    setIsAnimating(true)
    setTimeout(() => {
      const score = calculateScore()
      const resultInfo = getResultInfo(score)
      setResult(resultInfo)
      setIsAnimating(false)
    }, 300)
  }

  const handleReset = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentQuestion(0)
      setAnswers({})
      setResult(null)
      setIsAnimating(false)
    }, 300)
  }

  const renderResult = () => {
    if (result) {
      return (
        <ResultCard>
          <ResultImage src={result.imagePath} alt={result.level} />
          <h3>{result.level}</h3>
          <ScoreBox>Puntuación: {result.score} / 10</ScoreBox>
          <p>{result.description}</p>
          <p style={{ fontSize: "0.9rem", fontStyle: "italic", color: AppColors.textSecondary }}>
            Este test utiliza el <strong>Test de Fagerström para la Dependencia a la Nicotina (FTND)</strong>, el
            instrumento de referencia validado internacionalmente para evaluar la dependencia a la nicotina según:
            <br />
            <strong>0-3 puntos:</strong> Dependencia Baja | <strong>4-6 puntos:</strong> Dependencia Moderada |{" "}
            <strong>7-10 puntos:</strong> Dependencia Alta
          </p>
          <Button onClick={handleReset}>Realizar Test Nuevamente</Button>
        </ResultCard>
      )
    }
    return null
  }

  return (
    <TestContainer>
      {!result ? (
        <>
          <Title>Test de Fagerström</Title>
          <Subtitle>Evaluación validada científicamente de dependencia a la nicotina</Subtitle>
          <ProgressBar>
            <ProgressFill width={`${((currentQuestion + 1) / fagersstromQuestions.length) * 100}%`} />
          </ProgressBar>
          <QuestionCounter>
            Pregunta {currentQuestion + 1} de {fagersstromQuestions.length}
          </QuestionCounter>

          <AnimatedDiv
            style={{
              opacity: isAnimating ? 0.5 : 1,
              transform: isAnimating ? "translateX(-10px)" : "translateX(0)",
            }}
          >
            <Question>{fagersstromQuestions[currentQuestion].question}</Question>
            {fagersstromQuestions[currentQuestion].options.map((option, index) => (
              <Option
                key={index}
                isSelected={answers[fagersstromQuestions[currentQuestion].id] === option.score}
                className={answers[fagersstromQuestions[currentQuestion].id] === option.score ? "selected" : ""}
                onClick={() => handleAnswerChange(option.score)}
              >
                {option.text}
              </Option>
            ))}
          </AnimatedDiv>

          <ButtonContainer>
            {currentQuestion > 0 && (
              <Button onClick={handlePrevious} disabled={isAnimating}>
                Anterior
              </Button>
            )}

            {currentQuestion < fagersstromQuestions.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={answers[fagersstromQuestions[currentQuestion].id] === undefined || isAnimating}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={answers[fagersstromQuestions[currentQuestion].id] === undefined || isAnimating}
              >
                Ver Resultados
              </Button>
            )}
          </ButtonContainer>
        </>
      ) : (
        renderResult()
      )}
    </TestContainer>
  )
}

export default TobaccoDependencyTest