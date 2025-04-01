"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import styled from "styled-components"
import { AppColors } from "../styles/colors"
import { useChatbot } from "./ChatbotContext"

// Componentes estilizados
const ChatbotContainer = styled.div<{ isOpen: boolean }>`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  width: ${(props) => (props.isOpen ? "350px" : "60px")};
  height: ${(props) => (props.isOpen ? "500px" : "60px")};
  background-color: ${AppColors.cardBackground};
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  overflow: hidden;
`

const ChatbotHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: ${AppColors.primary};
  color: white;
`

const ChatbotTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
`

const ChatbotBody = styled.div`
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const ChatbotFooter = styled.div`
  padding: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`

const ChatForm = styled.form`
  display: flex;
  gap: 10px;
`

const ChatInput = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.05);
  color: ${AppColors.text};

  &:focus {
    outline: none;
    border-color: ${AppColors.primary};
  }
`

const SendButton = styled.button`
  padding: 10px 15px;
  background-color: ${AppColors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: ${AppColors.primaryDark};
  }
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
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: ${AppColors.primaryDark};
  }
`

const Message = styled.div<{ sender: "user" | "bot" }>`
  max-width: 80%;
  padding: 10px 15px;
  border-radius: 10px;
  background-color: ${(props) => (props.sender === "user" ? AppColors.primary : "rgba(255, 255, 255, 0.1)")};
  color: ${(props) => (props.sender === "user" ? "white" : AppColors.text)};
  align-self: ${(props) => (props.sender === "user" ? "flex-end" : "flex-start")};
`

const Chatbot: React.FC = () => {
  const { isOpen, messages, openChat, closeChat, toggleChat, addMessage } = useChatbot()
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      // Add user message
      addMessage(inputValue, "user")

      // Simulate bot response
      setTimeout(() => {
        addMessage("Gracias por tu mensaje. Un asistente te responderá pronto.", "bot")
      }, 1000)

      setInputValue("")
    }
  }

  if (!isOpen) {
    return <ChatbotButton onClick={openChat}>💬</ChatbotButton>
  }

  return (
    <ChatbotContainer isOpen={isOpen}>
      <ChatbotHeader>
        <ChatbotTitle>Asistente Virtual</ChatbotTitle>
        <CloseButton onClick={closeChat}>×</CloseButton>
      </ChatbotHeader>

      <ChatbotBody>
        {messages.length === 0 ? (
          <Message sender="bot">¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?</Message>
        ) : (
          messages.map((message, index) => (
            <Message key={index} sender={message.sender}>
              {message.text}
            </Message>
          ))
        )}
        <div ref={messagesEndRef} />
      </ChatbotBody>

      <ChatbotFooter>
        <ChatForm onSubmit={handleSubmit}>
          <ChatInput
            type="text"
            placeholder="Escribe tu mensaje..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <SendButton type="submit">Enviar</SendButton>
        </ChatForm>
      </ChatbotFooter>
    </ChatbotContainer>
  )
}

export default Chatbot

