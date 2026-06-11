import type React from "react"
import styled from "styled-components"

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
  color: #6B7280;
`

const StyledInput = styled.input<{ hasError?: boolean }>`
  padding: 10px 14px;
  border: 1px solid ${(props) => (props.hasError ? "#DC2626" : "#D1D5DB")};
  border-radius: 8px;
  background-color: #FFFFFF;
  color: #111827;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #16a34a;
    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.15);
  }
  
  &::placeholder {
    color: #9CA3AF;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const ErrorMessage = styled.span`
  color: #DC2626;
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

