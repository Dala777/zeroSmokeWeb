"use client"

import type React from "react"
import { useState } from "react"
import styled, { keyframes } from "styled-components"
import { AppColors } from "../styles/colors"
import { progressAPI } from "../services/api"
import { ChevronLeft, ChevronRight, RotateCcw, Save, Activity } from "lucide-react"

import bajaImage from "../styles/images/baja-dependencia.webp"
import moderadaImage from "../styles/images/dependencia-moderada.webp"
import altaImage from "../styles/images/dependencia-alta.webp"

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
`

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`

const TestContainer = styled.div`
  max-width: 640px;
  width: 92%;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  background-color: ${AppColors.cardBackground};
  border: 1px solid ${AppColors.border};
  animation: ${fadeIn} 0.5s ease-in-out;
  position: relative;

  @media (max-width: 768px) {
    width: 95%;
    padding: 1.5rem;
    margin: 1rem auto;
  }
`

const Title = styled.h2`
  text-align: center;
  color: ${AppColors.text};
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`

const Subtitle = styled.p`
  text-align: center;
  color: ${AppColors.textSecondary};
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
`

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: ${AppColors.surface};
  border-radius: 3px;
  margin-bottom: 0.75rem;
  overflow: hidden;
`

const ProgressFill = styled.div<{ $width: string }>`
  height: 100%;
  width: ${(props) => props.$width};
  background: linear-gradient(90deg, ${AppColors.primary}, ${AppColors.accent});
  border-radius: 3px;
  transition: width 0.5s ease-in-out;
`

const QuestionCounter = styled.div`
  text-align: center;
  margin-bottom: 1.25rem;
  font-size: 0.8rem;
  color: ${AppColors.textLight};
  font-weight: 500;
`

const Question = styled.h3`
  color: ${AppColors.text};
  font-weight: 600;
  margin-bottom: 1.25rem;
  text-align: left;
  font-size: 1.05rem;
  line-height: 1.5;
  animation: ${slideIn} 0.4s ease-in-out;

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`

const Option = styled.div<{ $isSelected: boolean }>`
  color: ${AppColors.text};
  padding: 0.875rem 1rem;
  border: 1.5px solid ${(props) => (props.$isSelected ? AppColors.primary : AppColors.border)};
  border-radius: 10px;
  margin-bottom: 0.625rem;
  cursor: pointer;
  transition: all 0.25s ease;
  font-size: 0.95rem;
  background-color: ${(props) => (props.$isSelected ? `${AppColors.primary}10` : AppColors.cardBackground)};

  &:hover {
    border-color: ${AppColors.primary}50;
    background-color: ${AppColors.primary}08;
    transform: translateX(4px);
  }

  @media (max-width: 768px) {
    padding: 0.75rem 0.875rem;
    font-size: 0.9rem;
  }
`

const StyledButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, ${AppColors.primary}, ${AppColors.accent});
  color: white;
  font-weight: 600;
  font-size: 0.925rem;
  cursor: pointer;
  transition: all 0.25s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    box-shadow: 0 4px 12px ${AppColors.primary}40;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`

const GhostButton = styled(StyledButton)`
  background: transparent;
  color: ${AppColors.textSecondary};
  box-shadow: none;

  &:hover:not(:disabled) {
    background-color: ${AppColors.surface};
    box-shadow: none;
    transform: none;
  }
`

const ResultCard = styled.div`
  text-align: center;
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid ${AppColors.border};
  background-color: ${AppColors.cardBackground};
  animation: ${fadeIn} 0.6s ease-in-out, ${pulse} 2s ease-in-out 1s;

  h3 {
    font-size: 1.4rem;
    margin-bottom: 1rem;
    color: ${AppColors.accent};
  }

  p {
    font-size: 0.95rem;
    line-height: 1.7;
    margin-bottom: 1rem;
    color: ${AppColors.textSecondary};
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    h3 { font-size: 1.2rem; }
  }
`

