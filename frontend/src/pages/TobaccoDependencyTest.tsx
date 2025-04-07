"use client"

import type React from "react"
import { useState } from "react"
import styled, { keyframes } from "styled-components"
import { AppColors } from "../styles/colors"
import Layout from "../components/layout/Layout"

// Enhanced animations
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

const backgroundAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`

// More compact container with better UX
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
  background-image: linear-gradient(135deg, ${AppColors.cardBackground}, ${AppColors.secondary}40);
  background-size: 300% 300%;
  animation: ${backgroundAnimation} 15s ease infinite;

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

// More compact title
const Title = styled.h2`
  text-align: center;
  color: ${AppColors.text};
  margin-bottom: 15px;
  font-size: 1.8rem;
  font-weight: 700;
  animation: ${slideInFromLeft} 0.8s ease-in-out;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 10px;
  }
`

// More compact question text
const Question = styled.h3`
  color: ${AppColors.text};
  font-weight: 600;
  margin-bottom: 15px;
  text-align: center;
  font-size: 1.3rem;
  line-height: 1.3;
  animation: ${fadeIn} 0.6s ease-in-out;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 12px;
  }
`

// More compact options
const Option = styled.div`
  color: ${AppColors.text};
  padding: 12px 15px;
  border: 1px solid ${AppColors.secondary};
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  
  &:hover {
    background-color: ${AppColors.tertiary};
    transform: translateY(-2px);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  }

  &.selected {
    background-color: ${AppColors.accent};
    border-color: ${AppColors.accent};
    color: white;
    font-weight: 600;
    transform: translateY(-2px);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 10px 12px;
    font-size: 0.95rem;
  }
`

// More compact button
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

// More compact result card
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
    font-size: 1.1rem;
    line-height: 1.5;
    margin-bottom: 20px;
  }
  
  @media (max-width: 768px) {
    padding: 15px;
    
    h3 {
      font-size: 1.4rem;
    }
    
    p {
      font-size: 1rem;
    }
  }
`

// More compact progress indicator
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
  max-width: 300px;
  height: auto;
  border-radius: 8px;
  margin: 15px auto;
  display: block;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
`

const AnimatedDiv = styled.div`
  transition: opacity 0.3s ease, transform 0.3s ease;
