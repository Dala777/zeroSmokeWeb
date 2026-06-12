import type React from "react"
import styled from "styled-components"
import { AppColors } from "../../styles/colors"

interface CardProps {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
}

const StyledCard = styled.div<{ $hoverable?: boolean }>`
  background-color: ${AppColors.cardBackground};
  border: 1px solid ${AppColors.border};
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);

  ${(props) =>
    props.$hoverable
      ? `
    &:hover {
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      transform: translateY(-4px);
      border-color: ${AppColors.primary}30;
    }
  `
      : ""}
`

const Card: React.FC<CardProps> = ({ children, className, hoverable = false }) => {
  return (
    <StyledCard className={className} $hoverable={hoverable}>
      {children}
    </StyledCard>
  )
}

export default Card

