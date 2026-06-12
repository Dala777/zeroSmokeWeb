import type { Request, Response } from "express"
import { User } from "../models/User"
import DailyCheckin from "../models/DailyCheckin"
import UserProgress from "../models/UserProgress"
import { Activity } from "../models/Activity"
import axios from "axios"

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:5001"

// ============================================================
// A. REPORTE GENERAL DEL SISTEMA
// ============================================================
export const getSystemReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [
      totalUsers,
      activeUsers,
      newUsers,
      totalCheckins,
      totalRelapses,
      totalActivities,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: "active" }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      DailyCheckin.countDocuments({ date: { $gte: thirtyDaysAgo } }),
      DailyCheckin.countDocuments({ date: { $gte: thirtyDaysAgo }, smokedToday: true }),
      Activity.countDocuments(),
    ])

    const data = {
      reportType: "general",
      generatedAt: now.toISOString(),
      period: { from: thirtyDaysAgo.toISOString(), to: now.toISOString() },
      metrics: {
        totalUsers,
        activeUsers,
        newUsersLast30Days: newUsers,
        totalCheckins,
        totalRelapses,
        totalActivities,
        relapseRate: totalCheckins > 0 ? Number(((totalRelapses / totalCheckins) * 100).toFixed(2)) : 0,
      },
    }

    handleExportFormat(req, res, "Reporte_General", data)
  } catch (error) {
    console.error("[reports] Error generating system report:", error)
    res.status(500).json({ success: false, message: "Error al generar reporte general" })
  }
}

// ============================================================
// B. REPORTE DE USUARIOS
// ============================================================
export const getUserReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date()
    const users = await User.find().select("-password").sort({ createdAt: -1 }).lean()

    const reportData = users.map((u: any) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      dependencyLevel: u.dependencyLevel || "N/A",
      fagerstromScore: u.fagerstromScore ?? "N/A",
      cigarettesPerDayBaseline: u.cigarettesPerDayBaseline ?? "N/A",
      createdAt: u.createdAt,
      lastLogin: u.lastLogin || null,
    }))

    const summary = {
      total: reportData.length,
      active: reportData.filter((u: any) => u.status === "active").length,
      inactive: reportData.filter((u: any) => u.status === "inactive").length,
      pending: reportData.filter((u: any) => u.status === "pending").length,
      admins: reportData.filter((u: any) => u.role === "admin").length,
      dependencyBreakdown: {
        low: reportData.filter((u: any) => u.dependencyLevel === "low").length,
        moderate: reportData.filter((u: any) => u.dependencyLevel === "moderate").length,
        high: reportData.filter((u: any) => u.dependencyLevel === "high").length,
      },
    }

    const data = { reportType: "users", generatedAt: now.toISOString(), summary, users: reportData }
    handleExportFormat(req, res, "Reporte_Usuarios", data)
  } catch (error) {
    console.error("[reports] Error generating user report:", error)
    res.status(500).json({ success: false, message: "Error al generar reporte de usuarios" })
  }
}

// ============================================================
// C. REPORTE DE PROGRESO
// ============================================================
export const getProgressReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date()
    const progressEntries = await UserProgress.find().populate("userId", "name email").lean()

    const progressData = progressEntries.map((p: any) => ({
      userId: p.userId?._id || p.userId,
      userName: p.userId?.name || "Desconocido",
      userEmail: p.userId?.email || "",
      daysWithoutSmoking: p.daysWithoutSmoking || 0,
      bestStreak: p.bestStreak || 0,
      cigarettesAvoided: p.cigarettesAvoided || 0,
      moneySaved: p.moneySaved || 0,
      healthProgress: p.healthProgress || 0,
      dependencyLevel: p.dependencyLevel || "N/A",
      startDate: p.startDate,
    }))

    const totals = progressData.reduce(
      (acc: any, p: any) => ({
        totalDaysWithoutSmoking: acc.totalDaysWithoutSmoking + (p.daysWithoutSmoking || 0),
        totalBestStreak: Math.max(acc.totalBestStreak, p.bestStreak || 0),
        totalCigarettesAvoided: acc.totalCigarettesAvoided + (p.cigarettesAvoided || 0),
        totalMoneySaved: acc.totalMoneySaved + (p.moneySaved || 0),
        avgHealthProgress: acc.avgHealthProgress + (p.healthProgress || 0),
      }),
      { totalDaysWithoutSmoking: 0, totalBestStreak: 0, totalCigarettesAvoided: 0, totalMoneySaved: 0, avgHealthProgress: 0 },
    )

    if (progressData.length > 0) {
      totals.avgHealthProgress = Number((totals.avgHealthProgress / progressData.length).toFixed(2))
    }

    const data = { reportType: "progress", generatedAt: now.toISOString(), summary: totals, entries: progressData }
    handleExportFormat(req, res, "Reporte_Progreso", data)
  } catch (error) {
    console.error("[reports] Error generating progress report:", error)
    res.status(500).json({ success: false, message: "Error al generar reporte de progreso" })
  }
}

