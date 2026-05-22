import type React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import styled from "styled-components"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Download,
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
  HighRiskUser,
  NotificationStats,
  OverviewStats,
  RelapseStats,
  ResearchStats,
  SymptomStats,
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

const DownloadLinkButton = styled.button`
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

  &:hover {
    border-color: ${AppColors.primary};
    color: ${AppColors.accent};
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

const SectionCard = styled.div`
  background: ${AppColors.cardBackground};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`

const SectionTitle = styled.h2`
  color: ${AppColors.text};
  font-size: 18px;
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`

const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;

  th {
    text-align: left;
    padding: 10px 8px;
    font-weight: 600;
    color: ${AppColors.textSecondary};
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }

  td {
    padding: 10px 8px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
    color: ${AppColors.text};
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover td {
    background-color: rgba(0, 0, 0, 0.02);
  }
`

const RiskBadge = styled.span<{ $score: number }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${(p) =>
    p.$score >= 70 ? "rgba(229, 115, 115, 0.2)" : p.$score >= 40 ? "rgba(255, 183, 77, 0.2)" : "rgba(76, 175, 80, 0.2)"};
  color: ${(p) =>
    p.$score >= 70 ? AppColors.error : p.$score >= 40 ? AppColors.warning : AppColors.success};
`

const CravingIndicator = styled.span<{ $level: number }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &::before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${(p) =>
      p.$level >= 7 ? AppColors.error : p.$level >= 4 ? AppColors.warning : AppColors.success};
  }
`

const SymptomBar = styled.div<{ $width: number }>`
  height: 6px;
  border-radius: 3px;
  background: ${AppColors.primary};
  width: ${(p) => Math.min(p.$width, 100)}%;
  transition: width 0.3s ease;
`

const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-top: 24px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`

const MiniStat = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: ${AppColors.background};
  border-radius: 6px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`

const MiniStatLabel = styled.span`
  color: ${AppColors.textSecondary};
  font-size: 0.85rem;
`

const MiniStatValue = styled.span`
  color: ${AppColors.text};
  font-weight: 600;
`

const ResearchHeader = styled.div`
  margin-top: 32px;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 10px;

  h2 {
    color: ${AppColors.text};
    font-size: 22px;
    margin: 0;
  }

  svg {
    color: ${AppColors.accent};
  }
`

const AdherenceBar = styled.div<{ $width: number }>`
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(90deg, ${AppColors.primary}, ${AppColors.accent});
  width: ${(p) => Math.min(p.$width, 100)}%;
  transition: width 0.5s ease;
`

