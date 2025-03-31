import type React from "react"
import styled, { css } from "styled-components"
import { AppColors } from "../../styles/colors"

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
        background-color: ${AppColors.primary};
        color: white;
        border: none;
        
        &:hover {
          background-color: ${AppColors.tertiary};
        }
      `
    case "secondary":
      return css`
        background-color: ${AppColors.secondary};
        color: ${AppColors.background};
        border: none;
        
        &:hover {
          background-color: ${AppColors.primary};
        }
      `
    case "tertiary":
      return css`
        background-color: ${AppColors.tertiary};
        color: white;
        border: none;
        
        &:hover {
          background-color: ${AppColors.accent};
        }
      `
    case "outline":
      return css`
        background-color: transparent;
        color: ${AppColors.primary};
        border: 2px solid ${AppColors.primary};
        
        &:hover {
          background-color: ${AppColors.primary};
          color: white;
        }
      `
    case "text":
      return css`
        background-color: transparent;
        color: ${AppColors.primary};
        border: none;
        padding: 0.5rem 1rem;
        
        &:hover {
          color: ${AppColors.tertiary};
          background-color: rgba(76, 175, 80, 0.1);
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
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.3);
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

