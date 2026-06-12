"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import styled, { keyframes } from "styled-components"
import { useLocation } from "react-router-dom"
import { AppColors } from "../styles/colors"
import Input from "./ui/Input"
import { useChatbot } from "./ChatbotContext"
import { publicChatAPI } from "../services/api"
import { MessageCircle, X, Send, Bot, AlertCircle } from "lucide-react"

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
  width: 56px; height: 56px; border-radius: 16px;
  background: linear-gradient(135deg, ${AppColors.primary}, ${AppColors.accent});
  color: white; border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; box-shadow: 0 4px 15px ${AppColors.primary}40;
  transition: all 0.3s ease; position: relative;
  &:hover { animation: ${pulse} 1.5s infinite; }
`

const NotificationBadge = styled.span`
  position: absolute; top: -4px; right: -4px;
  background-color: ${AppColors.error};
  color: white; border-radius: 50%; width: 20px; height: 20px;
  font-size: 0.7rem; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); animation: ${fadeIn} 0.3s ease-out;
`

const ChatWindow = styled.div`
  position: absolute; bottom: 68px; right: 0;
  width: 360px; height: 520px; background-color: white;
  border-radius: 16px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  display: flex; flex-direction: column; overflow: hidden;
  animation: ${fadeIn} 0.25s ease-out; border: 1px solid ${AppColors.border};
  @media (max-width: 480px) { width: calc(100vw - 48px); height: 70vh; right: 0; }
`

const ChatHeader = styled.div`
  background: linear-gradient(135deg, ${AppColors.primary}, ${AppColors.accent});
  color: white; padding: 1rem 1.25rem;
  display: flex; justify-content: space-between; align-items: center;
`

const ChatTitle = styled.h3`
  margin: 0; font-size: 1rem; font-weight: 600;
  display: flex; align-items: center; gap: 0.5rem;
`

const CloseButton = styled.button`
  background: none; border: none; color: white; cursor: pointer;
  width: 32px; height: 32px; display: flex; align-items: center;
  justify-content: center; border-radius: 8px;
  transition: background-color 0.2s ease;
  &:hover { background-color: rgba(255, 255, 255, 0.2); }
`

const ChatMessages = styled.div`
  flex: 1; padding: 1rem; overflow-y: auto;
  display: flex; flex-direction: column; gap: 0.75rem;
  background-color: ${AppColors.surface};
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background-color: rgba(0, 0, 0, 0.15); border-radius: 2px; }
`

const MessageContainer = styled.div<{ $isUser: boolean }>`
  display: flex; flex-direction: column;
  align-items: ${(props) => (props.$isUser ? "flex-end" : "flex-start")};
  max-width: 100%;
`

const MessageBubble = styled.div<{ $isUser: boolean }>`
  max-width: 85%; padding: 0.75rem 1rem;
  border-radius: 16px;
  background-color: ${(props) => (props.$isUser ? AppColors.primary : AppColors.cardBackground)};
  color: ${(props) => (props.$isUser ? "white" : AppColors.text)};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08); font-size: 0.9rem; line-height: 1.5;
  border-bottom-left-radius: ${(props) => (props.$isUser ? "16px" : "4px")};
  border-bottom-right-radius: ${(props) => (props.$isUser ? "4px" : "16px")};
`

const MessageTime = styled.span`
  font-size: 0.65rem; color: rgba(0, 0, 0, 0.4);
  margin-top: 2px; padding: 0 0.5rem;
`

const TypingIndicator = styled.div`
  display: flex; align-items: center; gap: 4px;
  padding: 10px 16px; background-color: ${AppColors.cardBackground};
  border-radius: 16px; border-bottom-left-radius: 4px;
  width: fit-content; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
`

const TypingDot = styled.div`
  width: 6px; height: 6px; background-color: ${AppColors.primary};
  border-radius: 50%; animation: ${pulse} 1s infinite;
  &:nth-child(2) { animation-delay: 0.15s; }
  &:nth-child(3) { animation-delay: 0.3s; }
