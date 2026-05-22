import type React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import styled from "styled-components"
import {
  Activity,
  AlertTriangle,
  Bell,
  LineChart as LineChartIcon,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { AppColors } from "../../styles/colors"
import AdminStatCard from "../../components/admin/AdminStatCard"
import AnalyticsChartCard from "../../components/admin/AnalyticsChartCard"
import ErrorState from "../../components/admin/ErrorState"
import LoadingState from "../../components/admin/LoadingState"
import adminStatsService, {
  AnalyticsFilters,
  AnalyticsGranularity,
  CheckinStats,
  CravingStats,
  NotificationStats,
  OverviewStats,
  UserStats,
} from "../../services/adminStatsService"

type RangeOption = 7 | 30 | 90

const PageIntro = styled.div`
  margin-bottom: 22px;

  h1 {
    color: ${AppColors.text};
    font-size: 28px;
    line-height: 1.2;
    margin: 0 0 6px;
  }

  p {
    color: ${AppColors.textSecondary};
    margin: 0;
  }
`

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 22px;
  flex-wrap: wrap;
`

const RangeGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`

const RangeButton = styled.button<{ active: boolean }>`
  border: 1px solid ${(props) => (props.active ? AppColors.primary : "rgba(0, 0, 0, 0.08)")};
  background: ${(props) => (props.active ? `${AppColors.primary}22` : AppColors.cardBackground)};
  color: ${(props) => (props.active ? AppColors.accent : AppColors.textSecondary)};
  border-radius: 8px;
  padding: 9px 12px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;

  &:hover {
    border-color: ${AppColors.primary};
    color: ${AppColors.accent};
  }
`

const RefreshButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: ${AppColors.cardBackground};
  color: ${AppColors.textSecondary};
  border-radius: 8px;
  padding: 9px 12px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 18px;
  margin-bottom: 24px;
`

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`

const RiskSection = styled.section`
  margin-top: 24px;
  background: ${AppColors.cardBackground};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
  align-items: center;

  svg {
    color: ${AppColors.warning};
  }
`

const RiskTitle = styled.h2`
  color: ${AppColors.text};
  font-size: 18px;
  margin: 0 0 4px;
`

const RiskText = styled.p`
  color: ${AppColors.textSecondary};
  margin: 0;
`

const EmptyState = styled.div`
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${AppColors.textSecondary};
  text-align: center;
`

const tooltipStyle = {
  border: "none",
  borderRadius: "8px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
}

const formatDateParam = (date: Date): string => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, "0")
  const day = `${date.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

const getFilters = (range: RangeOption): AnalyticsFilters => {
  const to = new Date()
  const from = new Date()
  from.setDate(to.getDate() - (range - 1))
  const granularity: AnalyticsGranularity = range === 90 ? "week" : "day"

  return {
    from: formatDateParam(from),
    to: formatDateParam(to),
    granularity,
  }
}

const formatNumber = (value: number): string => new Intl.NumberFormat("es-ES").format(value)

const hasData = (rows: Array<Record<string, unknown>>, keys: string[]): boolean => {
  return rows.some((row) => keys.some((key) => Number(row[key]) > 0))
}

const renderEmpty = () => <EmptyState>No hay datos para el rango seleccionado.</EmptyState>

const Dashboard: React.FC = () => {
  const [range, setRange] = useState<RangeOption>(30)
  const [overview, setOverview] = useState<OverviewStats | null>(null)
  const [usersStats, setUsersStats] = useState<UserStats | null>(null)
  const [checkinsStats, setCheckinsStats] = useState<CheckinStats | null>(null)
  const [cravingsStats, setCravingsStats] = useState<CravingStats | null>(null)
  const [notificationsStats, setNotificationsStats] = useState<NotificationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")

  const filters = useMemo(() => getFilters(range), [range])

  const loadStats = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError("")

      const [overviewData, usersData, checkinsData, cravingsData, notificationsData] = await Promise.all([
        adminStatsService.getOverview(),
        adminStatsService.getUsersStats(filters),
        adminStatsService.getCheckinsStats(filters),
        adminStatsService.getCravingsStats(filters),
        adminStatsService.getNotificationsStats(filters),
      ])

      setOverview(overviewData)
      setUsersStats(usersData)
      setCheckinsStats(checkinsData)
      setCravingsStats(cravingsData)
      setNotificationsStats(notificationsData)
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "No se pudieron cargar las metricas del panel administrativo."
      setError(message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [filters])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const stats = overview
    ? [
        { label: "Usuarios Totales", value: formatNumber(overview.totalUsers), icon: <Users size={22} /> },
        { label: "Usuarios Activos", value: formatNumber(overview.activeUsers), icon: <Activity size={22} /> },
        { label: "Check-ins Hoy", value: formatNumber(overview.todayCheckins), icon: <LineChartIcon size={22} /> },
        { label: "Craving Promedio", value: overview.averageCraving.toFixed(2), icon: <TrendingUp size={22} /> },
        { label: "Recaidas Hoy", value: formatNumber(overview.relapsesToday), icon: <AlertTriangle size={22} /> },
        { label: "Push Enviadas", value: formatNumber(overview.notificationsSent), icon: <Bell size={22} /> },
        { label: "Alto Riesgo", value: formatNumber(overview.highRiskUsers), icon: <AlertTriangle size={22} /> },
      ]
    : []

  if (loading) {
    return <LoadingState message="Cargando analytics del panel..." />
  }

  if (error) {
    return (
      <>
        <PageIntro>
          <h1>Dashboard Analytics</h1>
          <p>Panel administrativo de metricas ZeroSmoke</p>
        </PageIntro>
        <ErrorState message={error} />
      </>
    )
  }

  return (
    <>
      <PageIntro>
        <h1>Dashboard Analytics</h1>
        <p>Panel administrativo de metricas ZeroSmoke</p>
      </PageIntro>

      <Toolbar>
        <RangeGroup>
          <RangeButton active={range === 7} onClick={() => setRange(7)}>
            Ultimos 7 dias
          </RangeButton>
          <RangeButton active={range === 30} onClick={() => setRange(30)}>
            Ultimos 30 dias
          </RangeButton>
          <RangeButton active={range === 90} onClick={() => setRange(90)}>
            Ultimos 90 dias
          </RangeButton>
        </RangeGroup>
        <RefreshButton onClick={() => loadStats(true)} disabled={refreshing}>
          <RefreshCw size={16} />
          {refreshing ? "Actualizando" : "Actualizar"}
        </RefreshButton>
      </Toolbar>

      <StatsGrid>
        {stats.map((stat) => (
          <AdminStatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} />
        ))}
      </StatsGrid>

      <ChartsGrid>
        <AnalyticsChartCard title="Usuarios registrados">
          {usersStats && hasData(usersStats.series, ["registeredUsers"]) ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usersStats.series}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="registeredUsers"
                  name="Registrados"
                  stroke={AppColors.accent}
                  fill={AppColors.primary}
                  fillOpacity={0.25}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            renderEmpty()
          )}
        </AnalyticsChartCard>

        <AnalyticsChartCard title="Check-ins diarios">
          {checkinsStats && hasData(checkinsStats.series, ["checkins"]) ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={checkinsStats.series}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="checkins"
                  name="Check-ins"
                  stroke="#5F8FA3"
                  fill={AppColors.secondary}
                  fillOpacity={0.28}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            renderEmpty()
          )}
        </AnalyticsChartCard>

        <AnalyticsChartCard title="Craving promedio">
          {cravingsStats && hasData(cravingsStats.series, ["events"]) ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cravingsStats.series}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="averageCraving"
                  name="Craving promedio"
                  stroke={AppColors.warning}
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            renderEmpty()
          )}
        </AnalyticsChartCard>

        <AnalyticsChartCard title="Notificaciones enviadas">
          {notificationsStats && hasData(notificationsStats.series, ["sent"]) ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={notificationsStats.series}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="sent"
                  name="Enviadas"
                  stroke="#7A8F3E"
                  fill={AppColors.tertiary}
                  fillOpacity={0.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            renderEmpty()
          )}
        </AnalyticsChartCard>
      </ChartsGrid>

      <RiskSection>
        <AlertTriangle size={28} />
        <div>
          <RiskTitle>Usuarios de Alto Riesgo</RiskTitle>
          <RiskText>
            {overview?.highRiskUsers
              ? `${formatNumber(overview.highRiskUsers)} usuario(s) detectado(s) con riesgo alto hoy.`
              : "No hay usuarios con riesgo alto detectado hoy."}
          </RiskText>
        </div>
      </RiskSection>
    </>
  )
}

export default Dashboard