// ============================================================
// D. REPORTE ACADÉMICO RESUMIDO
// ============================================================
export const getAcademicReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date()
    let modelData = {
      datasetSize: 0,
      nFeatures: 0,
      r2: 0,
      mae: 0,
      rmse: 0,
      intercept: 0,
      coefficients: {} as Record<string, number>,
      featureImportance: {} as Record<string, number>,
      featureNames: [] as string[],
      lastTraining: null as string | null,
    }

    try {
      const response = await axios.get(`${ML_SERVICE_URL}/model-info`, { timeout: 5000 })
      if (response.data && response.data.status === "ready") {
        modelData = {
          datasetSize: response.data.n_samples || 0,
          nFeatures: response.data.n_features || 0,
          r2: response.data.r2 || 0,
          mae: response.data.mae || 0,
          rmse: response.data.rmse || 0,
          intercept: response.data.intercept || 0,
          coefficients: response.data.coefficients || {},
          featureImportance: response.data.feature_importance || {},
          featureNames: response.data.feature_names || [],
          lastTraining: response.data.last_training || null,
        }
      }
    } catch {
      const ts = new Date()
      ts.setHours(ts.getHours() - 1)
      modelData.lastTraining = ts.toISOString()
    }

    const data = {
      reportType: "academic",
      generatedAt: now.toISOString(),
      model: {
        datasetSize: modelData.datasetSize,
        r2: Number(modelData.r2.toFixed(4)),
        mae: Number(modelData.mae.toFixed(4)),
        rmse: Number(modelData.rmse.toFixed(4)),
        intercept: Number(modelData.intercept.toFixed(4)),
        variables: modelData.featureNames,
        featureImportance: modelData.featureImportance,
        coefficients: modelData.coefficients,
        lastTraining: modelData.lastTraining,
      },
    }

    handleExportFormat(req, res, "Reporte_Academico", data)
  } catch (error) {
    console.error("[reports] Error generating academic report:", error)
    res.status(500).json({ success: false, message: "Error al generar reporte académico" })
  }
}

// ============================================================
// HELPERS: LABELS, INTERPRETATIONS & FORMATOS DE EXPORTACIÓN
// ============================================================

const METRIC_LABELS: Record<string, Record<string, string>> = {
  general: {
    totalUsers: "Total de usuarios registrados",
    activeUsers: "Usuarios activos",
    newUsersLast30Days: "Usuarios nuevos (últimos 30 días)",
    totalCheckins: "Total de check-ins realizados",
    totalRelapses: "Total de recaídas registradas",
    totalActivities: "Total de actividades registradas",
    relapseRate: "Tasa de recaída (%)",
  },
  users: {
    total: "Total de usuarios",
    active: "Usuarios activos",
    inactive: "Usuarios inactivos",
    pending: "Usuarios pendientes de activación",
    admins: "Administradores",
    low: "Dependencia baja",
    moderate: "Dependencia moderada",
    high: "Dependencia alta",
  },
  progress: {
    totalDaysWithoutSmoking: "Total de días sin fumar",
    totalBestStreak: "Mejor racha registrada (días)",
    totalCigarettesAvoided: "Cigarrillos evitados",
    totalMoneySaved: "Dinero ahorrado ($)",
    avgHealthProgress: "Progreso de salud promedio (%)",
  },
  academic: {
    datasetSize: "Tamaño del conjunto de datos",
    nFeatures: "Cantidad de variables predictoras",
    r2: "R² (Coeficiente de determinación)",
    mae: "MAE (Error absoluto medio)",
    rmse: "RMSE (Raíz del error cuadrático medio)",
    intercept: "Intercepto (riesgo base)",
    lastTraining: "Fecha del último entrenamiento",
    variables: "Variables utilizadas en el modelo",
    coefficients: "Coeficientes del modelo",
    featureImportance: "Importancia de variables",
  },
}

