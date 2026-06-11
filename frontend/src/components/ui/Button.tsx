import type React from "react"
import styled, { css } from "styled-components"

type ButtonVariant = "primary" | "secondary" | "tertiary" | "outline" | "text"
type ButtonSize = "small" | "medium" | "large"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  children: React.ReactNode
}

const getButtonStyles = (variant: ButtonVariant) => {
  switch (variant) {
    case "primary":
      return css`
        background-color: #16a34a;
        color: white;
        border: none;
        
        &:hover {
          background-color: #15803d;
        }
      `
    case "secondary":
      return css`
        background-color: #6B7280;
        color: white;
        border: none;
        
        &:hover {
          background-color: #4B5563;
        }
      `
    case "tertiary":
      return css`
        background-color: #F3F4F6;
        color: #111827;
        border: none;
        
        &:hover {
          background-color: #E5E7EB;
        }
      `
    case "outline":
      return css`
        background-color: transparent;
        color: #16a34a;
        border: 2px solid #16a34a;
        
        &:hover {
          background-color: #16a34a;
          color: white;
        }
      `
    case "text":
      return css`
        background-color: transparent;
        color: #16a34a;
        border: none;
        padding: 0.5rem 1rem;
        
        &:hover {
          color: #15803d;
          background-color: rgba(22, 163, 74, 0.1);
        }
      `
    default:
      return ""
  }
}

const getButtonSize = (size: ButtonSize) => {
  switch (size) {
    case "small":
      return css`
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
      `
    case "medium":
      return css`
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
      `
    case "large":
      return css`
        padding: 1rem 2rem;
        font-size: 1.125rem;
      `
    default:
      return ""
  }
}

const StyledButton = styled.button<{
  variant: ButtonVariant
  size: ButtonSize
  fullWidth?: boolean
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  
  ${(props) => getButtonStyles(props.variant)}
  ${(props) => getButtonSize(props.size)}
  
  width: ${(props) => (props.fullWidth ? "100%" : "auto")};
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.3);
  }
`

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "medium",
  fullWidth = false,
  children,
  ...props
}) => {
  return (
    <StyledButton variant={variant} size={size} fullWidth={fullWidth} {...props}>
      {children}
    </StyledButton>
  )
}

export default Button

