import { useState, useMemo, useCallback } from "react"
import styled from "styled-components"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react"
import { AppColors } from "../../styles/colors"
import GrafanaEmbed from "../../components/admin/GrafanaEmbed"

const GRAFANA_URL = process.env.REACT_APP_GRAFANA_URL || "http://localhost:3001"
const DASHBOARD_UID = process.env.REACT_APP_GRAFANA_DASHBOARD_UID || ""

type TabId = "overview" | "research" | "alerts" | "heatmaps"

const tabs: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "research", label: "Research" },
  { id: "alerts", label: "Alerts" },
  { id: "heatmaps", label: "Heatmaps" },
]

const refreshOptions = [
  { value: 0, label: "Off" },
  { value: 10, label: "10s" },
  { value: 30, label: "30s" },
  { value: 60, label: "1m" },
  { value: 300, label: "5m" },
]

const PageIntro = styled.div`
  margin-bottom: 22px;

  h1 {
    color: ${AppColors.text};
    font-size: 28px;
    line-height: 1.2;
    margin: 0 0 6px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  p {
    color: ${AppColors.textSecondary};
    margin: 0;
  }
`

const StatusBadge = styled.span<{ $connected: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  margin-top: 8px;
  color: ${(p) => (p.$connected ? AppColors.success : AppColors.error)};
  background: ${(p) =>
    p.$connected ? `${AppColors.success}18` : `${AppColors.error}18`};

  &::before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${(p) => (p.$connected ? AppColors.success : AppColors.error)};
  }
`

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
`

const ToolbarGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`

const TabBar = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
`

const TabButton = styled.button<{ $active: boolean }>`
  padding: 10px 18px;
  border: none;
  background: ${(p) => (p.$active ? `${AppColors.primary}18` : "transparent")};
  color: ${(p) => (p.$active ? AppColors.accent : AppColors.textSecondary)};
  font-weight: ${(p) => (p.$active ? 600 : 400)};
  font-size: 0.9rem;
  cursor: pointer;
  border-bottom: 2px solid ${(p) => (p.$active ? AppColors.primary : "transparent")};
  transition: all 0.2s ease;
  border-radius: 6px 6px 0 0;

  &:hover {
    color: ${AppColors.accent};
    background: ${(p) =>
      p.$active ? `${AppColors.primary}18` : "rgba(0, 0, 0, 0.02)"};
  }
`

const SelectStyled = styled.select`
  padding: 6px 10px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 6px;
  background: ${AppColors.cardBackground};
  color: ${AppColors.text};
  font-size: 0.85rem;
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: ${AppColors.primary};
  }
`

const RefreshButton = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: ${(p) => (p.$active ? `${AppColors.primary}18` : AppColors.cardBackground)};
  color: ${(p) => (p.$active ? AppColors.accent : AppColors.textSecondary)};
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${AppColors.primary};
    color: ${AppColors.accent};
  }
`

const PlaceholderCard = styled.div`
  background: ${AppColors.cardBackground};
  border-radius: 8px;
  padding: 48px 24px;
  text-align: center;
  color: ${AppColors.textSecondary};
  border: 1px solid rgba(0, 0, 0, 0.06);
`

const SectionTitle = styled.h2`
  color: ${AppColors.text};
  font-size: 20px;
  margin: 32px 0 16px;
  display: flex;
  align-items: center;
  gap: 10px;
`

const ResearchGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
`

const ResearchCard = styled.div`
  background: ${AppColors.background};
  border-radius: 8px;
  padding: 18px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }
`

const ResearchCardIcon = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(p) => `${p.$color}18`};
  color: ${(p) => p.$color};
  margin-bottom: 12px;
`

const ResearchCardTitle = styled.h3`
  font-size: 1rem;
  color: ${AppColors.text};
  margin: 0 0 6px;
`

const ResearchCardText = styled.p`
  font-size: 0.85rem;
  color: ${AppColors.textSecondary};
  margin: 0;
  line-height: 1.5;
`

const NoConfigMessage = styled.div`
  background: ${AppColors.cardBackground};
  border-radius: 8px;
  padding: 48px 24px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.06);

  h3 {
    color: ${AppColors.text};
    margin: 0 0 8px;
  }

  p {
    color: ${AppColors.textSecondary};
    margin: 0;
    font-size: 0.9rem;
  }
`

const DashboardEmbedded = styled.div`
  margin-bottom: 8px;