const REPORT_DESCRIPTIONS: Record<string, string> = {
  general: "Este reporte resume el estado general del sistema ZeroSmoke durante el período analizado y presenta métricas clave de uso, actividad y recaídas de los usuarios.",
  users: "Este reporte presenta información detallada sobre los usuarios registrados en ZeroSmoke, incluyendo su estado, nivel de dependencia y actividad en el sistema.",
  progress: "Este reporte muestra el progreso acumulado de los usuarios en su proceso para dejar de fumar, incluyendo días sin fumar, rachas, cigarrillos evitados y dinero ahorrado.",
  academic: "Este reporte presenta las métricas de rendimiento del modelo de regresión lineal múltiple utilizado para predecir el riesgo de recaída de los usuarios del programa ZeroSmoke.",
}

const REPORT_TITLES: Record<string, string> = {
  general: "Reporte General del Sistema",
  users: "Reporte de Usuarios",
  progress: "Reporte de Progreso",
  academic: "Reporte Académico del Modelo Predictivo",
}

function getReportType(data: Record<string, unknown>): string {
  return (data.reportType as string) || "general"
}

function getMetricLabel(key: string, type: string): string {
  const labels = METRIC_LABELS[type]
  if (!labels) {
    return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())
  }
  return labels[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())
}

function extractMetricsTable(type: string, data: Record<string, unknown>): Array<{ label: string; value: string }> {
  const result: Array<{ label: string; value: string }> = []

  const pushFlat = (obj: Record<string, unknown>, labelPrefix = "") => {
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue
      const fullKey = labelPrefix ? `${labelPrefix}.${key}` : key
      if (typeof value === "object" && !Array.isArray(value)) {
        pushFlat(value as Record<string, unknown>, fullKey)
      } else {
        result.push({
          label: getMetricLabel(fullKey, type),
          value: String(value),
        })
      }
    }
  }

  if (data.metrics) {
    pushFlat(data.metrics as Record<string, unknown>)
  } else if (data.summary) {
    const summary = data.summary as Record<string, unknown>
    for (const [key, value] of Object.entries(summary)) {
      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        pushFlat(value as Record<string, unknown>)
      } else {
        result.push({
          label: getMetricLabel(key, type),
          value: String(value),
        })
      }
    }
  } else if (data.model) {
    const model = data.model as Record<string, unknown>
    for (const [key, value] of Object.entries(model)) {
      if (value === null || value === undefined) continue
      if (Array.isArray(value)) {
        result.push({
          label: getMetricLabel(key, type),
          value: value.join(", "),
        })
      } else if (typeof value === "object") {
        // Skip complex nested objects (coefficients, featureImportance) for the main table
        continue
      } else {
        result.push({
          label: getMetricLabel(key, type),
          value: String(value),
        })
      }
    }
  } else {
    pushFlat(data)
  }

  return result
}

