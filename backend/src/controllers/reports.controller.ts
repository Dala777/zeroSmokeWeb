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
      const response = await axios.get(`${ML_SERVICE_URL}/api/v2/model-info`, { timeout: 5000 })
      if (response.data) {
        modelData = {
          datasetSize: response.data.n_samples || response.data.datasetSize || 0,
          nFeatures: response.data.n_features || 0,
          r2: response.data.r2 || 0,
          mae: response.data.mae || 0,
          rmse: response.data.rmse || 0,
          intercept: response.data.intercept || 0,
          coefficients: response.data.coefficients || {},
          featureImportance: response.data.feature_importance || {},
          featureNames: response.data.feature_names || [],
          lastTraining: response.data.last_training || response.data.lastTraining || null,
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
// HELPERS: FORMATOS DE EXPORTACIÓN
// ============================================================

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

function exportCSV(res: Response, filename: string, data: Record<string, unknown>): void {
  const rows: string[][] = []
  const headers: string[] = []

  const flatten = (obj: Record<string, unknown>, prefix = ""): Record<string, unknown> => {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key
      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        Object.assign(result, flatten(value as Record<string, unknown>, newKey))
      } else if (Array.isArray(value)) {
        result[newKey] = JSON.stringify(value)
      } else {
        result[newKey] = value
      }
    }
    return result
  }

  if (data.metrics) {
    const flat = flatten(data.metrics as Record<string, unknown>)
    headers.push(...Object.keys(flat))
    rows.push(Object.values(flat).map(String))
  } else if (data.summary && data.users) {
    const flat = flatten(data.summary as Record<string, unknown>)
    headers.push(...Object.keys(flat).map((k) => `summary.${k}`))
    rows.push(Object.values(flat).map(String))
    const users = data.users as Array<Record<string, unknown>>
    if (users.length > 0) {
      const userHeaders = Object.keys(flatten(users[0]))
      headers.push(...userHeaders.map((h) => `user.${h}`))
      rows[0] = rows[0].concat(Object.values(flatten(users[0])).map(String))
    }
  } else if (data.entries) {
    const entries = data.entries as Array<Record<string, unknown>>
    if (entries.length > 0) {
      const flat = flatten(entries[0])
      headers.push(...Object.keys(flat))
      for (const entry of entries) {
        rows.push(Object.values(flatten(entry)).map(String))
      }
    }
  } else if (data.model) {
    const flat = flatten(data.model as Record<string, unknown>)
    headers.push(...Object.keys(flat))
    rows.push(Object.values(flat).map(String))
  }

  const csvContent = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(","))].join("\n")

  res.setHeader("Content-Type", "text/csv; charset=utf-8")
  res.setHeader("Content-Disposition", `attachment; filename=${filename}_${new Date().toISOString().split("T")[0]}.csv`)
  res.status(200).send(csvContent)
}

function exportXLSX(res: Response, _filename: string, _data: Record<string, unknown>): void {
  try {
    const ExcelJS = require("exceljs")
    const workbook = new ExcelJS.Workbook()
    workbook.creator = "ZeroSmoke"
    workbook.created = new Date()

    const sheet = workbook.addWorksheet("Reporte")
    sheet.columns = [
      { header: "Métrica", key: "metric", width: 30 },
      { header: "Valor", key: "value", width: 20 },
    ]

    const flatten = (obj: Record<string, unknown>, prefix = ""): Array<{ metric: string; value: string }> => {
      const result: Array<{ metric: string; value: string }> = []
      for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key
        if (value !== null && typeof value === "object" && !Array.isArray(value)) {
          result.push(...flatten(value as Record<string, unknown>, newKey))
        } else {
          result.push({ metric: newKey, value: String(value ?? "") })
        }
      }
      return result
    }

    const rows = flatten(_data)
    rows.forEach((row) => sheet.addRow(row))

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
    const doc = new PDFDocument({ margin: 30, size: "A4" })

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename=${_filename}_${new Date().toISOString().split("T")[0]}.pdf`)

    doc.pipe(res)

    doc.fontSize(20).font("Helvetica-Bold").text("ZeroSmoke - Reporte", { align: "center" })
    doc.moveDown()
    doc.fontSize(10).font("Helvetica").text(`Generado: ${new Date().toLocaleString("es-ES")}`, { align: "center" })
    doc.moveDown(2)

    const flatten = (obj: Record<string, unknown>, prefix = ""): Array<{ metric: string; value: string }> => {
      const result: Array<{ metric: string; value: string }> = []
      for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key
        if (value !== null && typeof value === "object" && !Array.isArray(value)) {
          result.push(...flatten(value as Record<string, unknown>, newKey))
        } else {
          result.push({ metric: newKey.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()), value: String(value ?? "") })
        }
      }
      return result
    }

    const rows = flatten(_data)
    const startX = 30
    let y = doc.y

    doc.fontSize(8).font("Helvetica-Bold")
    doc.text("Métrica", startX, y, { width: 300 })
    doc.text("Valor", startX + 310, y, { width: 200 })
    y += 15
    doc.moveTo(startX, y).lineTo(startX + 510, y).stroke()
    y += 5

    doc.font("Helvetica").fontSize(7)
    for (const row of rows) {
      if (y > 780) {
        doc.addPage()
        y = 30
      }
      doc.text(row.metric, startX, y, { width: 300 })
      doc.text(row.value, startX + 310, y, { width: 200 })
      y += 12
    }

    doc.end()
  } catch {
    res.status(501).json({ success: false, message: "Exportación PDF no disponible. Instale pdfkit: npm install pdfkit" })
  }
}
