import type React from "react"
import styled from "styled-components"
import { AppColors } from "../../styles/colors"

const Card = styled.div`
  background: ${AppColors.cardBackground};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  min-height: 104px;
`

const IconWrap = styled.div`
  width: 46px;
  height: 46px;
  border-radius: 8px;
  background: ${AppColors.primary}18;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  flex-shrink: 0;

  svg {
    color: ${AppColors.accent};
  }
`

const Content = styled.div`
  min-width: 0;
`

const Value = styled.p`
  font-size: 24px;
  font-weight: 700;
  color: ${AppColors.text};
  margin: 0;
  line-height: 1.2;
`

const Label = styled.p`
  font-size: 14px;
  color: ${AppColors.textSecondary};
  margin: 4px 0 0;
`

interface AdminStatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
}

const AdminStatCard: React.FC<AdminStatCardProps> = ({ label, value, icon }) => {
  return (
    <Card>
      <IconWrap>{icon}</IconWrap>
      <Content>
        <Value>{value}</Value>
        <Label>{label}</Label>
      </Content>
    </Card>
  )
}

export default AdminStatCard
