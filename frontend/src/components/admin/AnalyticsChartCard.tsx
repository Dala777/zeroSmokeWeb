import type React from "react"
import styled from "styled-components"
import { AppColors } from "../../styles/colors"

const Card = styled.section`
  background: ${AppColors.cardBackground};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  min-height: 320px;
  display: flex;
  flex-direction: column;
`

const Header = styled.div`
  margin-bottom: 16px;
`

const Title = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: ${AppColors.text};
  margin: 0;
`

const Body = styled.div`
  flex: 1;
  min-height: 250px;
`

interface AnalyticsChartCardProps {
  title: string
  children: React.ReactNode
}

const AnalyticsChartCard: React.FC<AnalyticsChartCardProps> = ({ title, children }) => {
  return (
    <Card>
      <Header>
        <Title>{title}</Title>
      </Header>
      <Body>{children}</Body>
    </Card>
  )
}

export default AnalyticsChartCard
