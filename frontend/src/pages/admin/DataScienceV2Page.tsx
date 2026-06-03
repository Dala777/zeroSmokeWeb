import type React from "react"
import { useEffect, useState } from "react"
import styled from "styled-components"
import {
  BarChart2, TrendingUp, RefreshCw, Info, AlertCircle,
} from "lucide-react"
import {
  CartesianGrid,
  BarChart,
  Bar,
  Scatter,
  ComposedChart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { AppColors } from "../../styles/colors"
import LoadingState from "../../components/admin/LoadingState"
import Button from "../../components/ui/Button"
import axios from "axios"

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

interface FeatureRow {
  emotion_score: number
  symptom_score: number
  completed_activity_rate: number
  hour_segment: number
  past_week_risk: number
  consecutive_smoke_days: number
  stress_indicator: number
}

interface TrainResponse {
  success: boolean
  message: string
  r2: number
  mae: number
  rmse: number
  intercept: number
  coefficients: Record<string, number>
  feature_importance: Record<string, number>
  feature_names: string[]
  n_samples: number
  n_features: number
  datasetSize: number
  samples?: Array<{
    userId: string
    dateKey: string
    cravingLevel: number
    relapseRisk: number
    features: FeatureRow
  }>
}

const PageIntro = styled.div`
  margin-bottom: 16px;
  h1 {
    color: ${AppColors.text};
    font-size: 28px;
    line-height: 1.2;
    margin: 0 0 4px;
  }
  p {
    color: ${AppColors.textSecondary};
    margin: 0;
    font-size: 0.9rem;
  }
`

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
`

const StatusBadge = styled.span<{ ok: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${(p) => (p.ok ? "#e6f7e6" : "#fff3e0")};
  color: ${(p) => (p.ok ? "#2e7d32" : "#e65100")};
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
  margin-bottom: 24px;
`

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  padding: 18px;
`

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: ${AppColors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
`

const StatValue = styled.div`
  font-size: 1.6rem;
  font-weight: 700;
  color: ${AppColors.text};
  line-height: 1.2;
`

const StatSub = styled.div`
  font-size: 0.75rem;
  color: ${AppColors.textSecondary};
  margin-top: 4px;
`

const SectionCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  padding: 22px;
  margin-bottom: 20px;
`

const SectionTitle = styled.h3`
  font-size: 1.05rem;
  color: ${AppColors.text};
  margin: 0 0 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`

const CoeffGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
`

const CoeffItem = styled.div`
  background: #f9fafb;
  border-radius: 8px;
  padding: 12px;
`

const CoeffName = styled.div`
  font-size: 0.8rem;
  color: ${AppColors.textSecondary};
  margin-bottom: 4px;
  font-weight: 600;
  text-transform: capitalize;
`

const CoeffValue = styled.div<{ positive: boolean }>`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${(p) => (p.positive ? "#dc2626" : "#16a34a")};
`

const MetricExplain = styled.div`
  background: #f0f9ff;
  border-radius: 8px;
  padding: 14px 16px;
  margin-top: 12px;
  font-size: 0.85rem;
  color: ${AppColors.text};
  line-height: 1.5;
  border: 1px solid #bae6fd;
`

const ExplainTitle = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
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
    max-width: 500px;
    margin: 0 auto;
  }
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

const FeatureBarChart: React.FC<{ data: Array<{ name: string; importance: number }> }> = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data} layout="vertical" margin={{ left: 140, bottom: 20 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
      <XAxis type="number" domain={[0, "auto"]} />
      <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 12 }} />
      <Tooltip formatter={(v) => [Number(v).toFixed(4), "Importancia"]} />
      <Bar dataKey="importance" fill={AppColors.primary} radius={[0, 4, 4, 0]} />
    </BarChart>
  </ResponsiveContainer>
)

