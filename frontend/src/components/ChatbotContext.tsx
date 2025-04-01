"use client"

import type React from "react"
import { createContext, useContext, useState, type ReactNode } from "react"

// Define el tipo de mensaje
interface ChatMessage {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

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

export const useChatbot = (): ChatbotContextType => {
  const context = useContext(ChatbotContext)
  if (context === undefined) {
    throw new Error("useChatbot must be used within a ChatbotProvider")
  }
  return context
}

export default ChatbotProvider

