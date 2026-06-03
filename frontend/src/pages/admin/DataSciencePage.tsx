import type React from "react"
import { useEffect, useState } from "react"
import styled from "styled-components"
import { TrendingUp, AlertCircle, RefreshCw } from "lucide-react"
import {
  CartesianGrid,
  Legend,
  Line,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ComposedChart,
} from "recharts"
import { AppColors } from "../../styles/colors"
import LoadingState from "../../components/admin/LoadingState"
import Button from "../../components/ui/Button"
import adminStatsService, { type LinearRegressionResult } from "../../services/adminStatsService"

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
  justify-content: flex-end;
  margin-bottom: 22px;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  padding: 20px;
  display: flex;
  flex-direction: column;
`

const StatLabel = styled.span`
  font-size: 0.8rem;
  color: ${AppColors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`

const StatValue = styled.span`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${AppColors.text};
`

const StatSub = styled.span`
  font-size: 0.85rem;
  color: ${AppColors.textSecondary};
  margin-top: 4px;
`

const EquationCard = styled(StatCard)`
  grid-column: 1 / -1;
`

const EquationText = styled.code`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${AppColors.primary};
  background: #f0fdf4;
  padding: 12px 16px;
  border-radius: 8px;
  display: inline-block;
  margin-bottom: 8px;
`

const ChartCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  padding: 24px;
  margin-bottom: 24px;
`

const ChartTitle = styled.h3`
  font-size: 1.1rem;
  color: ${AppColors.text};
  margin: 0 0 16px;
  font-weight: 600;
`

const ErrorBox = styled.div`
  background: rgba(240, 138, 132, 0.12);
  border: 1px solid rgba(240, 138, 132, 0.28);
  border-radius: 8px;
  padding: 18px;
  color: ${AppColors.error};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${AppColors.textSecondary};
  h3 {
    font-size: 1.2rem;
    margin: 12px 0 6px;
  }
  p {
    margin: 0;
    font-size: 0.9rem;
  }
`

const DataSciencePage: React.FC = () => {
  const [data, setData] = useState<LinearRegressionResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await adminStatsService.getLinearRegression()
      setData(result)
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) return <LoadingState />
  if (error)
    return (
      <ErrorBox>
        <span>{error}</span>
        <Button variant="outline" size="small" onClick={fetchData}>
          <RefreshCw size={16} style={{ marginRight: 6 }} /> Reintentar
        </Button>
      </ErrorBox>
    )

  const scatterData =
    data?.points?.map((p) => ({
      cravingLevel: p.cravingLevel,
      relapseRisk: p.relapseRisk,
    })) || []

  const regressionLine =
    data?.predictions?.map((p) => ({
      cravingLevel: p.cravingLevel,
      predicted: p.predicted,
    })) || []

  const merged = scatterData.map((pt) => {
    const match = regressionLine.find((r) => r.cravingLevel === pt.cravingLevel)
    return { ...pt, predicted: match?.predicted }
  })

  return (
    <div>
      <PageIntro>
        <h1>Ciencia de Datos</h1>
        <p>Regresión Lineal: cravingLevel vs relapseRisk</p>
      </PageIntro>

      <Toolbar>
        <Button variant="outline" size="small" onClick={fetchData}>
          <RefreshCw size={16} style={{ marginRight: 6 }} /> Actualizar
        </Button>
      </Toolbar>

      <Grid>
        <StatCard>
          <StatLabel><TrendingUp size={14} style={{ marginRight: 4, verticalAlign: -2 }} /> Pendiente</StatLabel>
          <StatValue>{data?.slope?.toFixed(4) ?? "—"}</StatValue>
          <StatSub>cambio en riesgo por unidad de craving</StatSub>
        </StatCard>
        <StatCard>
          <StatLabel>Intercepto</StatLabel>
          <StatValue>{data?.intercept?.toFixed(4) ?? "—"}</StatValue>
          <StatSub>riesgo estimado con craving = 0</StatSub>
        </StatCard>
        <StatCard>
          <StatLabel>R²</StatLabel>
          <StatValue>{(data?.r2 != null ? (data.r2 * 100).toFixed(1) : "—") + "%"}</StatValue>
          <StatSub>{data?.r2 != null ? (data.r2 >= 0.7 ? "Ajuste fuerte" : data.r2 >= 0.4 ? "Ajuste moderado" : "Ajuste débil") : ""}</StatSub>
        </StatCard>
        <StatCard>
          <StatLabel>MAE</StatLabel>
          <StatValue>{data?.mae?.toFixed(2) ?? "—"}</StatValue>
          <StatSub>error absoluto medio</StatSub>
        </StatCard>
        <StatCard>
          <StatLabel>RMSE</StatLabel>
          <StatValue>{data?.rmse?.toFixed(2) ?? "—"}</StatValue>
          <StatSub>raíz del error cuadrático medio</StatSub>
        </StatCard>
        <StatCard>
          <StatLabel>Registros</StatLabel>
          <StatValue>{data?.datasetSize ?? "—"}</StatValue>
          <StatSub>puntos en el dataset</StatSub>
        </StatCard>

        <EquationCard>
          <StatLabel>Ecuación de Regresión</StatLabel>
          <EquationText>{data?.equation ?? "—"}</EquationText>
          <StatSub>
            Y = relapseRisk &nbsp;|&nbsp; X = cravingLevel (0-10)
          </StatSub>
        </EquationCard>
      </Grid>

      {scatterData.length > 0 ? (
        <ChartCard>
          <ChartTitle>Dispersión: cravingLevel vs relapseRisk</ChartTitle>
          <ResponsiveContainer width="100%" height={420}>
            <ComposedChart
              data={merged}
              margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis
                dataKey="cravingLevel"
                type="number"
                domain={[0, 10]}
                label={{ value: "Craving Level", position: "insideBottomRight", offset: -5 }}
                tickCount={11}
              />
              <YAxis
                type="number"
                domain={[0, 100]}
                label={{ value: "Relapse Risk", angle: -90, position: "insideLeft", offset: 10 }}
              />
              <Tooltip />
              <Legend />
              <Scatter
                name="Datos reales"
                dataKey="relapseRisk"
                fill={AppColors.primary}
                stroke="none"
                r={4}
              />
              <Line
                name="Línea de regresión"
                dataKey="predicted"
                stroke="#dc2626"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      ) : (
        <EmptyState>
          <AlertCircle size={40} />
          <h3>Sin datos suficientes</h3>
          <p>Se necesitan al menos 3 registros con cravingLevel para generar el modelo.</p>
        </EmptyState>
      )}
    </div>
  )
}

export default DataSciencePage
