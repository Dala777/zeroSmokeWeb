"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import styled from "styled-components"
import { AppColors } from "../styles/colors"
import Button from "./ui/Button"
import Input from "./ui/Input"

// Importar el contexto del chatbot
import { useChatbot } from "./ChatbotContext"

const ChatbotContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
`

const ChatbotButton = styled.button`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${AppColors.primary};
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  &:hover {
    background-color: ${AppColors.tertiary};
    transform: scale(1.05);
  }
`

const ChatWindow = styled.div`
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 350px;
  height: 500px;
  background-color: ${AppColors.cardBackground};
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const ChatHeader = styled.div`
  background-color: ${AppColors.primary};
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const ChatTitle = styled.h3`
  margin: 0;
  font-size: 1.125rem;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
`

const ChatMessages = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const Message = styled.div<{ isUser: boolean }>`
  max-width: 80%;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background-color: ${(props) => (props.isUser ? AppColors.primary : "rgba(255, 255, 255, 0.1)")};
  color: ${(props) => (props.isUser ? "white" : AppColors.text)};
  align-self: ${(props) => (props.isUser ? "flex-end" : "flex-start")};
`

const ChatInputContainer = styled.div`
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 0.5rem;
`

const SuggestedQuestions = styled.div`
  padding: 0 1rem 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`

const SuggestedQuestion = styled.button`
  background-color: rgba(255, 255, 255, 0.1);
  color: ${AppColors.text};
  border: none;
  border-radius: 16px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`

interface ChatMessage {
  text: string
  isUser: boolean
}

// Reemplazar la definición del componente Chatbot para usar el contexto
const Chatbot: React.FC = () => {
  const { isOpen, messages, toggleChat, addMessage } = useChatbot()
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Preguntas sugeridas
  const suggestedQuestions = [
    "¿Cómo puedo dejar de fumar?",
    "¿Cuáles son los beneficios?",
    "¿Qué es el síndrome de abstinencia?",
    "¿Cómo manejar la ansiedad?",
    "¿Qué hacer si tengo una recaída?",
    "¿Cómo funciona la app?",
  ]

  // Respuestas predefinidas con más opciones y mejor detección
  const responses: Record<string, string[]> = {
    hola: [
      "¡Hola! Soy el asistente virtual de ZeroSmoke. ¿En qué puedo ayudarte hoy?",
      "¡Bienvenido a ZeroSmoke! Estoy aquí para responder tus preguntas sobre cómo dejar de fumar.",
    ],
    ayuda: [
      "Puedo ayudarte con información sobre cómo dejar de fumar, los beneficios para la salud, y estrategias para manejar la abstinencia. ¿Sobre qué te gustaría saber más?",
      "Estoy aquí para apoyarte en tu camino para dejar de fumar. Puedo ofrecerte información, consejos y recursos útiles.",
    ],
    gracias: [
      "¡De nada! Estoy aquí para ayudarte en tu camino hacia una vida libre de tabaco.",
      "Es un placer poder ayudarte. ¡Sigue adelante con tu objetivo de dejar de fumar!",
    ],
    beneficios: [
      "Dejar de fumar tiene numerosos beneficios para la salud, incluyendo: mejor circulación sanguínea, reducción del riesgo de enfermedades cardíacas y cáncer, mejora en la capacidad pulmonar, y aumento de la esperanza de vida.",
      "Los beneficios de dejar de fumar comienzan casi inmediatamente: en 20 minutos tu presión arterial baja, en 12 horas el monóxido de carbono en sangre se normaliza, en 2 semanas mejora la circulación, y en 1-9 meses disminuye la tos y la dificultad para respirar.",
    ],
    abstinencia: [
      "El síndrome de abstinencia incluye síntomas como ansiedad, irritabilidad, dificultad para concentrarse, aumento del apetito, y antojos de nicotina. Estos síntomas suelen alcanzar su punto máximo en los primeros 3-5 días y disminuyen gradualmente durante 2-4 semanas.",
      "Para manejar los síntomas de abstinencia, puedes probar técnicas de relajación, ejercicio físico, mantenerte hidratado, y considerar terapias de reemplazo de nicotina bajo supervisión médica.",
    ],
    "dejar de fumar": [
      "Para dejar de fumar, puedes considerar estas estrategias: establecer una fecha para dejar de fumar, buscar apoyo de amigos y familiares, usar terapias de reemplazo de nicotina, evitar situaciones que asocias con fumar, y mantenerte ocupado con actividades saludables.",
      "Existen varios métodos para dejar de fumar: dejar de golpe (cold turkey), reducción gradual, terapias de reemplazo de nicotina, medicamentos recetados, y apoyo psicológico. Lo importante es encontrar el método que mejor funcione para ti.",
    ],
    recaída: [
      "Las recaídas son parte común del proceso de dejar de fumar. Si recaes, no te desanimes. Analiza qué desencadenó la recaída, aprende de la experiencia y vuelve a intentarlo. Cada intento te acerca más al éxito.",
      "Si has tenido una recaída, recuerda que muchas personas necesitan varios intentos antes de dejar de fumar definitivamente. Considera lo que has aprendido y desarrolla un plan más fuerte para tu próximo intento.",
    ],
    ansiedad: [
      "La ansiedad es un síntoma común al dejar de fumar. Puedes manejarla con técnicas de respiración profunda, meditación, ejercicio físico regular, y reduciendo el consumo de cafeína.",
      "Para reducir la ansiedad al dejar de fumar, mantén tus manos ocupadas con objetos como pelotas antiestrés, practica ejercicios de relajación, y considera hablar con un profesional si la ansiedad es severa.",
    ],
    app: [
      "Nuestra aplicación móvil te ofrece herramientas para seguir tu progreso, recibir consejos personalizados, conectar con una comunidad de apoyo, y acceder a recursos para dejar de fumar en cualquier momento y lugar.",
      "La app de ZeroSmoke incluye un contador de días sin fumar, calculadora de dinero ahorrado, seguimiento de síntomas y mejoras de salud, y ejercicios para manejar los antojos.",
    ],
    test: [
      "Nuestro test de dependencia a la nicotina te ayuda a entender tu nivel de adicción y te proporciona recomendaciones personalizadas basadas en tus resultados.",
      "El test de dependencia evalúa factores como la cantidad de cigarrillos que fumas, cuándo fumas tu primer cigarrillo del día, y qué situaciones te provocan más antojos.",
    ],
    ejercicio: [
      "El ejercicio regular puede ayudarte a dejar de fumar al reducir los antojos, mejorar tu estado de ánimo, manejar el estrés, y prevenir el aumento de peso asociado con dejar de fumar.",
      "Incluso 30 minutos diarios de actividad física moderada como caminar, nadar o andar en bicicleta pueden ayudarte significativamente en tu proceso de dejar de fumar.",
    ],
    alimentación: [
      "Una alimentación equilibrada puede ayudarte a dejar de fumar. Consume frutas y verduras, bebe mucha agua, limita el alcohol y la cafeína, y come pequeñas comidas frecuentes para mantener estable tu nivel de azúcar en sangre.",
      "Algunos alimentos como frutas cítricas, zanahorias y palitos de apio pueden ayudar a reducir los antojos de nicotina. También es recomendable evitar alimentos que asocies con fumar.",
    ],
  }

  // Función mejorada para obtener respuesta del bot
  const getBotResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()

    // Buscar palabras clave en el input
    for (const [keyword, responseOptions] of Object.entries(responses)) {
      if (lowerInput.includes(keyword)) {
        // Seleccionar aleatoriamente una de las respuestas disponibles
        const randomIndex = Math.floor(Math.random() * responseOptions.length)
        return responseOptions[randomIndex]
      }
    }

    // Respuestas para preguntas comunes que no coinciden exactamente con palabras clave
    if (lowerInput.includes("cómo") && lowerInput.includes("funciona")) {
      return "ZeroSmoke funciona a través de un enfoque integral que combina información educativa, herramientas de seguimiento, apoyo comunitario y técnicas basadas en evidencia para ayudarte a dejar de fumar de manera efectiva."
    }

    if (lowerInput.includes("cuánto") && lowerInput.includes("tiempo")) {
      return "El tiempo necesario para dejar de fumar varía para cada persona. Mientras que los síntomas físicos de abstinencia suelen durar 2-4 semanas, el aspecto psicológico puede llevar más tiempo. Lo importante es mantener la perseverancia y buscar apoyo cuando lo necesites."
    }

    if (lowerInput.includes("peso") || lowerInput.includes("engordar")) {
      return "Es común preocuparse por el aumento de peso al dejar de fumar. Puedes minimizarlo con una dieta equilibrada, ejercicio regular, y manteniendo hábitos saludables. Recuerda que los beneficios para la salud de dejar de fumar superan ampliamente cualquier aumento de peso temporal."
    }

    // Respuesta por defecto
    return "Lo siento, no tengo información específica sobre eso. ¿Puedes reformular tu pregunta o preguntar sobre beneficios de dejar de fumar, síntomas de abstinencia, estrategias para dejar de fumar, o nuestra aplicación?"
  }

  // Función para manejar la entrada del usuario
  const handleSendMessage = () => {
    if (inputValue.trim() === "") return

    // Añadir mensaje del usuario
    const userMessage: ChatMessage = {
      text: inputValue,
      isUser: true,
    }
    addMessage(userMessage)

    // Procesar respuesta
    setTimeout(() => {
      const botResponse = getBotResponse(inputValue)
      const botMessage: ChatMessage = {
        text: botResponse,
        isUser: false,
      }
      addMessage(botMessage)
    }, 500)

    setInputValue("")
  }

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Mensaje de bienvenida
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        text: "¡Hola! Soy el asistente virtual de ZeroSmoke. ¿En qué puedo ayudarte hoy?",
        isUser: false,
      }
      addMessage(welcomeMessage)
    }
  }, [isOpen, messages.length, addMessage])

  return (
    <ChatbotContainer>
      <ChatbotButton onClick={toggleChat}>{isOpen ? "✕" : "💬"}</ChatbotButton>

      {isOpen && (
        <ChatWindow>
          <ChatHeader>
            <ChatTitle>Asistente ZeroSmoke</ChatTitle>
            <CloseButton onClick={toggleChat}>✕</CloseButton>
          </ChatHeader>

          <ChatMessages>
            {messages.map((message, index) => (
              <Message key={index} isUser={message.isUser}>
                {message.text}
              </Message>
            ))}
            <div ref={messagesEndRef} />
          </ChatMessages>

          <SuggestedQuestions>
            {suggestedQuestions.map((question, index) => (
              <SuggestedQuestion
                key={index}
                onClick={() => {
                  const userMessage: ChatMessage = {
                    text: question,
                    isUser: true,
                  }
                  addMessage(userMessage)

                  setTimeout(() => {
                    const botResponse = getBotResponse(question)
                    const botMessage: ChatMessage = {
                      text: botResponse,
                      isUser: false,
                    }
                    addMessage(botMessage)
                  }, 500)
                }}
              >
                {question}
              </SuggestedQuestion>
            ))}
          </SuggestedQuestions>

          <ChatInputContainer>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe tu mensaje..."
              fullWidth
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage()
                }
              }}
            />
            <Button onClick={handleSendMessage}>Enviar</Button>
          </ChatInputContainer>
        </ChatWindow>
      )}
    </ChatbotContainer>
  )
}

export default Chatbot

