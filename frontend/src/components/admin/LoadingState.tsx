import type React from "react"
import styled from "styled-components"
import { AppColors } from "../../styles/colors"

const Wrap = styled.div`
  background: ${AppColors.cardBackground};
  border-radius: 8px;
  padding: 32px;
  color: ${AppColors.textSecondary};
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`

const LoadingState: React.FC<{ message?: string }> = ({ message = "Cargando metricas..." }) => {
  return <Wrap>{message}</Wrap>
}

export default LoadingState
