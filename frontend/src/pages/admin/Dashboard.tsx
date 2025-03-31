import type React from "react"
import styled from "styled-components"
import { AppColors } from "../../styles/colors"
import Card from "../../components/ui/Card"

const DashboardContainer = styled.div`
  padding: 2rem;
`

const DashboardHeader = styled.div`
  margin-bottom: 2rem;
`

const DashboardTitle = styled.h1`
  font-size: 2rem;
  color: ${AppColors.primary};
  margin-bottom: 0.5rem;
`

const DashboardSubtitle = styled.p`
  color: ${AppColors.textSecondary};
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`

const StatCard = styled(Card)`
  padding: 1.5rem;
`

const StatTitle = styled.h3`
  font-size: 1rem;
  color: ${AppColors.textSecondary};
  margin-bottom: 0.5rem;
`

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${AppColors.primary};
`

const RecentActivitySection = styled.div`
  margin-bottom: 2rem;
`

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: ${AppColors.primary};
  margin-bottom: 1rem;
`

const ActivityCard = styled(Card)`
  margin-bottom: 1rem;
`

const ActivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`

const ActivityTitle = styled.h3`
  font-size: 1.125rem;
  color: ${AppColors.textSecondary};
`

const ActivityDate = styled.span`
  font-size: 0.875rem;
  color: ${AppColors.text};
  opacity: 0.7;
`

const ActivityContent = styled.p`
  color: ${AppColors.text};
  margin-bottom: 1rem;
`

const ActivityFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: ${AppColors.textSecondary};
`

const Dashboard: React.FC = () => {
  return (
    <DashboardContainer>
      <DashboardHeader>
        <DashboardTitle>Panel de Administración</DashboardTitle>
        <DashboardSubtitle>Bienvenido al panel de administración de ZeroSmoke</DashboardSubtitle>
      </DashboardHeader>

      <StatsGrid>
        <StatCard>
          <StatTitle>Usuarios Registrados</StatTitle>
          <StatValue>1,234</StatValue>
        </StatCard>

        <StatCard>
          <StatTitle>Tests Completados</StatTitle>
          <StatValue>856</StatValue>
        </StatCard>

        <StatCard>
          <StatTitle>Mensajes de Contacto</StatTitle>
          <StatValue>42</StatValue>
        </StatCard>

        <StatCard>
          <StatTitle>Artículos Publicados</StatTitle>
          <StatValue>18</StatValue>
        </StatCard>
      </StatsGrid>

      <RecentActivitySection>
        <SectionTitle>Actividad Reciente</SectionTitle>

        <ActivityCard>
          <ActivityHeader>
            <ActivityTitle>Nuevo usuario registrado</ActivityTitle>
            <ActivityDate>Hace 2 horas</ActivityDate>
          </ActivityHeader>
          <ActivityContent>Juan Pérez se ha registrado en la plataforma.</ActivityContent>
          <ActivityFooter>
            <span>ID: #12345</span>
            <span>Ver detalles</span>
          </ActivityFooter>
        </ActivityCard>

        <ActivityCard>
          <ActivityHeader>
            <ActivityTitle>Nuevo mensaje de contacto</ActivityTitle>
            <ActivityDate>Hace 5 horas</ActivityDate>
          </ActivityHeader>
          <ActivityContent>María González ha enviado un mensaje a través del formulario de contacto.</ActivityContent>
          <ActivityFooter>
            <span>ID: #42123</span>
            <span>Ver mensaje</span>
          </ActivityFooter>
        </ActivityCard>

        <ActivityCard>
          <ActivityHeader>
            <ActivityTitle>Test de dependencia completado</ActivityTitle>
            <ActivityDate>Hace 1 día</ActivityDate>
          </ActivityHeader>
          <ActivityContent>Carlos Rodríguez ha completado el test de dependencia al tabaco.</ActivityContent>
          <ActivityFooter>
            <span>ID: #78901</span>
            <span>Ver resultados</span>
          </ActivityFooter>
        </ActivityCard>
      </RecentActivitySection>
    </DashboardContainer>
  )
}

export default Dashboard

