import type React from "react"
import styled from "styled-components"
import { AppColors } from "../../styles/colors"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  fullWidth?: boolean
}

const InputContainer = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  width: ${(props) => (props.fullWidth ? "100%" : "auto")};
`

const InputLabel = styled.label`
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${AppColors.textSecondary};
`

const StyledInput = styled.input<{ hasError?: boolean }>`
  padding: 0.75rem 1rem;
  border: 1px solid ${(props) => (props.hasError ? AppColors.error : "rgba(255, 255, 255, 0.2)")};
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.05);
  color: ${AppColors.text};
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${(props) => (props.hasError ? AppColors.error : AppColors.primary)};
    box-shadow: 0 0 0 2px ${(props) => (props.hasError ? "rgba(229, 115, 115, 0.2)" : "rgba(76, 175, 80, 0.2)")};
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const ErrorMessage = styled.span`
  color: ${AppColors.error};
  font-size: 0.75rem;
  margin-top: 0.25rem;
`

const Input: React.FC<InputProps> = ({ label, error, fullWidth = false, ...props }) => {
  return (
    <InputContainer fullWidth={fullWidth}>
      {label && <InputLabel>{label}</InputLabel>}
      <StyledInput hasError={!!error} {...props} />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputContainer>
  )
}

export default Input

