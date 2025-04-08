"use client";

import type React from "react";
import styled from "styled-components";
import { AppColors } from "../styles/colors";
import { useChatbot } from "./ChatbotContext";

const FloatingButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
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
  z-index: 1000;

  &:hover {
    background-color: ${AppColors.tertiary};
    transform: scale(1.05);
  }
`;

interface ChatbotButtonProps {
  text?: string;
}

const ChatbotButton: React.FC<ChatbotButtonProps> = ({ text = "💬" }) => {
  const { toggleChat, isOpen } = useChatbot();

  return (
    <FloatingButton onClick={toggleChat} aria-label="Abrir chat de asistencia">
      {isOpen ? "✕" : text}
    </FloatingButton>
  );
};

export default ChatbotButton;
