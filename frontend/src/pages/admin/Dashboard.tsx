import type React from "react"
import styled from "styled-components"
import { AppColors } from "../../styles/colors"
import { Users, MessageSquare, FileText, Activity } from "lucide-react"

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 30px;
`

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  
  .icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: ${AppColors.primary}10;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    
    svg {
      color: ${AppColors.primary};
    }
  }
  
  .content {
    flex: 1;
    
    .value {
      font-size: 24px;
      font-weight: 700;
      color: ${AppColors.text};
      margin: 0;
    }
    
    .label {
      font-size: 14px;
      color: ${AppColors.textSecondary};
      margin: 0;
    }
  }
`

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${AppColors.text};
  margin: 0 0 16px 0;
`

const RecentActivity = styled.div`
  margin-top: 30px;
`

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  
  .icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: ${AppColors.primary}10;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    
    svg {
      color: ${AppColors.primary};
      width: 20px;
      height: 20px;
    }
  }
  
  .content {
    flex: 1;
    
    .title {
      font-weight: 600;
      color: ${AppColors.text};
      margin: 0 0 4px 0;
    }
    
    .description {
      font-size: 14px;
      color: ${AppColors.textSecondary};
      margin: 0;
    }
  }
  
  .time {
    font-size: 12px;
    color: ${AppColors.textSecondary};
  }
`

const Dashboard: React.FC = () => {
  // Mock data
  const stats = [
    { label: "Usuarios Totales", value: 1254, icon: <Users size={24} /> },
    { label: "Mensajes Nuevos", value: 18, icon: <MessageSquare size={24} /> },
    { label: "Artículos", value: 32, icon: <FileText size={24} /> },
    { label: "Usuarios Activos", value: 842, icon: <Activity size={24} /> },
  ]

  const activities = [
    {
      title: "Nuevo usuario registrado",
      description: "Juan Pérez se ha registrado en la plataforma",
      time: "Hace 2 horas",
      icon: <Users size={20} />,
    },
    {
      title: "Nuevo mensaje recibido",
      description: "María González ha enviado un mensaje de contacto",
      time: "Hace 3 horas",
      icon: <MessageSquare size={20} />,
    },
    {
      title: "Artículo publicado",
      description: 'Se ha publicado un nuevo artículo: "Beneficios de dejar de fumar"',
      time: "Hace 5 horas",
      icon: <FileText size={20} />,
    },
  ]

  return (
    <>
      <h1>Dashboard</h1>
      <p>Bienvenido al panel de administración de ZeroSmoke</p>

      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard key={index}>
            <div className="icon">{stat.icon}</div>
            <div className="content">
              <p className="value">{stat.value}</p>
              <p className="label">{stat.label}</p>
            </div>
          </StatCard>
        ))}
      </StatsGrid>

      <RecentActivity>
        <SectionTitle>Actividad Reciente</SectionTitle>
        <ActivityList>
          {activities.map((activity, index) => (
            <ActivityItem key={index}>
              <div className="icon">{activity.icon}</div>
              <div className="content">
                <p className="title">{activity.title}</p>
                <p className="description">{activity.description}</p>
              </div>
              <div className="time">{activity.time}</div>
            </ActivityItem>
          ))}
        </ActivityList>
      </RecentActivity>
    </>
  )
}

export default Dashboard
