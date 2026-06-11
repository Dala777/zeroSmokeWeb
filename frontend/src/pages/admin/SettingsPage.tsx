import type React from "react"
import { useState } from "react"
import styled from "styled-components"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"
import { Settings, BarChart3, Bell } from "lucide-react"

const PageContainer = styled.div`
  padding: 1.5rem;
`

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`

const PageTitle = styled.h2`
  font-size: 1.5rem;
  color: #111827;
  font-weight: 700;
`

const CardsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const Card = styled.div`
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  background: white;
  padding: 24px;
`

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #E5E7EB;
`

const CardIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: #F0FDF4;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #16a34a;
`

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`

const CardDescription = styled.p`
  font-size: 13px;
  color: #6B7280;
  margin: 2px 0 0 0;
`

const FormRow = styled.div`
  margin-bottom: 16px;
`

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #F3F4F6;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`

const ToggleLabel = styled.div`
  display: flex;
  flex-direction: column;
`

const ToggleTitle = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #111827;
`

const ToggleDescription = styled.span`
  font-size: 12px;
  color: #6B7280;
  margin-top: 2px;
`

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
`

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: #16a34a;
  }

  &:checked + span:before {
    transform: translateX(20px);
  }
`

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #D1D5DB;
  transition: 0.3s;
  border-radius: 24px;

  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }
`

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
`

const PlaceholderFrame = styled.div`
  width: 100%;
  height: 200px;
  border: 2px dashed #D1D5DB;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9CA3AF;
  gap: 8px;

  svg {
    opacity: 0.5;
  }

  span {
    font-size: 13px;
  }
`

const SettingsPage: React.FC = () => {
  const [siteName, setSiteName] = useState("ZeroSmoke")
  const [siteDescription, setSiteDescription] = useState("Plataforma para dejar de fumar")
  const [contactEmail, setContactEmail] = useState("contact@zerosmoke.com")

  const [notifications, setNotifications] = useState({
    newUsers: true,
    newMessages: false,
    newArticles: true,
    weeklyReport: true,
  })

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Configuración</PageTitle>
      </PageHeader>

      <CardsGrid>
        <Card>
          <CardHeader>
            <CardIcon>
              <Settings size={20} />
            </CardIcon>
            <div>
              <CardTitle>General</CardTitle>
              <CardDescription>Configuración general del sitio</CardDescription>
            </div>
          </CardHeader>

          <FormRow>
            <Input label="Nombre del Sitio" value={siteName} onChange={(e) => setSiteName(e.target.value)} fullWidth />
          </FormRow>
          <FormRow>
            <Input label="Descripción" value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} fullWidth />
          </FormRow>
          <FormRow>
            <Input label="Email de Contacto" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} fullWidth />
          </FormRow>

          <ButtonRow>
            <Button variant="outline" size="small">Cancelar</Button>
            <Button size="small">Guardar</Button>
          </ButtonRow>
        </Card>

        <Card>
          <CardHeader>
            <CardIcon>
              <BarChart3 size={20} />
            </CardIcon>
            <div>
              <CardTitle>Grafana</CardTitle>
              <CardDescription>Panel de visualización de métricas</CardDescription>
            </div>
          </CardHeader>

          <PlaceholderFrame>
            <BarChart3 size={32} />
            <span>Panel de Grafana próximamente</span>
            <span style={{ fontSize: 11 }}>Los gráficos y dashboards se mostrarán aquí</span>
          </PlaceholderFrame>
        </Card>

        <Card>
          <CardHeader>
            <CardIcon>
              <Bell size={20} />
            </CardIcon>
            <div>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>Gestiona las notificaciones del sistema</CardDescription>
            </div>
          </CardHeader>

          <ToggleRow>
            <ToggleLabel>
              <ToggleTitle>Nuevos Usuarios</ToggleTitle>
              <ToggleDescription>Recibir notificación cuando se registre un nuevo usuario</ToggleDescription>
            </ToggleLabel>
            <ToggleSwitch>
              <ToggleInput type="checkbox" checked={notifications.newUsers} onChange={() => handleToggle("newUsers")} />
              <ToggleSlider />
            </ToggleSwitch>
          </ToggleRow>

          <ToggleRow>
            <ToggleLabel>
              <ToggleTitle>Nuevos Mensajes</ToggleTitle>
              <ToggleDescription>Recibir notificación cuando llegue un mensaje nuevo</ToggleDescription>
            </ToggleLabel>
            <ToggleSwitch>
              <ToggleInput type="checkbox" checked={notifications.newMessages} onChange={() => handleToggle("newMessages")} />
              <ToggleSlider />
            </ToggleSwitch>
          </ToggleRow>

          <ToggleRow>
            <ToggleLabel>
              <ToggleTitle>Nuevos Artículos</ToggleTitle>
              <ToggleDescription>Recibir notificación cuando se publique un artículo</ToggleDescription>
            </ToggleLabel>
            <ToggleSwitch>
              <ToggleInput type="checkbox" checked={notifications.newArticles} onChange={() => handleToggle("newArticles")} />
              <ToggleSlider />
            </ToggleSwitch>
          </ToggleRow>

          <ToggleRow>
            <ToggleLabel>
              <ToggleTitle>Reporte Semanal</ToggleTitle>
              <ToggleDescription>Recibir un resumen semanal de actividad</ToggleDescription>
            </ToggleLabel>
            <ToggleSwitch>
              <ToggleInput type="checkbox" checked={notifications.weeklyReport} onChange={() => handleToggle("weeklyReport")} />
              <ToggleSlider />
            </ToggleSwitch>
          </ToggleRow>
        </Card>
      </CardsGrid>
    </PageContainer>
  )
}

export default SettingsPage