const ResultImage = styled.img`
  width: 100%;
  max-width: 300px;
  height: auto;
  margin: 0 auto 1.5rem;
  border-radius: 12px;
  display: block;
  animation: ${fadeIn} 0.6s ease-in-out;
  object-fit: cover;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`

const ScoreBox = styled.div`
  background: linear-gradient(135deg, ${AppColors.primary}15, ${AppColors.tertiary});
  border-left: 3px solid ${AppColors.accent};
  padding: 1rem 1.25rem;
  margin: 1rem 0;
  border-radius: 8px;
  font-weight: 600;
  color: ${AppColors.accent};
  font-size: 1.1rem;
`

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
`

const SaveSection = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: ${AppColors.surface};
  border-radius: 8px;
  text-align: left;

  label {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: ${AppColors.textSecondary};

    input {
      margin-left: 0.5rem;
      padding: 0.4rem 0.5rem;
      border: 1px solid ${AppColors.border};
      border-radius: 4px;
      width: 70px;
      font-size: 0.875rem;
    }
  }
`

const StatusText = styled.p`
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: ${AppColors.textSecondary};
`

interface QuestionType {
  id: number
  question: string
  options: Array<{ text: string; score: number }>
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
  imagePath: string
}

const getResultInfo = (score: number): Result => {
  if (score <= 3) {
    return {
      level: "Dependencia Baja",
      score,
      description:
        "Su dependencia a la nicotina es baja. Aunque fuma, su patrón sugiere que tiene cierto control sobre el consumo. Con motivación y apoyo adecuado, podría ser más sencillo dejar de fumar. Se recomienda trabajar en estrategias de reducción progresiva.",
      imagePath: bajaImage,
    }
  } else if (score <= 6) {
    return {
      level: "Dependencia Moderada",
      score,
      description:
        "Su dependencia a la nicotina es moderada. Experimenta síntomas de dependencia significativos. Se recomienda un plan personalizado de reducción con apoyo profesional y posibles intervenciones conductuales.",
      imagePath: moderadaImage,
    }
  } else {
    return {
      level: "Dependencia Alta",
      score,
      description:
        "Su dependencia a la nicotina es alta. Posiblemente experimenta síntomas de abstinencia severos. Se recomienda buscar ayuda profesional, incluyendo intervenciones cognitivo-conductuales y apoyo médico especializado.",
      imagePath: altaImage,
    }
  }
}

