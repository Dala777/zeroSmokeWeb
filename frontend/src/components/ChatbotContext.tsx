"use client"

import type React from "react"
import { createContext, useContext, useState, type ReactNode } from "react"

// Define the structure of a chat message
interface ChatMessage {
  id: string
  text: string
  isUser: boolean
  timestamp?: Date // Añadimos timestamp como opcional
}

// Define the context value structure
interface ChatbotContextType {
  isOpen: boolean
  messages: ChatMessage[] // Añadido messages
  openChat: () => void
  closeChat: () => void
  toggleChat: () => void
  addMessage: (text: string, sender: "user" | "bot") => void // Añadido addMessage
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined)

interface ChatbotProviderProps {
  children: ReactNode
}

export const ChatbotProvider: React.FC<ChatbotProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([]) // Añadido estado de mensajes

  const openChat = () => setIsOpen(true)
  const closeChat = () => setIsOpen(false)
  const toggleChat = () => setIsOpen((prev) => !prev)

  // Función para añadir mensajes
  const addMessage = (text: string, sender: "user" | "bot") => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  return (
    <ChatbotContext.Provider
      value={{
        isOpen,
        messages,
        openChat,
        closeChat,
        toggleChat,
        addMessage,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  )
}
