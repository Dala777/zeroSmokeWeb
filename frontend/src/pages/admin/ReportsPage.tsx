import type React from "react"
import { useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import {
  FileText, Users, TrendingUp, Brain, Download, FileSpreadsheet,
  File as FilePdf, RefreshCw, AlertCircle, CheckCircle,
} from "lucide-react"
import { AppColors } from "../../styles/colors"
import Card from "../../components/ui/Card"
import Button from "../../components/ui/Button"
import LoadingState from "../../components/admin/LoadingState"
import ErrorState from "../../components/admin/ErrorState"
import { reportAPI } from "../../services/api"

const PageContainer = styled.div`
  padding: 1.5rem;
`

const PageHeader = styled.div`
  margin-bottom: 2rem;
  h1 { font-size: 1.5rem; color: #111827; font-weight: 700; margin: 0; }
  p { color: #6B7280; margin: 0.25rem 0 0; font-size: 0.875rem; }
`

const ReportGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
`

const ReportCard = styled(Card)`
  display: flex;
  flex-direction: column;
`

const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`

const ReportIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: ${(p) => p.$color}15;
  color: ${(p) => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
`

const ReportTitleArea = styled.div`
  flex: 1;
  margin-left: 1rem;
`

const ReportTitle = styled.h3`
  font-size: 1.125rem;
  color: #111827;
  font-weight: 600;
  margin: 0 0 0.25rem;
`

const ReportDescription = styled.p`
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
`

const DataContainer = styled.div`
  flex: 1;
  margin: 1rem 0;
`

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #F3F4F6;
  &:last-child { border-bottom: none; }
`

const MetricLabel = styled.span`
  font-size: 0.875rem;
  color: #6B7280;
`

const MetricValue = styled.span`
  font-size: 0.875rem;
  color: #111827;
  font-weight: 600;
`

const ExportSection = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #F3F4F6;
`

const ExportButton = styled.button<{ $variant?: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #D1D5DB;
  background: white;
  color: #374151;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    border-color: ${AppColors.primary};
    color: ${AppColors.accent};
    background: #F0FDF4;
  }
  svg { width: 16px; height: 16px; }
`

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #D1D5DB;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  &:hover { border-color: ${AppColors.primary}; color: ${AppColors.accent}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

const EmptyData = styled.div`
  text-align: center;
  padding: 2rem;
  color: #9CA3AF;
  font-size: 0.875rem;
`

interface ReportState {
  data: any
  loading: boolean
  error: string
}

const ReportsPage: React.FC = () => {
  const [systemReport, setSystemReport] = useState<ReportState>({ data: null, loading: false, error: "" })
  const [usersReport, setUsersReport] = useState<ReportState>({ data: null, loading: false, error: "" })
  const [progressReport, setProgressReport] = useState<ReportState>({ data: null, loading: false, error: "" })
  const [academicReport, setAcademicReport] = useState<ReportState>({ data: null, loading: false, error: "" })

  const loadReport = useCallback(async (type: string, setter: React.Dispatch<React.SetStateAction<ReportState>>) => {
    setter((prev) => ({ ...prev, loading: true, error: "" }))
    try {
      let res
      switch (type) {
        case "system": res = await reportAPI.getSystem(); break
        case "users": res = await reportAPI.getUsers(); break
        case "progress": res = await reportAPI.getProgress(); break
        case "academic": res = await reportAPI.getAcademic(); break
        default: return
      }
      setter({ data: res.data.data, loading: false, error: "" })
    } catch {
      setter((prev) => ({ ...prev, loading: false, error: "Error al cargar reporte" }))
    }
  }, [])

  useEffect(() => {
    loadReport("system", setSystemReport)
    loadReport("users", setUsersReport)
    loadReport("progress", setProgressReport)
    loadReport("academic", setAcademicReport)
  }, [loadReport])

  const handleExport = (type: string, format: string) => {
    reportAPI.downloadExport(type, format)
  }

  const renderMetrics = (metrics: Record<string, any>) => {
    if (!metrics || Object.keys(metrics).length === 0) return <EmptyData>Sin datos disponibles</EmptyData>
    return Object.entries(metrics).map(([key, value]) => (
      <MetricRow key={key}>
        <MetricLabel>{key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}</MetricLabel>
        <MetricValue>{String(value ?? "N/A")}</MetricValue>
      </MetricRow>
    ))
  }

  const renderSummary = (summary: Record<string, any>) => {
    if (!summary) return <EmptyData>Sin datos disponibles</EmptyData>
    const entries = Object.entries(summary).filter(([_, v]) => typeof v !== "object")
    if (entries.length === 0) {
      const subKeys = Object.keys(summary).filter((k) => typeof summary[k] === "object")
      const flat: Record<string, any> = {}
      subKeys.forEach((k) => {
        if (summary[k] && typeof summary[k] === "object") {
          Object.entries(summary[k]).forEach(([sk, sv]) => { flat[`${k}.${sk}`] = sv })
        }
      })
      return renderMetrics(flat)
    }
    return renderMetrics(Object.fromEntries(entries))
  }

  const renderModelData = (model: Record<string, any>) => {
    if (!model) return <EmptyData>Sin datos del modelo</EmptyData>
    const metrics: Record<string, any> = {}
    const fields = ["datasetSize", "r2", "mae", "rmse", "intercept", "lastTraining"]
    fields.forEach((f) => { metrics[f] = model[f] })
    if (model.variables && Array.isArray(model.variables)) {
      metrics.variables = model.variables.join(", ")
    }
    return renderMetrics(metrics)
  }

  return (
    <PageContainer>
      <PageHeader>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1>Reportes</h1>
            <p>Reportes centralizados del sistema ZeroSmoke</p>
          </div>
          <RefreshButton
            onClick={() => {
              loadReport("system", setSystemReport)
              loadReport("users", setUsersReport)
              loadReport("progress", setProgressReport)
              loadReport("academic", setAcademicReport)
            }}
          >
            <RefreshCw size={16} /> Actualizar Todos
          </RefreshButton>
        </div>
      </PageHeader>

      <ReportGrid>
        {/* A. Reporte General */}
        <ReportCard>
          <ReportHeader>
            <ReportIcon $color={AppColors.accent}><FileText size={24} /></ReportIcon>
            <ReportTitleArea>
              <ReportTitle>Reporte General del Sistema</ReportTitle>
              <ReportDescription>Usuarios, check-ins, recaídas y actividades</ReportDescription>
            </ReportTitleArea>
          </ReportHeader>
          <DataContainer>
            {systemReport.loading ? <LoadingState message="Cargando..." /> :
             systemReport.error ? <ErrorState message={systemReport.error} /> :
             systemReport.data?.metrics ? renderMetrics(systemReport.data.metrics) :
             <EmptyData>Haz clic en el botón de exportación para generar</EmptyData>}
          </DataContainer>
          <ExportSection>
            <ExportButton onClick={() => handleExport("system", "csv")}><FileText size={16} /> CSV</ExportButton>
            <ExportButton onClick={() => handleExport("system", "xlsx")}><FileSpreadsheet size={16} /> XLSX</ExportButton>
            <ExportButton onClick={() => handleExport("system", "pdf")}><FilePdf size={16} /> PDF</ExportButton>
          </ExportSection>
        </ReportCard>

        {/* B. Reporte de Usuarios */}
        <ReportCard>
          <ReportHeader>
            <ReportIcon $color="#3B82F6"><Users size={24} /></ReportIcon>
            <ReportTitleArea>
              <ReportTitle>Reporte de Usuarios</ReportTitle>
              <ReportDescription>Información general, dependencia y estado</ReportDescription>
            </ReportTitleArea>
          </ReportHeader>
          <DataContainer>
            {usersReport.loading ? <LoadingState message="Cargando..." /> :
             usersReport.error ? <ErrorState message={usersReport.error} /> :
             usersReport.data?.summary ? renderSummary(usersReport.data.summary) :
             <EmptyData>Haz clic en el botón de exportación para generar</EmptyData>}
          </DataContainer>
          <ExportSection>
            <ExportButton onClick={() => handleExport("users", "csv")}><FileText size={16} /> CSV</ExportButton>
            <ExportButton onClick={() => handleExport("users", "xlsx")}><FileSpreadsheet size={16} /> XLSX</ExportButton>
            <ExportButton onClick={() => handleExport("users", "pdf")}><FilePdf size={16} /> PDF</ExportButton>
          </ExportSection>
        </ReportCard>

        {/* C. Reporte de Progreso */}
        <ReportCard>
          <ReportHeader>
            <ReportIcon $color="#8B5CF6"><TrendingUp size={24} /></ReportIcon>
            <ReportTitleArea>
              <ReportTitle>Reporte de Progreso</ReportTitle>
              <ReportDescription>Días sin fumar, racha, cigarrillos evitados</ReportDescription>
            </ReportTitleArea>
          </ReportHeader>
          <DataContainer>
            {progressReport.loading ? <LoadingState message="Cargando..." /> :
             progressReport.error ? <ErrorState message={progressReport.error} /> :
             progressReport.data?.summary ? renderMetrics(progressReport.data.summary) :
             <EmptyData>Haz clic en el botón de exportación para generar</EmptyData>}
          </DataContainer>
          <ExportSection>
            <ExportButton onClick={() => handleExport("progress", "csv")}><FileText size={16} /> CSV</ExportButton>
            <ExportButton onClick={() => handleExport("progress", "xlsx")}><FileSpreadsheet size={16} /> XLSX</ExportButton>
            <ExportButton onClick={() => handleExport("progress", "pdf")}><FilePdf size={16} /> PDF</ExportButton>
          </ExportSection>
        </ReportCard>

        {/* D. Reporte Académico */}
        <ReportCard>
          <ReportHeader>
            <ReportIcon $color="#F59E0B"><Brain size={24} /></ReportIcon>
            <ReportTitleArea>
              <ReportTitle>Reporte Académico Resumido</ReportTitle>
              <ReportDescription>Métricas del modelo de regresión múltiple</ReportDescription>
            </ReportTitleArea>
          </ReportHeader>
          <DataContainer>
            {academicReport.loading ? <LoadingState message="Cargando..." /> :
             academicReport.error ? <ErrorState message={academicReport.error} /> :
             academicReport.data?.model ? renderModelData(academicReport.data.model) :
             <EmptyData>Haz clic en el botón de exportación para generar</EmptyData>}
          </DataContainer>
          <ExportSection>
            <ExportButton onClick={() => handleExport("academic", "csv")}><FileText size={16} /> CSV</ExportButton>
            <ExportButton onClick={() => handleExport("academic", "xlsx")}><FileSpreadsheet size={16} /> XLSX</ExportButton>
            <ExportButton onClick={() => handleExport("academic", "pdf")}><FilePdf size={16} /> PDF</ExportButton>
          </ExportSection>
        </ReportCard>
      </ReportGrid>
    </PageContainer>
  )
}

export default ReportsPage
