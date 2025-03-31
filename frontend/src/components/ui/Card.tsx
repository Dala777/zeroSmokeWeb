import type React from "react"
import styled from "styled-components"
import { AppColors } from "../../styles/colors"

interface CardProps {
  children: React.ReactNode
  elevation?: "low" | "medium" | "high"
  className?: string
}

const getElevation = (level: "low" | "medium" | "high") => {
  switch (level) {
    case "low":
      return "0 2px 4px rgba(0, 0, 0, 0.1)"
    case "medium":
      return "0 4px 8px rgba(0, 0, 0, 0.15)"
    case "high":
      return "0 8px 16px rgba(0, 0, 0, 0.2)"
    default:
      return "0 4px 8px rgba(0, 0, 0, 0.15)"
  }
}

const StyledCard = styled.div<{ elevation: "low" | "medium" | "high" }>`
  background-color: ${AppColors.cardBackground};
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: ${(props) => getElevation(props.elevation)};
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: ${(props) =>
      props.elevation === "high"
        ? getElevation("high")
        : props.elevation === "medium"
          ? getElevation("high")
          : getElevation("medium")};
  }
`

const Card: React.FC<CardProps> = ({ children, elevation = "medium", className }) => {
  return (
    <StyledCard elevation={elevation} className={className}>
      {children}
    </StyledCard>
  )
}

export default Card

