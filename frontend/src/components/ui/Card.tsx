import type React from "react"
import styled from "styled-components"

interface CardProps {
  children: React.ReactNode
  className?: string
}

const StyledCard = styled.div`
  background-color: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 24px;
`

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <StyledCard className={className}>
      {children}
    </StyledCard>
  )
}

export default Card