const AdherenceTrack = styled.div`
  height: 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.06);
  margin-top: 4px;
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
  const [highRiskUsers, setHighRiskUsers] = useState<HighRiskUser[]>([])
  const [symptomsStats, setSymptomsStats] = useState<SymptomStats | null>(null)
  const [relapseStats, setRelapseStats] = useState<RelapseStats | null>(null)
  const [researchStats, setResearchStats] = useState<ResearchStats | null>(null)
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

      const [overviewData, usersData, checkinsData, cravingsData, notificationsData, highRiskData, symptomsData, relapsesData, researchData] =
        await Promise.all([
          adminStatsService.getOverview(),
          adminStatsService.getUsersStats(filters),
          adminStatsService.getCheckinsStats(filters),
          adminStatsService.getCravingsStats(filters),
          adminStatsService.getNotificationsStats(filters),
          adminStatsService.getHighRiskUsers(),
          adminStatsService.getSymptomsStats(filters),
          adminStatsService.getRelapseStats(filters),
          adminStatsService.getResearchStats(filters),
        ])

      setOverview(overviewData)
      setUsersStats(usersData)
      setCheckinsStats(checkinsData)
      setCravingsStats(cravingsData)
      setNotificationsStats(notificationsData)
      setHighRiskUsers(highRiskData)
      setSymptomsStats(symptomsData)
      setRelapseStats(relapsesData)
      setResearchStats(researchData)
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
        <DownloadLinkButton onClick={() => adminStatsService.downloadCheckinsCSV()}>
          <Download size={16} />
          Exportar CSV
        </DownloadLinkButton>
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

      <Grid2>
        <SectionCard>
          <SectionTitle>Síntomas más frecuentes</SectionTitle>
          {symptomsStats && symptomsStats.breakdown.length > 0 ? (
            <div>
              <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                <MiniStat style={{ flex: 1 }}>
                  <MiniStatLabel>Total reportes</MiniStatLabel>
                  <MiniStatValue>{formatNumber(symptomsStats.totalSymptoms)}</MiniStatValue>
                </MiniStat>
                <MiniStat style={{ flex: 1 }}>
                  <MiniStatLabel>Síntomas únicos</MiniStatLabel>
                  <MiniStatValue>{symptomsStats.uniqueSymptoms}</MiniStatValue>
                </MiniStat>
                <MiniStat style={{ flex: 1 }}>
                  <MiniStatLabel>Usuarios afectados</MiniStatLabel>
                  <MiniStatValue>{formatNumber(symptomsStats.affectedUsers)}</MiniStatValue>
                </MiniStat>
              </div>
              <DataTable>
                <thead>
                  <tr>
                    <th>Síntoma</th>
                    <th>Frecuencia</th>
                    <th>Usuarios</th>
                    <th>%</th>
                  </tr>
                </thead>
                <tbody>
                  {symptomsStats.breakdown.slice(0, 8).map((s) => {
                    const pct = (s.count / symptomsStats.totalSymptoms) * 100
                    return (
                      <tr key={s.symptom}>
                        <td style={{ textTransform: "capitalize" }}>{s.symptom}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <SymptomBar $width={pct} />
                            <span>{s.count}</span>
                          </div>
                        </td>
                        <td>{s.uniqueUsers}</td>
                        <td>{pct.toFixed(1)}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </DataTable>
            </div>
          ) : (
            <EmptyState style={{ height: 120 }}>
              Sin datos de síntomas en el rango seleccionado.
            </EmptyState>
          )}
        </SectionCard>

        <SectionCard>
          <SectionTitle>Usuarios de mayor riesgo</SectionTitle>
          {highRiskUsers.length > 0 ? (
            <DataTable>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Score</th>
                  <th>Craving</th>
                  <th>Factores</th>
                </tr>
              </thead>
              <tbody>
                {highRiskUsers.slice(0, 8).map((u) => (
                  <tr key={u._id}>
                    <td style={{ maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {u.name}
                    </td>
                    <td>
                      <RiskBadge $score={u.riskScore}>{u.riskScore}</RiskBadge>
                    </td>
                    <td>
                      <CravingIndicator $level={u.cravingLevel}>
                        {u.cravingLevel.toFixed(1)}
                      </CravingIndicator>
                    </td>
                    <td style={{ fontSize: "0.75rem", maxWidth: 160 }}>
                      {u.factors.slice(0, 2).join(", ")}
                      {u.factors.length > 2 && ` +${u.factors.length - 2}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          ) : (
            <EmptyState style={{ height: 120 }}>
              No hay usuarios con riesgo alto registrados.
            </EmptyState>
          )}
        </SectionCard>
      </Grid2>

      <Grid2>
        <SectionCard>
          <SectionTitle>Recaídas recientes</SectionTitle>
          {relapseStats && relapseStats.series.length > 0 ? (
            <div>
              <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                <MiniStat style={{ flex: 1 }}>
                  <MiniStatLabel>Total recaídas</MiniStatLabel>
                  <MiniStatValue>{formatNumber(relapseStats.summary.totalRelapses)}</MiniStatValue>
                </MiniStat>
                <MiniStat style={{ flex: 1 }}>
                  <MiniStatLabel>Cigarrillos</MiniStatLabel>
                  <MiniStatValue>{formatNumber(relapseStats.summary.totalCigarettes)}</MiniStatValue>
                </MiniStat>
                <MiniStat style={{ flex: 1 }}>
                  <MiniStatLabel>Usuarios</MiniStatLabel>
                  <MiniStatValue>{formatNumber(relapseStats.summary.affectedUsers)}</MiniStatValue>
                </MiniStat>
              </div>
              <DataTable>
                <thead>
                  <tr>
                    <th>Período</th>
                    <th>Recaídas</th>
                    <th>Cigarrillos</th>
                    <th>Usuarios</th>
                  </tr>
                </thead>
                <tbody>
                  {relapseStats.series.slice(-10).reverse().map((s) => (
                    <tr key={s.period}>
                      <td>{s.period}</td>
                      <td>{s.relapses}</td>
                      <td>{s.cigarettesSmoked}</td>
                      <td>{s.uniqueUsers}</td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            </div>
          ) : (
            <EmptyState style={{ height: 120 }}>
              No hay recaídas registradas en el rango seleccionado.
            </EmptyState>
          )}
        </SectionCard>

        <SectionCard>
          <SectionTitle>Actividad reciente</SectionTitle>
          {checkinsStats && checkinsStats.series.length > 0 ? (
            <div>
              <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                <MiniStat style={{ flex: 1 }}>
                  <MiniStatLabel>Check-ins totales</MiniStatLabel>
                  <MiniStatValue>{formatNumber(checkinsStats.summary.totalCheckins)}</MiniStatValue>
                </MiniStat>
                <MiniStat style={{ flex: 1 }}>
                  <MiniStatLabel>Usuarios únicos</MiniStatLabel>
                  <MiniStatValue>{formatNumber(checkinsStats.summary.uniqueUsers)}</MiniStatValue>
                </MiniStat>
                <MiniStat style={{ flex: 1 }}>
                  <MiniStatLabel>Craving promedio</MiniStatLabel>
                  <MiniStatValue>{checkinsStats.summary.averageCraving.toFixed(2)}</MiniStatValue>
                </MiniStat>
              </div>
              <DataTable>
                <thead>
                  <tr>
                    <th>Período</th>
                    <th>Check-ins</th>
                    <th>Usuarios</th>
                    <th>Recaídas</th>
                  </tr>
                </thead>
                <tbody>
                  {checkinsStats.series.slice(-10).reverse().map((s) => (
                    <tr key={s.period}>
                      <td>{s.period}</td>
                      <td>{s.checkins}</td>
                      <td>{s.uniqueUsers}</td>
                      <td>
                        <span style={{ color: s.relapses > 0 ? AppColors.error : AppColors.text }}>
                          {s.relapses}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            </div>
          ) : (
            <EmptyState style={{ height: 120 }}>
              No hay actividad registrada en el rango seleccionado.
            </EmptyState>
          )}
        </SectionCard>
      </Grid2>

      <ResearchHeader>
        <BarChart3 size={24} />
        <h2>Investigación y Comportamiento</h2>
      </ResearchHeader>

      <Grid2>
        <SectionCard>
          <SectionTitle>Adherencia a Planes</SectionTitle>
          {researchStats && researchStats.planAdherence.length > 0 ? (
            <DataTable>
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Usuarios</th>
                  <th>Completado</th>
                  <th>Día promedio</th>
                </tr>
              </thead>
              <tbody>
                {researchStats.planAdherence.map((p) => (
                  <tr key={p.status}>
                    <td style={{ textTransform: "capitalize" }}>{p.status}</td>
                    <td>{p.count}</td>
                    <td>
                      <div>{p.averageCompletion.toFixed(1)}%</div>
                      <AdherenceTrack>
                        <AdherenceBar $width={p.averageCompletion} />
                      </AdherenceTrack>
                    </td>
                    <td>{p.averageCurrentDay}</td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          ) : (
            <EmptyState style={{ height: 100 }}>Sin datos de adherencia.</EmptyState>
          )}
        </SectionCard>

        <SectionCard>
          <SectionTitle>Usuarios más activos</SectionTitle>
          {researchStats && researchStats.mostActiveUsers.length > 0 ? (
            <DataTable>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Usuario</th>
                  <th>Check-ins</th>
                  <th>Último</th>
                </tr>
              </thead>
              <tbody>
                {researchStats.mostActiveUsers.map((u, i) => (
                  <tr key={u.id}>
                    <td>{i + 1}</td>
                    <td style={{ maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {u.name}
                    </td>
                    <td>{u.checkins}</td>
                    <td style={{ fontSize: "0.8rem" }}>
                      {u.lastCheckin ? new Date(u.lastCheckin).toLocaleDateString("es-ES") : "--"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          ) : (
            <EmptyState style={{ height: 100 }}>Sin datos de actividad.</EmptyState>
          )}
        </SectionCard>
      </Grid2>

      <Grid2>
        <SectionCard>
          <SectionTitle>Tendencia semanal</SectionTitle>
          {researchStats && researchStats.weeklyTrend.length > 0 ? (
            <DataTable>
              <thead>
                <tr>
                  <th>Semana</th>
                  <th>Craving prom.</th>
                  <th>Check-ins</th>
                  <th>Recaídas</th>
                </tr>
              </thead>
              <tbody>
                {researchStats.weeklyTrend.slice(-8).map((w) => (
                  <tr key={w.period}>
                    <td style={{ fontSize: "0.8rem" }}>{w.period}</td>
                    <td>
                      <CravingIndicator $level={w.avgCraving}>{w.avgCraving.toFixed(1)}</CravingIndicator>
                    </td>
                    <td>{w.checkins}</td>
                    <td>
                      <span style={{ color: w.relapses > 0 ? AppColors.error : AppColors.text }}>{w.relapses}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          ) : (
            <EmptyState style={{ height: 100 }}>Sin tendencia disponible.</EmptyState>
          )}
        </SectionCard>

        <SectionCard>
          <SectionTitle>Indicadores de investigación</SectionTitle>
          {checkinsStats && relapseStats && researchStats ? (
            <div>
              <MiniStat>
                <MiniStatLabel>Craving promedio (total)</MiniStatLabel>
                <MiniStatValue>{checkinsStats.summary.averageCraving.toFixed(2)} / 10</MiniStatValue>
              </MiniStat>
              <MiniStat>
                <MiniStatLabel>Porcentaje de recaídas</MiniStatLabel>
                <MiniStatValue>
                  {checkinsStats.summary.totalCheckins > 0
                    ? `${((relapseStats.summary.totalRelapses / checkinsStats.summary.totalCheckins) * 100).toFixed(1)}%`
                    : "0%"}
                </MiniStatValue>
              </MiniStat>
              <MiniStat>
                <MiniStatLabel>Usuarios con plan activo</MiniStatLabel>
                <MiniStatValue>
                  {researchStats.planAdherence.find((p) => p.status === "active")?.count || 0}
                </MiniStatValue>
              </MiniStat>
              <MiniStat>
                <MiniStatLabel>Planes completados</MiniStatLabel>
                <MiniStatValue>
                  {researchStats.planAdherence.find((p) => p.status === "completed")?.count || 0}
                </MiniStatValue>
              </MiniStat>
              <MiniStat>
                <MiniStatLabel>Completado promedio</MiniStatLabel>
                <MiniStatValue>
                  {researchStats.planAdherence.length > 0
                    ? `${(
                        researchStats.planAdherence.reduce((s, p) => s + p.averageCompletion, 0) /
                        researchStats.planAdherence.length
                      ).toFixed(1)}%`
                    : "0%"}
                </MiniStatValue>
              </MiniStat>
              <MiniStat>
                <MiniStatLabel>Usuarios con craving alto (≥7)</MiniStatLabel>
                <MiniStatValue>{cravingsStats?.summary.highCravingEvents || 0}</MiniStatValue>
              </MiniStat>
            </div>
          ) : (
            <EmptyState style={{ height: 100 }}>Sin indicadores disponibles.</EmptyState>
          )}
        </SectionCard>
      </Grid2>
    </>
  )
}

export default Dashboard