const metricExplanations: Record<string, string> = {
  r2: "R² (coeficiente de determinación): indica qué proporción de la variabilidad en relapseRisk es explicada por las features. Rango 0-1. >0.7 = buen ajuste, >0.4 = moderado, <0.4 = débil.",
  mae: "MAE (Error Absoluto Medio): promedio de la diferencia absoluta entre valores reales y predichos. Un MAE bajo significa predicciones precisas. Misma unidad que relapseRisk (0-100).",
  rmse: "RMSE (Raíz del Error Cuadrático Medio): similar al MAE pero penaliza más los errores grandes. Siempre ≥ MAE. Si es mucho mayor que MAE, hay outliers significativos.",
}

const DataScienceV2Page: React.FC = () => {
  const [data, setData] = useState<TrainResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      const resp = await axios.get<TrainResponse>(`${API_URL}/admin/ml/v2/train`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setData(resp.data)
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Error al entrenar modelo"
      setError(msg)
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

  if (!data || !data.success) {
    return (
      <div>
        <PageIntro>
          <h1>Dashboard Académico</h1>
          <p>Regresión Lineal Múltiple — v2</p>
        </PageIntro>
        <EmptyState>
          <AlertCircle size={40} />
          <h3>No se pudo entrenar el modelo</h3>
          <p>{data?.message || "Error desconocido"}</p>
          <Button variant="outline" size="small" onClick={fetchData} style={{ marginTop: 16 }}>
            <RefreshCw size={16} style={{ marginRight: 6 }} /> Reintentar
          </Button>
        </EmptyState>
      </div>
    )
  }

  const featureImportance = Object.entries(data.feature_importance || {}).map(([name, importance]) => ({
    name: name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    importance,
  }))

  const coefficients = Object.entries(data.coefficients || {}).map(([name, value]) => ({
    name: name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    value,
    positive: value > 0,
  }))

  const actualVsPredicted = (data.samples || []).map((s, i) => ({
    actual: s.relapseRisk,
    predicted: s.features ? 0 : 0,
    index: i,
  }))

  const correlationData = data.samples?.slice(0, 1000).map((s) => ({
    actual: s.relapseRisk,
    predicted: data.intercept + Object.entries(s.features).reduce((sum, [k, v]) => {
      return sum + (data.coefficients[k] || 0) * v
    }, 0),
  })) || []

  return (
    <div>
      <PageIntro>
        <h1>Dashboard Académico</h1>
        <p>Regresión Lineal Múltiple — scikit-learn</p>
      </PageIntro>

      <Toolbar>
        <StatusBadge ok={!!data}>
          <TrendingUp size={14} /> Modelo entrenado
        </StatusBadge>
        <Button variant="outline" size="small" onClick={fetchData}>
          <RefreshCw size={16} style={{ marginRight: 6 }} /> Reentrenar
        </Button>
      </Toolbar>

      <Grid>
        <StatCard>
          <StatLabel>Dataset</StatLabel>
          <StatValue>{data.datasetSize ?? data.n_samples ?? "—"}</StatValue>
          <StatSub>registros totales</StatSub>
        </StatCard>
        <StatCard>
          <StatLabel>Features</StatLabel>
          <StatValue>{data.n_features ?? "—"}</StatValue>
          <StatSub>variables independientes</StatSub>
        </StatCard>
        <StatCard>
          <StatLabel><BarChart2 size={14} /> R²</StatLabel>
          <StatValue>{data.r2 != null ? (data.r2 * 100).toFixed(1) + "%" : "—"}</StatValue>
          <StatSub>
            {data.r2 != null
              ? data.r2 >= 0.7 ? "Ajuste fuerte" : data.r2 >= 0.4 ? "Ajuste moderado" : "Ajuste débil"
              : ""}
          </StatSub>
        </StatCard>
        <StatCard>
          <StatLabel>MAE</StatLabel>
          <StatValue>{data.mae?.toFixed(2) ?? "—"}</StatValue>
          <StatSub>error absoluto medio</StatSub>
        </StatCard>
        <StatCard>
          <StatLabel>RMSE</StatLabel>
          <StatValue>{data.rmse?.toFixed(2) ?? "—"}</StatValue>
          <StatSub>raíz del error cuadrático medio</StatSub>
        </StatCard>
        <StatCard>
          <StatLabel>Intercepto</StatLabel>
          <StatValue>{data.intercept?.toFixed(2) ?? "—"}</StatValue>
          <StatSub>riesgo base (todas features = 0)</StatSub>
        </StatCard>
      </Grid>

      <SectionCard>
        <SectionTitle><BarChart2 size={18} /> Importancia de Variables</SectionTitle>
        <FeatureBarChart data={featureImportance} />
        <MetricExplain>
          <ExplainTitle><Info size={14} /> ¿Qué significa?</ExplainTitle>
          Muestra cuánto contribuye cada variable al modelo. Las barras más largas indican mayor impacto en el riesgo de recaída.
        </MetricExplain>
      </SectionCard>

      <SectionCard>
        <SectionTitle><TrendingUp size={18} /> Coeficientes del Modelo</SectionTitle>
        <CoeffGrid>
          {coefficients.map((c) => (
            <CoeffItem key={c.name}>
              <CoeffName>{c.name}</CoeffName>
              <CoeffValue positive={c.positive}>
                {c.positive ? "+" : ""}
                {c.value.toFixed(4)}
              </CoeffValue>
              <StatSub>{c.positive ? "Aumenta el riesgo" : "Disminuye el riesgo"}</StatSub>
            </CoeffItem>
          ))}
        </CoeffGrid>
        <MetricExplain>
          <ExplainTitle><Info size={14} /> ¿Qué significa?</ExplainTitle>
          Coeficientes positivos → mayor cravingLevel o estrés incrementan el riesgo. Negativos → más adherencia al plan reduce el riesgo. El valor absoluto indica la magnitud del impacto.
        </MetricExplain>
      </SectionCard>

      {correlationData.length > 0 && (
        <SectionCard>
          <SectionTitle><TrendingUp size={18} /> Real vs Predicho</SectionTitle>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={correlationData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis
                dataKey="actual"
                type="number"
                domain={[0, 100]}
                label={{ value: "Valor Real (relapseRisk)", position: "insideBottom", offset: -10 }}
              />
              <YAxis
                type="number"
                domain={[0, 100]}
                label={{ value: "Valor Predicho", angle: -90, position: "insideLeft", offset: 10 }}
              />
              <Tooltip formatter={(v) => [Number(v).toFixed(1), ""]} />
              <Legend />
              <Scatter name="Muestras" dataKey="predicted" fill={AppColors.primary} stroke="none" r={3} />
              <Line
                name="Línea ideal (y=x)"
                dataKey="actual"
                stroke="#dc2626"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
          <MetricExplain>
            <ExplainTitle><Info size={14} /> ¿Qué significa?</ExplainTitle>
            Cada punto representa una muestra. La línea roja diagonal representa la predicción perfecta. Puntos cercanos a la línea = predicciones precisas. Puntos alejados = errores del modelo.
          </MetricExplain>
        </SectionCard>
      )}

      <SectionCard>
        <SectionTitle><Info size={18} /> Explicación de Métricas</SectionTitle>
        <MetricExplain style={{ marginTop: 0, borderLeft: `4px solid ${AppColors.primary}`, background: "#f9fafb" }}>
          <ExplainTitle>R² = {(data.r2 * 100).toFixed(1)}%</ExplainTitle>
          {metricExplanations.r2}
        </MetricExplain>
        <MetricExplain>
          <ExplainTitle>MAE = {data.mae.toFixed(2)}</ExplainTitle>
          {metricExplanations.mae}
        </MetricExplain>
        <MetricExplain>
          <ExplainTitle>RMSE = {data.rmse.toFixed(2)}</ExplainTitle>
          {metricExplanations.rmse}
        </MetricExplain>
      </SectionCard>
    </div>
  )
}

export default DataScienceV2Page