const TobaccoDependencyTest: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [result, setResult] = useState<Result | null>(null)
  const [packagePrice, setPackagePrice] = useState<number>(0)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleAnswerChange = (score: number) => {
    setAnswers((prev) => ({
      ...prev,
      [fagersstromQuestions[currentQuestion].id]: score,
    }))
  }

  const calculateScore = (): number => {
    return Object.values(answers).reduce((sum, score) => sum + score, 0)
  }

  const handleNext = () => {
    setCurrentQuestion((prev) => Math.min(prev + 1, fagersstromQuestions.length - 1))
  }

  const handlePrevious = () => {
    setCurrentQuestion((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = () => {
    const score = calculateScore()
    setResult(getResultInfo(score))
  }

  const handleReset = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setResult(null)
  }

  const deriveCigarettesPerDay = (): number => {
    const score = answers[4]
    switch (score) {
      case 0: return 10
      case 1: return 15
      case 2: return 25
      case 3: return 35
      default: return 0
    }
  }

  const handleSaveResult = async () => {
    if (!result) return
    const token = localStorage.getItem("token")
    if (!token) {
      setSaveStatus("Por favor, inicia sesión o regístrate para guardar tu resultado")
      setTimeout(() => { window.location.href = "/login" }, 2000)
      return
    }

    setIsSaving(true)
    setSaveStatus(null)
    const data = {
      cigarettesPerDay: deriveCigarettesPerDay(),
      packagePrice,
      dependencyLevel: result.level,
      fagerstromScore: result.score,
    }
    try {
      await progressAPI.saveInitialTest(data)
      setSaveStatus("Resultado guardado correctamente")
    } catch (err: any) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes("Ya existe")) {
        try {
          await progressAPI.updateUserProgress({
            dependencyLevel: result.level,
            fagerstromScore: result.score,
          })
          setSaveStatus("Resultado actualizado correctamente")
        } catch {
          setSaveStatus("No se pudo actualizar el resultado")
        }
      } else if (err.response?.status === 401) {
        setSaveStatus("Por favor, inicia sesión o regístrate para guardar tu resultado")
      } else {
        setSaveStatus(err.response?.data?.message || "Error al guardar el resultado")
      }
    } finally {
      setIsSaving(false)
    }
  }

  const renderResult = () => {
    if (!result) return null
    return (
      <ResultCard>
        <ResultImage src={result.imagePath} alt={result.level} />
        <h3>{result.level}</h3>
        <ScoreBox>Puntuación: {result.score} / 10</ScoreBox>
        <p>{result.description}</p>
        <p style={{ fontSize: "0.85rem", fontStyle: "italic", color: AppColors.textLight }}>
          Test de Fagerström para la Dependencia a la Nicotina (FTND).
          <br />
          <strong>0-3:</strong> Baja | <strong>4-6:</strong> Moderada | <strong>7-10:</strong> Alta
        </p>

        <SaveSection>
          <label>
            Cigarrillos por día (estimado):
            <input type="number" value={deriveCigarettesPerDay()} readOnly />
          </label>
          <label>
            Precio aproximado del paquete:
            <input type="number" value={packagePrice} onChange={(e) => setPackagePrice(Number(e.target.value))} />
          </label>
        </SaveSection>

        <ButtonContainer>
          <StyledButton onClick={handleSaveResult} disabled={isSaving}>
            <Save size={16} />
            {isSaving ? "Guardando..." : "Guardar Resultado"}
          </StyledButton>
          <GhostButton onClick={handleReset}>
            <RotateCcw size={16} />
            Realizar Test Nuevamente
          </GhostButton>
        </ButtonContainer>

        {saveStatus && (
          <StatusText>
            {saveStatus}
            {saveStatus.toLowerCase().includes("inicia sesión") && (
              <a href="/login" style={{ textDecoration: "underline", color: AppColors.accent, marginLeft: "0.5rem" }}>
                Iniciar sesión
              </a>
            )}
          </StatusText>
        )}
      </ResultCard>
    )
  }

  return (
    <TestContainer>
      {!result ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center", marginBottom: "0.5rem" }}>
            <Activity size={24} color={AppColors.primary} />
            <Title>Test de Fagerström</Title>
          </div>
          <Subtitle>Evaluación validada científicamente de dependencia a la nicotina</Subtitle>

          <ProgressBar>
            <ProgressFill $width={`${((currentQuestion + 1) / fagersstromQuestions.length) * 100}%`} />
          </ProgressBar>
          <QuestionCounter>
            Pregunta {currentQuestion + 1} de {fagersstromQuestions.length}
          </QuestionCounter>

          <Question key={currentQuestion}>{fagersstromQuestions[currentQuestion].question}</Question>

          {fagersstromQuestions[currentQuestion].options.map((option, index) => (
            <Option
              key={index}
              $isSelected={answers[fagersstromQuestions[currentQuestion].id] === option.score}
              onClick={() => handleAnswerChange(option.score)}
            >
              {option.text}
            </Option>
          ))}

          <ButtonContainer>
            {currentQuestion > 0 && (
              <GhostButton onClick={handlePrevious}>
                <ChevronLeft size={18} />
                Anterior
              </GhostButton>
            )}

            {currentQuestion < fagersstromQuestions.length - 1 ? (
              <StyledButton
                onClick={handleNext}
                disabled={answers[fagersstromQuestions[currentQuestion].id] === undefined}
              >
                Siguiente
                <ChevronRight size={18} />
              </StyledButton>
            ) : (
              <StyledButton
                onClick={handleSubmit}
                disabled={answers[fagersstromQuestions[currentQuestion].id] === undefined}
              >
                Ver Resultados
                <ChevronRight size={18} />
              </StyledButton>
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