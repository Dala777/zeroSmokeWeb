import type React from "react"
import styled from "styled-components"
import { AppColors } from "../../styles/colors"

const Wrap = styled.div`
  background: rgba(240, 138, 132, 0.12);
  border: 1px solid rgba(240, 138, 132, 0.28);
  border-radius: 8px;
  padding: 18px;
  color: ${AppColors.error};
`

const Title = styled.p`
  font-weight: 600;
  margin: 0 0 4px;
`

const Message = styled.p`
  margin: 0;
  color: ${AppColors.text};
`

const ErrorState: React.FC<{ message: string }> = ({ message }) => {
  return (
    <Wrap>
      <Title>Error al cargar analytics</Title>
      <Message>{message}</Message>
    </Wrap>
  )
}

export default ErrorState