`

interface QuestionType {
  id: number
  question: string
  options: string[]
}

const questions: QuestionType[] = [
  {
    id: 1,
    question: "¿Cuántos cigarrillos fumas al día en promedio?",
    options: ["1-5", "6-10", "11-20", "Más de 20"],
  },
  {
    id: 2,
    question: "¿Fumas tu primer cigarrillo en los primeros 5 minutos después de despertarte?",
    options: ["Sí", "No, pero dentro de los primeros 30 minutos", "No, normalmente después de media hora"],
  },
  {
    id: 3,
    question: "¿Cuánto tiempo podrías pasar sin fumar sin sentir incomodidad?",
    options: ["Menos de una hora", "Unas pocas horas", "Todo el día", "Más de un día"],
  },
  {
    id: 4,
    question: "¿Tienes algún momento específico del día en el que sientes mayor deseo de fumar?",
    options: ["Mañana", "Tarde", "Noche", "Durante todo el día"],
  },
  {
    id: 5,
    question:
      "¿Sientes que fumas más en presencia de ciertas personas o en situaciones específicas (como fiestas, trabajo, etc.)?",
    options: ["Sí, mucho más", "Un poco más", "No, no influye"],
  },
  {
    id: 6,
    question: "¿Te resulta difícil rechazar un cigarrillo cuando alguien te ofrece uno?",
    options: ["Sí, siempre acepto", "A veces acepto", "No, puedo decir que no sin problemas"],
  },
  {
    id: 7,
    question: "¿Te molesta estar en lugares donde no puedes fumar (como restaurantes, oficinas, etc.)?",
    options: ["Sí, mucho", "Un poco", "No, puedo manejarlo"],
  },
  {
    id: 8,
    question: "¿Sientes ansiedad, nerviosismo o incomodidad si pasan muchas horas sin fumar?",
    options: ["Sí, mucho", "Solo un poco", "No realmente"],
  },
  {
    id: 9,
    question: "¿Notas algún cambio en tu estado de ánimo o energía cuando fumas?",
    options: ["Sí, me ayuda a sentirme mejor", "Solo a veces noto un cambio", "No noto diferencia"],
  },
  {
    id: 10,
    question: "¿Fumas para lidiar con emociones difíciles o estrés?",
    options: ["Sí, regularmente", "A veces", "No, no lo uso como herramienta emocional"],
  },
  {
    id: 11,
    question: "¿Has intentado dejar de fumar anteriormente?",
    options: [
      "Nunca intenté",
      "Lo intenté con métodos propios (sin ayuda profesional)",
      "Intenté con ayuda profesional (terapia, medicación, etc.)",
    ],
  },
  {
    id: 12,
    question: "¿Estás consciente de los efectos nocivos del tabaco en tu salud?",
    options: ["Sí, totalmente", "Tengo una idea, pero no estoy seguro de todos los detalles", "No realmente"],
  },
  {
    id: 13,
    question: "¿Crees que podrías dejar de fumar fácilmente si te lo propusieras?",
    options: ["Sí, creo que podría", "No estoy seguro", "No, creo que sería muy difícil"],
  },
  {
    id: 14,
    question: "¿Conoces a alguien cercano que haya sufrido consecuencias graves por el tabaquismo?",
    options: ["Sí, y eso me preocupa", "Sí, pero no me afecta tanto", "No, no conozco a nadie"],
  },
]

const TobaccoDependencyTest: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [result, setResult] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleAnswerChange = (answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questions[currentQuestion].id]: answer,
    }))
  }

  const calculateDependency = (): string => {
    let score = 0
    for (const [questionId, answer] of Object.entries(answers)) {
      if (
        [
          "Sí",
          "Más de 20",
          "Menos de una hora",
          "Durante todo el día",
          "Sí, mucho",
          "Sí, siempre acepto",
          "Sí, regularmente",
        ].includes(answer)
      ) {
        score += 3
      } else if (
        ["6-10", "Un poco más", "A veces acepto", "Unas pocas horas", "Solo un poco", "A veces"].includes(answer)
      ) {
        score += 2
      } else if (
        ["1-5", "No, pero dentro de los primeros 30 minutos", "No, normalmente después de media hora"].includes(answer)
      ) {
        score += 1
      }
    }

    if (score <= 10) return "Baja Dependencia"
    if (score <= 20) return "Dependencia Moderada"
    if (score <= 30) return "Alta Dependencia"
    return "Dependencia Muy Alta"
  }

  const handleNext = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentQuestion((prev) => Math.min(prev + 1, questions.length - 1))
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
      const dependencyLevel = calculateDependency()
      setResult(dependencyLevel)
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

  // Fix image paths with require to ensure proper loading
  const getResultImage = (result: string) => {
    try {
      switch (result) {
        case "Baja Dependencia":
          return require("../styles/images/baja-dependencia.webp")
        case "Dependencia Moderada":
          return require("../styles/images/dependencia-moderada.webp")
        case "Alta Dependencia":
          return require("../styles/images/alta-dependencia.webp")
        case "Dependencia Muy Alta":
          return require("../styles/images/dependencia-muy-alta.webp")
        default:
          return require("../styles/images/baja-dependencia.webp")
      }
    } catch (error) {
      console.error("Error loading image:", error)
      // Fallback to a simple colored div if image fails to load
      return null
    }
  }

  const renderResult = () => {
    const messages: Record<string, string> = {
      "Baja Dependencia":
        "Parece que tu consumo de tabaco es relativamente bajo. Aunque es positivo, ten en cuenta que cualquier nivel de consumo implica riesgos a largo plazo.",
      "Dependencia Moderada":
        "Tu consumo muestra signos de dependencia moderada. Quizás sientes que fumar es parte de ciertos momentos de tu día o te ayuda en situaciones específicas.",
      "Alta Dependencia":
        "Tu consumo de tabaco indica una dependencia alta. Es posible que el tabaco sea una herramienta para lidiar con situaciones emocionales o estrés.",
      "Dependencia Muy Alta":
        "Parece que el tabaco es una parte esencial en tu rutina diaria, lo cual representa un alto riesgo para tu salud.",
    }

    if (result) {
      const resultImage = getResultImage(result)

      return (
        <ResultCard>
          <h3>Tu resultado: {result}</h3>

          {resultImage ? (
            <ResultImage src={resultImage} alt={result} />
          ) : (
            // Fallback colored div if image fails to load
            <div
              style={{
                width: "100%",
                maxWidth: "300px",
                height: "150px",
                margin: "15px auto",
                borderRadius: "8px",
                background:
                  result === "Baja Dependencia"
                    ? AppColors.primary
                    : result === "Dependencia Moderada"
                      ? AppColors.secondary
                      : result === "Alta Dependencia"
                        ? AppColors.accent
                        : AppColors.error,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
              }}
            >
              {result}
            </div>
          )}

          <p>{messages[result]}</p>
          <Button onClick={handleReset}>Volver a Realizar el Test</Button>
        </ResultCard>
      )
    }
    return null
  }

  return (
    <Layout>
      <TestContainer>
        {!result ? (
          <>
            <Title>Test de Dependencia al Tabaco</Title>
            <ProgressBar>
              <ProgressFill width={`${((currentQuestion + 1) / questions.length) * 100}%`} />
            </ProgressBar>
            <QuestionCounter>
              Pregunta {currentQuestion + 1} de {questions.length}
            </QuestionCounter>

            <AnimatedDiv
              style={{
                opacity: isAnimating ? 0.5 : 1,
                transform: isAnimating ? "translateX(-10px)" : "translateX(0)",
              }}
            >
              <Question>{questions[currentQuestion].question}</Question>
              {questions[currentQuestion].options.map((option, index) => (
                <Option
                  key={index}
                  className={answers[questions[currentQuestion].id] === option ? "selected" : ""}
                  onClick={() => handleAnswerChange(option)}
                >
                  {option}
                </Option>
              ))}
            </AnimatedDiv>

            <ButtonContainer>
              {currentQuestion > 0 && (
                <Button onClick={handlePrevious} disabled={isAnimating}>
                  Anterior
                </Button>
              )}

              {currentQuestion < questions.length - 1 ? (
                <Button onClick={handleNext} disabled={!answers[questions[currentQuestion].id] || isAnimating}>
                  Siguiente
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!answers[questions[currentQuestion].id] || isAnimating}>
                  Evaluar Resultados
                </Button>
              )}
            </ButtonContainer>
          </>
        ) : (
          renderResult()
        )}
      </TestContainer>
    </Layout>
  )
}

export default TobaccoDependencyTest

