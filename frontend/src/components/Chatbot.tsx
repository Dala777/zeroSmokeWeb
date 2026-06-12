"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import styled, { keyframes } from "styled-components"
import { useLocation } from "react-router-dom"
import { AppColors } from "../styles/colors"
import Input from "./ui/Input"
import { useChatbot } from "./ChatbotContext"
import { MessageCircle, X, Send, Bot } from "lucide-react"

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); }
  50% { transform: scale(1.05); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3); }
  100% { transform: scale(1); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); }
`

const ChatbotContainer = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  font-family: 'Inter', sans-serif;
`

const ChatbotButton = styled.button`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, ${AppColors.primary}, ${AppColors.accent});
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 15px ${AppColors.primary}40;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    animation: ${pulse} 1.5s infinite;
  }
`

const NotificationBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: ${AppColors.error};
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  animation: ${fadeIn} 0.3s ease-out;
`

const ChatWindow = styled.div`
  position: absolute;
  bottom: 68px;
  right: 0;
  width: 360px;
  height: 520px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${fadeIn} 0.25s ease-out;
  border: 1px solid ${AppColors.border};

  @media (max-width: 480px) {
    width: calc(100vw - 48px);
    height: 70vh;
    right: 0;
  }
`

const ChatHeader = styled.div`
  background: linear-gradient(135deg, ${AppColors.primary}, ${AppColors.accent});
  color: white;
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const ChatTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`

const ChatMessages = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background-color: ${AppColors.surface};

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background-color: rgba(0, 0, 0, 0.15); border-radius: 2px; }
`

const MessageContainer = styled.div<{ $isUser: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.$isUser ? "flex-end" : "flex-start")};
  max-width: 100%;
`

const MessageBubble = styled.div<{ $isUser: boolean }>`
  max-width: 85%;
  padding: 0.75rem 1rem;
  border-radius: 16px;
  background-color: ${(props) => (props.$isUser ? AppColors.primary : AppColors.cardBackground)};
  color: ${(props) => (props.$isUser ? "white" : AppColors.text)};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  font-size: 0.9rem;
  line-height: 1.5;
  border-bottom-left-radius: ${(props) => (props.$isUser ? "16px" : "4px")};
  border-bottom-right-radius: ${(props) => (props.$isUser ? "4px" : "16px")};
`

const MessageTime = styled.span`
  font-size: 0.65rem;
  color: rgba(0, 0, 0, 0.4);
  margin-top: 2px;
  padding: 0 0.5rem;
`

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 16px;
  background-color: ${AppColors.cardBackground};
  border-radius: 16px;
  border-bottom-left-radius: 4px;
  width: fit-content;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
`

const TypingDot = styled.div`
  width: 6px;
  height: 6px;
  background-color: ${AppColors.primary};
  border-radius: 50%;
  animation: ${pulse} 1s infinite;

  &:nth-child(2) { animation-delay: 0.15s; }
  &:nth-child(3) { animation-delay: 0.3s; }
`

const ChatInputContainer = styled.div`
  padding: 0.75rem;
  border-top: 1px solid ${AppColors.border};
  display: flex;
  gap: 0.5rem;
  background-color: white;
`

const SuggestedQuestions = styled.div`
  padding: 0.5rem 0.75rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  background-color: white;
  border-top: 1px solid ${AppColors.border}50;
  max-height: 100px;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background-color: rgba(0, 0, 0, 0.15); border-radius: 2px; }
`

const SuggestedQuestion = styled.button`
  background-color: ${AppColors.surface};
  color: ${AppColors.textSecondary};
  border: 1px solid ${AppColors.border};
  border-radius: 12px;
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background-color: ${AppColors.primary}15;
    border-color: ${AppColors.primary}40;
    color: ${AppColors.primary};
  }
`

const StyledInput = styled(Input)`
  border-radius: 12px;
  background-color: ${AppColors.surface};
  border: 1px solid transparent;

  &:focus {
    border-color: ${AppColors.primary}40;
    box-shadow: 0 0 0 2px ${AppColors.primary}20;
  }
`

const SendButton = styled.button`
  background: linear-gradient(135deg, ${AppColors.primary}, ${AppColors.accent});
  color: white;
  border: none;
  border-radius: 12px;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.25s ease;

  &:hover {
    box-shadow: 0 4px 12px ${AppColors.primary}40;
    transform: scale(1.05);
  }
`