`

const TypingText = styled.span`
  font-size: 0.8rem;
  color: ${AppColors.textSecondary};
  margin-left: 6px;
`

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 12px;
  color: #DC2626;
  font-size: 0.85rem;
  max-width: 90%;
`

const ChatInputContainer = styled.div`
  padding: 0.75rem; border-top: 1px solid ${AppColors.border};
  display: flex; gap: 0.5rem; background-color: white;
`

const SuggestedQuestions = styled.div`
  padding: 0.5rem 0.75rem; display: flex; flex-wrap: wrap;
  gap: 0.4rem; background-color: white;
  border-top: 1px solid ${AppColors.border}50;
  max-height: 100px; overflow-y: auto;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background-color: rgba(0, 0, 0, 0.15); border-radius: 2px; }
`

const SuggestedQuestion = styled.button`
  background-color: ${AppColors.surface};
  color: ${AppColors.textSecondary};
  border: 1px solid ${AppColors.border};
  border-radius: 12px; padding: 0.35rem 0.75rem; font-size: 0.8rem;
  cursor: pointer; transition: all 0.2s ease; white-space: nowrap;
  &:hover {
    background-color: ${AppColors.primary}15;
    border-color: ${AppColors.primary}40;
    color: ${AppColors.primary};
  }
`

const StyledInput = styled(Input)`
  border-radius: 12px; background-color: ${AppColors.surface};
  border: 1px solid transparent;
  &:focus { border-color: ${AppColors.primary}40; box-shadow: 0 0 0 2px ${AppColors.primary}20; }
`

const SendButton = styled.button`
  background: linear-gradient(135deg, ${AppColors.primary}, ${AppColors.accent});
  color: white; border: none; border-radius: 12px; width: 42px; height: 42px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0; transition: all 0.25s ease;
  &:hover { box-shadow: 0 4px 12px ${AppColors.primary}40; transform: scale(1.05); }
`

const Chatbot: React.FC = () => {
  const location = useLocation()
  const { isOpen, messages, toggleChat, addMessage } = useChatbot()
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const sendToGroq = useCallback(async (text: string) => {
    setIsTyping(true)
    setError(null)

    try {
      const chatHistory = messages
        .filter((m) => m.text)
        .map((m) => ({
          role: m.isUser ? "user" : "assistant",
          text: m.text,
        }))

      const res = await publicChatAPI.sendMessage({
        message: text,
        history: chatHistory,
      })

      const reply = res.data.reply || res.data.response
      if (reply) {
        addMessage({ text: reply, isUser: false, timestamp: new Date() })
      } else {
        throw new Error("Respuesta vacía")
      }
    } catch {
      setError("No pude conectar con el asistente. Por favor, intenta de nuevo.")
    } finally {
      setIsTyping(false)
    }
  }, [messages, addMessage])

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

  if (location.pathname.startsWith("/admin")) return null

  const suggestedQuestions = [
    "¿Qué es ZeroSmoke?",
    "¿Cómo funciona el test?",
    "Beneficios de dejar de fumar",
    "¿Cómo descargo la app?",
    "Consejos para dejar de fumar",
  ]

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return
    const text = inputValue
    setInputValue("")
    addMessage({ text, isUser: true, timestamp: new Date() })
    sendToGroq(text)
  }

  const handleSuggestedQuestion = (question: string) => {
    addMessage({ text: question, isUser: true, timestamp: new Date() })
    sendToGroq(question)
  }

  return (
    <ChatbotContainer>
      <ChatbotButton onClick={toggleChat} aria-label={isOpen ? "Cerrar chat" : "Abrir chat"}>
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {messages.length > 0 && !isOpen && <NotificationBadge>1</NotificationBadge>}
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

            {error && (
              <MessageContainer $isUser={false}>
                <ErrorMessage>
                  <AlertCircle size={14} />
                  {error}
                </ErrorMessage>
              </MessageContainer>
            )}

            {isTyping && (
              <MessageContainer $isUser={false}>
                <TypingIndicator>
                  <TypingDot /><TypingDot /><TypingDot />
                  <TypingText>Pensando...</TypingText>
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