`

const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("overview")
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshSeconds, setRefreshSeconds] = useState(30)

  const grafanaConfigured = DASHBOARD_UID.length > 0

  const dashboardUrl = useMemo(() => {
    if (!DASHBOARD_UID) return ""
    let url = `${GRAFANA_URL}/d/${DASHBOARD_UID}?theme=light&kiosk=tv`
    if (autoRefresh && refreshSeconds > 0) {
      url += `&refresh=${refreshSeconds}s`
    }
    return url
  }, [autoRefresh, refreshSeconds])

  const handleRefreshToggle = useCallback(() => {
    if (autoRefresh) {
      setAutoRefresh(false)
    } else {
      setAutoRefresh(true)
    }
  }, [autoRefresh])

  const renderTabContent = () => {
    if (!grafanaConfigured) {
      return (
        <NoConfigMessage>
          <h3>Grafana no configurado</h3>
          <p>
            Define <code>REACT_APP_GRAFANA_DASHBOARD_UID</code> en tu archivo .env
            para visualizar los dashboards.
          </p>
        </NoConfigMessage>
      )
    }

    switch (activeTab) {
      case "overview":
        return (
          <DashboardEmbedded>
            <GrafanaEmbed
              src={dashboardUrl}
              title="Dashboard Principal - ZeroSmoke Analytics"
            />
          </DashboardEmbedded>
        )
      case "research":
      case "alerts":
      case "heatmaps":
        return (
          <PlaceholderCard>
            <p style={{ margin: "0 0 8px", fontWeight: 600, color: AppColors.text }}>
              {tabs.find((t) => t.id === activeTab)?.label}
            </p>
            <p style={{ margin: 0 }}>
              Este módulo estará disponible próximamente.
              Los datos estarán disponibles a través de los dashboards de Grafana.
            </p>
          </PlaceholderCard>
        )
    }
  }

  return (
    <>
      <PageIntro>
        <h1>
          <BarChart3 size={28} />
          Analytics Avanzado
        </h1>
        <p>Panel de investigación y análisis de datos con integración Grafana</p>
        <StatusBadge $connected={grafanaConfigured}>
          {grafanaConfigured
            ? `Grafana conectado (${GRAFANA_URL})`
            : "Grafana no configurado"}
        </StatusBadge>
      </PageIntro>

      <TabBar>
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            $active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </TabButton>
        ))}
      </TabBar>

      <Toolbar>
        <ToolbarGroup />
        <ToolbarGroup>
          <RefreshButton
            $active={autoRefresh}
            onClick={handleRefreshToggle}
          >
            <RefreshCw size={14} />
            Auto-refresh
          </RefreshButton>
          {autoRefresh && (
            <SelectStyled
              value={refreshSeconds}
              onChange={(e) => setRefreshSeconds(Number(e.target.value))}
            >
              {refreshOptions
                .filter((o) => o.value > 0)
                .map((o) => (
                  <option key={o.value} value={o.value}>
                    Cada {o.label}
                  </option>
                ))}
            </SelectStyled>
          )}
        </ToolbarGroup>
      </Toolbar>

      {renderTabContent()}

      <SectionTitle>
        <BarChart3 size={22} />
        Centro de Investigación y Comportamiento
      </SectionTitle>

      <ResearchGrid>
        <ResearchCard>
          <ResearchCardIcon $color={AppColors.error}>
            <AlertTriangle size={20} />
          </ResearchCardIcon>
          <ResearchCardTitle>Análisis de Recaídas</ResearchCardTitle>
          <ResearchCardText>
            Monitoreo de patrones de recaída, frecuencia, cigarrillos consumidos
            y correlación con factores de riesgo. Identificación de momentos
            críticos y desencadenantes.
          </ResearchCardText>
        </ResearchCard>

        <ResearchCard>
          <ResearchCardIcon $color={AppColors.warning}>
            <Activity size={20} />
          </ResearchCardIcon>
          <ResearchCardTitle>Tendencias de Craving</ResearchCardTitle>
          <ResearchCardText>
            Evolución del craving promedio en el tiempo, mapas de calor por hora
            y día de la semana, distribución de intensidad y comparación
            entre usuarios.
          </ResearchCardText>
        </ResearchCard>

        <ResearchCard>
          <ResearchCardIcon $color={AppColors.primary}>
            <TrendingUp size={20} />
          </ResearchCardIcon>
          <ResearchCardTitle>Adherencia a Planes</ResearchCardTitle>
          <ResearchCardText>
            Porcentaje de completitud de planes personalizados, días de
            racha promedio, tasas de abandono por etapa y efectividad
            según perfil de usuario.
          </ResearchCardText>
        </ResearchCard>

        <ResearchCard>
          <ResearchCardIcon $color={AppColors.accent}>
            <Users size={20} />
          </ResearchCardIcon>
          <ResearchCardTitle>Comportamiento de Usuarios</ResearchCardTitle>
          <ResearchCardText>
            Segmentación por frecuencia de check-ins, síntomas reportados,
            estados de ánimo, horarios de mayor actividad y patrones de
            uso de la aplicación.
          </ResearchCardText>
        </ResearchCard>

        <ResearchCard>
          <ResearchCardIcon $color="#7A8F3E">
            <BarChart3 size={20} />
          </ResearchCardIcon>
          <ResearchCardTitle>Métricas Poblacionales</ResearchCardTitle>
          <ResearchCardText>
            Distribución demográfica, tasas de éxito por cohorte,
            comparativas entre grupos etarios, tendencias estacionales
            y agregaciones estadísticas.
          </ResearchCardText>
        </ResearchCard>
      </ResearchGrid>
    </>
  )
}

export default AnalyticsPage