function generateInterpretations(type: string, data: Record<string, unknown>): string[] {
  const lines: string[] = []
  const metrics = (data.metrics || {}) as Record<string, any>
  const model = (data.model || {}) as Record<string, any>
  const summary = (data.summary || {}) as Record<string, any>

  switch (type) {
    case "general": {
      const rate = metrics.relapseRate
      if (rate != null) {
        if (rate < 10) {
          lines.push("La tasa de recaída es baja (menor al 10%), lo que indica una buena adherencia de los usuarios al programa.")
        } else if (rate < 25) {
          lines.push("La tasa de recaída es moderada (entre 10% y 25%). Se recomienda reforzar las estrategias de prevención de recaídas.")
        } else {
          lines.push("La tasa de recaída es elevada (mayor al 25%). Es necesario revisar las intervenciones actuales y fortalecer el acompañamiento a los usuarios.")
        }
      }
      if (metrics.totalUsers > 0 && metrics.activeUsers != null) {
        const activePct = Math.round((metrics.activeUsers / metrics.totalUsers) * 100)
        if (activePct > 60) {
          lines.push(`El ${activePct}% de los usuarios registrados se encuentra activo, indicando una participación saludable en el programa.`)
        } else if (activePct > 30) {
          lines.push(`El ${activePct}% de los usuarios registrados se encuentra activo. Se recomienda implementar estrategias para aumentar la participación.`)
        } else {
          lines.push(`Solo el ${activePct}% de los usuarios registrados se encuentra activo. Es prioritario implementar estrategias de retención y reenganche.`)
        }
      }
      if (metrics.totalCheckins > 0 && metrics.totalRelapses > 0) {
        const relapsePct = ((metrics.totalRelapses / metrics.totalCheckins) * 100).toFixed(1)
        lines.push(`Del total de check-ins realizados, el ${relapsePct}% corresponden a recaídas, lo que permite identificar patrones y momentos críticos para intervenir.`)
      }
      break
    }

    case "users": {
      const total = summary.total
      const active = summary.active
      const inactive = summary.inactive
      if (total && active != null) {
        const pct = Math.round((active / total) * 100)
        if (pct > 60) {
          lines.push(`El ${pct}% de los usuarios se encuentra activo, lo que refleja un buen nivel de participación en el programa.`)
        } else if (pct > 30) {
          lines.push(`El ${pct}% de los usuarios se encuentra activo. Se sugiere implementar campañas de motivación para reducir la tasa de inactividad.`)
        } else {
          lines.push(`Solo el ${pct}% de los usuarios se encuentra activo. Se requiere una revisión de las estrategias de engagement.`)
        }
      }
      if (inactive != null && inactive > 0 && total) {
        lines.push(`Actualmente hay ${inactive} usuarios inactivos (${Math.round((inactive / total) * 100)}% del total).`)
      }
      break
    }

    case "progress": {
      const days = summary.totalDaysWithoutSmoking
      const avoided = summary.totalCigarettesAvoided
      const saved = summary.totalMoneySaved
      if (days && days > 0) {
        lines.push(`Los usuarios han acumulado un total de ${days} días sin fumar, lo que demuestra un progreso colectivo significativo en su proceso de abandono del tabaco.`)
      }
      if (avoided && avoided > 0) {
        lines.push(`Se han evitado aproximadamente ${avoided} cigarrillos, lo que representa un impacto positivo en la salud de los usuarios y en la reducción del consumo de tabaco.`)
      }
      if (saved && saved > 0) {
        lines.push(`Los usuarios han ahorrado un total de $${saved} en la compra de cigarrillos, evidenciando el beneficio económico del programa.`)
      }
      if (summary.avgHealthProgress != null) {
        const hp = summary.avgHealthProgress
        if (hp > 60) {
          lines.push(`El progreso de salud promedio es del ${hp}%, indicando una recuperación significativa en la salud de los participantes.`)
        } else if (hp > 30) {
          lines.push(`El progreso de salud promedio es del ${hp}%, mostrando una mejora moderada en la salud de los participantes.`)
        } else {
          lines.push(`El progreso de salud promedio es del ${hp}%. Se recomienda fortalecer el acompañamiento para mejorar los indicadores de salud.`)
        }
      }
      break
    }

    case "academic": {
      const r2 = model.r2
      if (r2 != null && r2 > 0) {
        if (r2 > 0.7) {
          lines.push(`El modelo presenta un buen ajuste a los datos (R² = ${(r2 * 100).toFixed(1)}%), lo que indica que las variables seleccionadas explican adecuadamente el riesgo de recaída.`)
        } else if (r2 >= 0.4) {
          lines.push(`El modelo presenta un ajuste moderado (R² = ${(r2 * 100).toFixed(1)}%). Podría beneficiarse de la inclusión de variables adicionales para mejorar su poder predictivo.`)
        } else {
          lines.push(`El modelo presenta un ajuste débil (R² = ${(r2 * 100).toFixed(1)}%). Se recomienda revisar las variables predictoras y considerar la inclusión de nuevos factores.`)
        }
      }
      const mae = model.mae
      if (mae != null && mae > 0) {
        if (mae < 10) {
          lines.push(`El error absoluto medio (MAE = ${mae.toFixed(2)}) es bajo, lo que indica que las predicciones del modelo son precisas y cercanas a los valores reales.`)
        } else if (mae < 20) {
          lines.push(`El error absoluto medio (MAE = ${mae.toFixed(2)}) es moderado. Las predicciones tienen una precisión aceptable.`)
        } else {
          lines.push(`El error absoluto medio (MAE = ${mae.toFixed(2)}) es elevado. El modelo presenta errores de predicción significativos que deben ser analizados.`)
        }
      }
      const rmse = model.rmse
      if (rmse != null && rmse > 0 && mae != null && mae > 0) {
        const ratio = rmse / mae
        if (ratio > 1.5) {
          lines.push(`El RMSE (${rmse.toFixed(2)}) es significativamente mayor que el MAE (${mae.toFixed(2)}), lo que sugiere la presencia de valores atípicos (outliers) en los datos que generan errores grandes ocasionales.`)
        }
      }
      const features = model.variables
      if (features && Array.isArray(features) && features.length > 0) {
        lines.push(`El modelo utiliza ${features.length} variables predictoras: ${features.join(", ")}.`)
      }
      if (model.lastTraining) {
        const trainingDate = new Date(model.lastTraining).toLocaleString("es-ES")
        lines.push(`El modelo fue entrenado por última vez el ${trainingDate}.`)
      }
      break
    }
  }

  return lines
}