const Chatbot: React.FC = () => {
  const location = useLocation()
  const { isOpen, messages, toggleChat, addMessage } = useChatbot()
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [hasNewMessage, setHasNewMessage] = useState(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addMessage({
        text: "¡Hola! Soy el asistente virtual de ZeroSmoke. ¿En qué puedo ayudarte hoy?",
        isUser: false,
        timestamp: new Date(),
      })
    }
  }, [isOpen, messages.length, addMessage])

  useEffect(() => {
    if (isOpen) setHasNewMessage(false)
  }, [isOpen])

  if (location.pathname.startsWith("/admin")) return null

  const suggestedQuestions = [
    "¿Cómo puedo dejar de fumar?",
    "¿Cuáles son los beneficios?",
    "¿Cómo manejar la ansiedad?",
    "¿Qué hacer si tengo una recaída?",
    "¿Cómo funciona la app?",
    "¿Qué técnicas de relajación?",
  ]

  const responses: Record<string, string[]> = {
    hola: ["¡Hola! Soy el asistente virtual de ZeroSmoke. ¿En qué puedo ayudarte hoy?", "¡Bienvenido a ZeroSmoke! Estoy aquí para responder tus preguntas sobre cómo dejar de fumar."],
    ayuda: ["Puedo ayudarte con información sobre cómo dejar de fumar, los beneficios para la salud, y estrategias para manejar la abstinencia. ¿Sobre qué te gustaría saber más?"],
    gracias: ["¡De nada! Estoy aquí para ayudarte en tu camino hacia una vida libre de tabaco."],
    beneficios: ["Dejar de fumar tiene numerosos beneficios: mejor circulación, reducción del riesgo de enfermedades cardíacas y cáncer, mejora en la capacidad pulmonar, y aumento de la esperanza de vida. Los beneficios comienzan casi inmediatamente: en 20 minutos tu presión arterial baja."],
    abstinencia: ["El síndrome de abstinencia incluye ansiedad, irritabilidad, dificultad para concentrarse, aumento del apetito y antojos. Estos síntomas suelen alcanzar su punto máximo en los primeros 3-5 días y disminuyen gradualmente durante 2-4 semanas."],
    "dejar de fumar": ["Para dejar de fumar, puedes considerar: establecer una fecha, buscar apoyo, usar terapias de reemplazo de nicotina, evitar situaciones asociadas con fumar, y mantenerte ocupado con actividades saludables."],
    recaída: ["Las recaídas son parte del proceso. No te desanimes. Analiza qué desencadenó la recaída, aprende de la experiencia y vuelve a intentarlo. Cada intento te acerca más al éxito."],
    ansiedad: ["La ansiedad es común al dejar de fumar. Puedes manejarla con respiración profunda, meditación, ejercicio físico regular, y reduciendo el consumo de cafeína."],
    app: ["Nuestra app te ofrece herramientas para seguir tu progreso, recibir consejos personalizados, conectar con una comunidad de apoyo, y acceder a recursos para dejar de fumar."],
    test: ["Nuestro test de dependencia te ayuda a entender tu nivel de adicción y te proporciona recomendaciones personalizadas basadas en tus resultados."],
    salud: ["El tabaco afecta prácticamente todos los órganos del cuerpo. Aumenta el riesgo de cáncer, enfermedades cardíacas, accidentes cerebrovasculares y enfermedades pulmonares."],
    peso: ["El aumento de peso promedio al dejar de fumar es de 4-5 kg. Puedes minimizarlo con una dieta equilibrada, ejercicio regular y hábitos saludables."],
    relajación: ["La respiración profunda es efectiva para manejar antojos: inhala por 4 segundos, mantén 7 segundos, exhala por 8 segundos. Repite 3-5 veces."],
    ejercicio: ["El ejercicio reduce los antojos, mejora el estado de ánimo, disminuye el estrés y acelera la recuperación pulmonar. Incluso 10 minutos diarios marcan la diferencia."],
  }

  const getBotResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()
    for (const [keyword, responseOptions] of Object.entries(responses)) {
      if (lowerInput.includes(keyword)) {
        return responseOptions[Math.floor(Math.random() * responseOptions.length)]
      }
    }
    return "Lo siento, no tengo información específica sobre eso. ¿Puedes preguntar sobre beneficios de dejar de fumar, síntomas de abstinencia, o nuestra aplicación? Estoy aquí para ayudarte."
  }

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return
    addMessage({ text: inputValue, isUser: true, timestamp: new Date() })
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      addMessage({ text: getBotResponse(inputValue), isUser: false, timestamp: new Date() })
      if (!isOpen) setHasNewMessage(true)
    }, 800 + Math.random() * 800)
    setInputValue("")
  }

  const handleSuggestedQuestion = (question: string) => {
    addMessage({ text: question, isUser: true, timestamp: new Date() })
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      addMessage({ text: getBotResponse(question), isUser: false, timestamp: new Date() })
    }, 800 + Math.random() * 800)
  }

  return (
    <ChatbotContainer>
      <ChatbotButton onClick={toggleChat} aria-label={isOpen ? "Cerrar chat" : "Abrir chat"}>
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {hasNewMessage && !isOpen && <NotificationBadge>1</NotificationBadge>}
      </ChatbotButton>

      {isOpen && (
        <ChatWindow>
          <ChatHeader>
            <ChatTitle>
              <Bot size={20} />
              Asistente ZeroSmoke
            </ChatTitle>
            <CloseButton onClick={toggleChat} aria-label="Cerrar chat">
              <X size={18} />
            </CloseButton>
          </ChatHeader>

          <ChatMessages>
            {messages.map((message, index) => (
              <MessageContainer key={index} $isUser={message.isUser}>
                <MessageBubble $isUser={message.isUser}>{message.text}</MessageBubble>
                <MessageTime>
                  {message.timestamp?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </MessageTime>
              </MessageContainer>
            ))}

            {isTyping && (
              <MessageContainer $isUser={false}>
                <TypingIndicator>
                  <TypingDot /><TypingDot /><TypingDot />
                </TypingIndicator>
              </MessageContainer>
            )}

            <div ref={messagesEndRef} />
          </ChatMessages>

          <SuggestedQuestions>
            {suggestedQuestions.map((question, index) => (
              <SuggestedQuestion key={index} onClick={() => handleSuggestedQuestion(question)}>
                {question}
              </SuggestedQuestion>
            ))}
          </SuggestedQuestions>

          <ChatInputContainer>
            <StyledInput
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe tu mensaje..."
              fullWidth
              onKeyPress={(e) => { if (e.key === "Enter") handleSendMessage() }}
            />
            <SendButton onClick={handleSendMessage} aria-label="Enviar mensaje">
              <Send size={18} />
            </SendButton>
          </ChatInputContainer>
        </ChatWindow>
      )}
    </ChatbotContainer>
  )
}

export default Chatbot