function formatDate(date: Date): string {
  return date.toLocaleString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

function handleExportFormat(req: Request, res: Response, filename: string, data: Record<string, unknown>): void {
  const format = req.query.format as string

  if (format === "csv") {
    exportCSV(res, filename, data)
    return
  }

  if (format === "xlsx") {
    exportXLSX(res, filename, data)
    return
  }

  if (format === "pdf") {
    exportPDF(res, filename, data)
    return
  }

  res.status(200).json({ success: true, data })
}

function escapeCSV(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function exportCSV(res: Response, filename: string, data: Record<string, unknown>): void {
  const type = getReportType(data)
  const title = REPORT_TITLES[type] || "Reporte"
  const description = REPORT_DESCRIPTIONS[type] || ""
  const metrics = extractMetricsTable(type, data)
  const interpretations = generateInterpretations(type, data)
  const generatedAt = formatDate(new Date())
  const periodStr = data.period
    ? `Período: ${new Date((data.period as any).from).toLocaleDateString("es-ES")} - ${new Date((data.period as any).to).toLocaleDateString("es-ES")}`
    : ""

  const lines: string[] = []

  lines.push(`ZeroSmoke - ${title}`)
  lines.push(`Fecha de generación: ${generatedAt}`)
  if (periodStr) lines.push(periodStr)
  lines.push("")
  lines.push(`Descripción: ${description}`)
  lines.push("")

  // Metrics table
  lines.push(`"Métrica","Valor"`)
  for (const m of metrics) {
    lines.push(`${escapeCSV(m.label)},${escapeCSV(m.value)}`)
  }

  // Interpretations
  if (interpretations.length > 0) {
    lines.push("")
    lines.push(`"Interpretación de Resultados",""`)
    for (const interp of interpretations) {
      lines.push(`${escapeCSV(interp)},""`)
    }
  }

  const csvContent = lines.join("\n")

  res.setHeader("Content-Type", "text/csv; charset=utf-8")
  res.setHeader("Content-Disposition", `attachment; filename=${filename}_${new Date().toISOString().split("T")[0]}.csv`)
  res.status(200).send(csvContent)
}

function exportXLSX(res: Response, _filename: string, _data: Record<string, unknown>): void {
  try {
    const ExcelJS = require("exceljs")
    const type = getReportType(_data)
    const title = REPORT_TITLES[type] || "Reporte"
    const description = REPORT_DESCRIPTIONS[type] || ""
    const metrics = extractMetricsTable(type, _data)
    const interpretations = generateInterpretations(type, _data)
    const generatedAt = formatDate(new Date())

    const workbook = new ExcelJS.Workbook()
    workbook.creator = "ZeroSmoke"
    workbook.created = new Date()

    // Sheet 1: Resumen
    const sheet = workbook.addWorksheet("Reporte")

    // Title
    sheet.mergeCells("A1:B1")
    const titleCell = sheet.getCell("A1")
    titleCell.value = `ZeroSmoke - ${title}`
    titleCell.font = { bold: true, size: 14 }
    titleCell.alignment = { horizontal: "center" }

    // Date
    sheet.mergeCells("A2:B2")
    sheet.getCell("A2").value = `Fecha de generación: ${generatedAt}`
    sheet.getCell("A2").font = { size: 10 }
    sheet.getCell("A2").alignment = { horizontal: "center" }

    // Description
    sheet.mergeCells("A3:B3")
    sheet.getCell("A3").value = description
    sheet.getCell("A3").font = { size: 10, italic: true }
    sheet.getCell("A3").alignment = { wrapText: true }

    // Blank row
    sheet.getCell("A5").value = "Métrica"
    sheet.getCell("A5").font = { bold: true }
    sheet.getCell("B5").value = "Valor"
    sheet.getCell("B5").font = { bold: true }

    sheet.columns = [
      { header: "Métrica", key: "metric", width: 45 },
      { header: "Valor", key: "value", width: 25 },
    ]

    // Add metric data starting from row 5
    let rowNum = 5
    for (const m of metrics) {
      rowNum++
      sheet.getCell(`A${rowNum}`).value = m.label
      sheet.getCell(`B${rowNum}`).value = m.value
    }

    // Interpretations sheet
    const interpSheet = workbook.addWorksheet("Interpretación")
    interpSheet.mergeCells("A1:B1")
    interpSheet.getCell("A1").value = "Interpretación de Resultados"
    interpSheet.getCell("A1").font = { bold: true, size: 12 }
    interpSheet.getCell("A1").alignment = { horizontal: "center" }

    interpSheet.columns = [
      { header: "Interpretación", key: "text", width: 100 },
      { header: "", key: "empty", width: 10 },
    ]

    let interpRow = 2
    for (const interp of interpretations) {
      interpRow++
      interpSheet.getCell(`A${interpRow}`).value = interp
      interpSheet.getCell(`A${interpRow}`).alignment = { wrapText: true }
    }

    // User data sheet is not needed for all reports - keep it simple

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    res.setHeader("Content-Disposition", `attachment; filename=${_filename}_${new Date().toISOString().split("T")[0]}.xlsx`)

    workbook.xlsx.write(res).then(() => res.end())
  } catch {
    res.status(501).json({ success: false, message: "Exportación XLSX no disponible. Instale exceljs: npm install exceljs" })
  }
}

function exportPDF(res: Response, _filename: string, _data: Record<string, unknown>): void {
  try {
    const PDFDocument = require("pdfkit")
    const type = getReportType(_data)
    const title = REPORT_TITLES[type] || "Reporte"
    const description = REPORT_DESCRIPTIONS[type] || ""
    const metrics = extractMetricsTable(type, _data)
    const interpretations = generateInterpretations(type, _data)
    const generatedAt = formatDate(new Date())

    const doc = new PDFDocument({ margin: 50, size: "A4" })

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename=${_filename}_${new Date().toISOString().split("T")[0]}.pdf`)

    doc.pipe(res)

    // Title
    doc.fontSize(18).font("Helvetica-Bold").text("ZeroSmoke", { align: "center" })
    doc.moveDown(0.3)
    doc.fontSize(14).font("Helvetica-Bold").text(title, { align: "center" })
    doc.moveDown(0.5)
    doc.fontSize(9).font("Helvetica").text(`Fecha de generación: ${generatedAt}`, { align: "center" })
    doc.moveDown(0.3)

    // Period info
    if (_data.period) {
      const period = _data.period as any
      doc.fontSize(9).text(
        `Período: ${new Date(period.from).toLocaleDateString("es-ES")} - ${new Date(period.to).toLocaleDateString("es-ES")}`,
        { align: "center" }
      )
      doc.moveDown(0.5)
    }

    // Horizontal line
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke()
    doc.moveDown(0.5)

    // Description
    doc.fontSize(9).font("Helvetica-Oblique").text(description, { align: "left" })
    doc.moveDown()

    // Metrics table
    const tableTop = doc.y
    let y = tableTop

    // Table header
    doc.fontSize(9).font("Helvetica-Bold")
    doc.text("Métrica", 50, y, { width: 300 })
    doc.text("Valor", 370, y, { width: 150 })
    y += 14
    doc.moveTo(50, y).lineTo(545, y).stroke()
    y += 4

    // Table rows
    doc.font("Helvetica").fontSize(8)
    for (const m of metrics) {
      if (y > 720) {
        doc.addPage()
        y = 50
      }
      doc.text(m.label, 50, y, { width: 310 })
      doc.text(m.value, 370, y, { width: 175 })
      y += 14
    }

    // Interpretation section
    if (interpretations.length > 0) {
      y += 10
      if (y > 700) {
        doc.addPage()
        y = 50
      }

      doc.moveTo(50, y).lineTo(545, y).stroke()
      y += 10

      doc.fontSize(11).font("Helvetica-Bold").text("Interpretación de Resultados", 50, y)
      y += 18

      doc.font("Helvetica").fontSize(9)
      for (const interp of interpretations) {
        if (y > 740) {
          doc.addPage()
          y = 50
        }
        doc.text(`• ${interp}`, 50, y, { width: 495, align: "justify" })
        y += doc.heightOfString(`• ${interp}`, { width: 495 }) + 6
      }
    }

    doc.end()
  } catch {
    res.status(501).json({ success: false, message: "Exportación PDF no disponible. Instale pdfkit: npm install pdfkit" })
  }
}
