import type { Request, Response } from "express"
import type { PipelineStage } from "mongoose"
import { User } from "../models/User"
import DailyCheckin from "../models/DailyCheckin"
import SmokingRecord from "../models/SmokingRecord"
import NotificationLog from "../models/NotificationLog"
import RiskSnapshot from "../models/RiskSnapshot"
import { UserPlan } from "../models/UserPlan"

type Granularity = "day" | "week" | "month"

interface DateRange {
  from: Date
  to: Date
  granularity: Granularity
}

interface PeriodMetric {
  period: string
  [key: string]: string | number
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

const startOfDay = (date: Date): Date => {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value
}

const endOfDay = (date: Date): Date => {
  const value = startOfDay(date)
  value.setDate(value.getDate() + 1)
  return value
}

const buildDateKey = (date: Date): string => {
  const value = startOfDay(date)
  const year = value.getFullYear()
  const month = `${value.getMonth() + 1}`.padStart(2, "0")
  const day = `${value.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

const parseDateParam = (value: unknown, boundary: "start" | "end" = "start"): Date | null => {
  if (typeof value !== "string" || !value.trim()) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return boundary === "end" ? new Date(endOfDay(date).getTime() - 1) : startOfDay(date)
  }

  return date
}

const parseGranularity = (value: unknown): Granularity => {
  return value === "week" || value === "month" ? value : "day"
}

const parseDateRange = (req: Request): DateRange => {
  const now = new Date()
  const defaultFrom = new Date(now.getTime() - 29 * MS_PER_DAY)
  const from = parseDateParam(req.query.from, "start") || startOfDay(defaultFrom)
  const to = parseDateParam(req.query.to, "end") || now

  return {
    from,
    to,
    granularity: parseGranularity(req.query.granularity),
  }
}

const periodExpression = (field: string, granularity: Granularity): Record<string, unknown> => {
  if (granularity === "month") {
    return { $dateToString: { format: "%Y-%m", date: `$${field}` } }
  }

  if (granularity === "week") {
    return { $dateToString: { format: "%Y-W%U", date: `$${field}` } }
  }

  return { $dateToString: { format: "%Y-%m-%d", date: `$${field}` } }
}

const rangePayload = ({ from, to, granularity }: DateRange) => ({
  from: from.toISOString(),
  to: to.toISOString(),
  granularity,
})

const roundNumber = (value: number, decimals = 2): number => {
  if (!Number.isFinite(value)) return 0
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

const normalizeSeries = <T extends { _id: string }>(
  rows: T[],
  mapRow: (row: T) => PeriodMetric,
): PeriodMetric[] => {
  return rows.map(mapRow).sort((a, b) => a.period.localeCompare(b.period))
}

const mergeCravingSeries = (
  checkinRows: Array<{ _id: string; averageCraving: number; events: number; highCravingEvents: number }>,
  smokingRows: Array<{ _id: string; averageCraving: number; events: number; highCravingEvents: number }>,
): PeriodMetric[] => {
  const byPeriod = new Map<string, { weightedTotal: number; events: number; highCravingEvents: number }>()

  const addRows = (rows: Array<{ _id: string; averageCraving: number; events: number; highCravingEvents: number }>) => {
    rows.forEach((row) => {
      const existing = byPeriod.get(row._id) || { weightedTotal: 0, events: 0, highCravingEvents: 0 }
      existing.weightedTotal += (Number(row.averageCraving) || 0) * (Number(row.events) || 0)
      existing.events += Number(row.events) || 0
      existing.highCravingEvents += Number(row.highCravingEvents) || 0
      byPeriod.set(row._id, existing)
    })
  }

  addRows(checkinRows)
  addRows(smokingRows)

  return [...byPeriod.entries()]
    .map(([period, value]) => ({
      period,
      events: value.events,
      averageCraving: value.events > 0 ? roundNumber(value.weightedTotal / value.events) : 0,
      highCravingEvents: value.highCravingEvents,
    }))
    .sort((a, b) => a.period.localeCompare(b.period))
}

const sendGrafanaSeries = (res: Response, series: PeriodMetric[], valueKey: string) => {
  res.status(200).json(
    series.map((s) => ({
      time: s.period,
      value: s[valueKey] || 0,
    })),
  )
}

export const getOverviewStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const todayStart = startOfDay(new Date())
    const tomorrowStart = endOfDay(todayStart)
    const todayKey = buildDateKey(todayStart)

    const [
      totalUsers,
      activeUsers,
      todayCheckins,
      cravingResult,
      relapsesToday,
      notificationsSent,
      highRiskUsersResult,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: "active" }),
      DailyCheckin.countDocuments({ date: { $gte: todayStart, $lt: tomorrowStart } }),
      DailyCheckin.aggregate<{ _id: null; averageCraving: number }>([
        { $match: { date: { $gte: todayStart, $lt: tomorrowStart }, cravingLevel: { $type: "number" } } },
        { $group: { _id: null, averageCraving: { $avg: "$cravingLevel" } } },
      ]),
      DailyCheckin.countDocuments({
        date: { $gte: todayStart, $lt: tomorrowStart },
        smokedToday: true,
      }),
      NotificationLog.countDocuments({ sentAt: { $gte: todayStart, $lt: tomorrowStart } }),
      RiskSnapshot.aggregate<{ _id: null; users: string[] }>([
        { $match: { dateKey: todayKey, riskLevel: "alto" } },
        { $group: { _id: null, users: { $addToSet: "$userId" } } },
      ]),
    ])

    const payload = {
      totalUsers,
      activeUsers,
      todayCheckins,
      averageCraving: roundNumber(cravingResult[0]?.averageCraving || 0),
      relapsesToday,
      notificationsSent,
      highRiskUsers: highRiskUsersResult[0]?.users.length || 0,
    }

    if (req.query.format === "grafana") {
      res.status(200).json(payload)
      return
    }

    res.status(200).json({
      success: true,
      data: payload,
      meta: {
        dateKey: todayKey,
        from: todayStart.toISOString(),
        to: tomorrowStart.toISOString(),
      },
    })
  } catch (error) {
    console.error("[admin-stats] Error getting overview:", error)
    res.status(500).json({ success: false, message: "Error al obtener resumen analytics" })
  }
}

export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const range = parseDateRange(req)
    const createdAtMatch = { createdAt: { $gte: range.from, $lte: range.to } }
    const lastLoginMatch = { lastLogin: { $gte: range.from, $lte: range.to } }

    const [totals, registrations, activeLogins, planUsage] = await Promise.all([
      User.aggregate<{ _id: null; totalUsers: number; activeUsers: number; pendingUsers: number; inactiveUsers: number; adminUsers: number }>([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
            pendingUsers: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
            inactiveUsers: { $sum: { $cond: [{ $eq: ["$status", "inactive"] }, 1, 0] } },
            adminUsers: { $sum: { $cond: [{ $eq: ["$role", "admin"] }, 1, 0] } },
          },
        },
      ]),
      User.aggregate<{ _id: string; registeredUsers: number }>([
        { $match: createdAtMatch },
        { $group: { _id: periodExpression("createdAt", range.granularity), registeredUsers: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      User.aggregate<{ _id: string; activeUsers: number }>([
        { $match: lastLoginMatch },
        { $group: { _id: periodExpression("lastLogin", range.granularity), activeUsers: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      UserPlan.aggregate<{ _id: string; count: number; averageCompletion: number }>([
        { $match: { createdAt: { $lte: range.to } } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            averageCompletion: { $avg: "$completionPercentage" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ])

    const registrationsByPeriod = new Map(registrations.map((row) => [row._id, row.registeredUsers]))
    const activeByPeriod = new Map(activeLogins.map((row) => [row._id, row.activeUsers]))
    const periods = [...new Set([...registrationsByPeriod.keys(), ...activeByPeriod.keys()])].sort()
    const series = periods.map((period) => ({
      period,
      registeredUsers: registrationsByPeriod.get(period) || 0,
      activeUsers: activeByPeriod.get(period) || 0,
    }))

    if (req.query.format === "grafana") {
      sendGrafanaSeries(res, series, "registeredUsers")
      return
    }

    res.status(200).json({
      success: true,
      data: {
        totals: totals[0] || {
          totalUsers: 0,
          activeUsers: 0,
          pendingUsers: 0,
          inactiveUsers: 0,
          adminUsers: 0,
        },
        series,
        planUsage: planUsage.map((row) => ({
          status: row._id || "unknown",
          count: row.count,
          averageCompletion: roundNumber(row.averageCompletion || 0),
        })),
      },
      meta: rangePayload(range),
    })
  } catch (error) {
    console.error("[admin-stats] Error getting user stats:", error)
    res.status(500).json({ success: false, message: "Error al obtener estadisticas de usuarios" })
  }
}

export const getCheckinStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const range = parseDateRange(req)
    const match = { date: { $gte: range.from, $lte: range.to } }

    const [summary, seriesRows, symptomRows] = await Promise.all([
      DailyCheckin.aggregate<{ _id: null; totalCheckins: number; uniqueUsers: string[]; relapses: number; cigarettesSmoked: number; averageCraving: number }>([
        { $match: match },
        {
          $group: {
            _id: null,
            totalCheckins: { $sum: 1 },
            uniqueUsers: { $addToSet: "$userId" },
            relapses: { $sum: { $cond: ["$smokedToday", 1, 0] } },
            cigarettesSmoked: { $sum: "$cigarettesSmokedCount" },
            averageCraving: { $avg: "$cravingLevel" },
          },
        },
      ]),
      DailyCheckin.aggregate<{ _id: string; checkins: number; uniqueUsers: string[]; relapses: number; cigarettesSmoked: number; averageCraving: number }>([
        { $match: match },
        {
          $group: {
            _id: periodExpression("date", range.granularity),
            checkins: { $sum: 1 },
            uniqueUsers: { $addToSet: "$userId" },
            relapses: { $sum: { $cond: ["$smokedToday", 1, 0] } },
            cigarettesSmoked: { $sum: "$cigarettesSmokedCount" },
            averageCraving: { $avg: "$cravingLevel" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      DailyCheckin.aggregate<{ _id: string; count: number }>([
        { $match: match },
        { $unwind: "$symptoms" },
        { $group: { _id: "$symptoms", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ])

    const summaryRow = summary[0]
    const series = normalizeSeries(seriesRows, (row) => ({
      period: row._id,
      checkins: row.checkins,
      uniqueUsers: row.uniqueUsers.length,
      relapses: row.relapses,
      cigarettesSmoked: row.cigarettesSmoked,
      averageCraving: roundNumber(row.averageCraving || 0),
    }))

    if (req.query.format === "grafana") {
      sendGrafanaSeries(res, series, "checkins")
      return
    }

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalCheckins: summaryRow?.totalCheckins || 0,
          uniqueUsers: summaryRow?.uniqueUsers.length || 0,
          relapses: summaryRow?.relapses || 0,
          cigarettesSmoked: summaryRow?.cigarettesSmoked || 0,
          averageCraving: roundNumber(summaryRow?.averageCraving || 0),
        },
        series,
        topSymptoms: symptomRows.map((row) => ({ symptom: row._id, count: row.count })),
      },
      meta: rangePayload(range),
    })
  } catch (error) {
    console.error("[admin-stats] Error getting checkin stats:", error)
    res.status(500).json({ success: false, message: "Error al obtener estadisticas de check-ins" })
  }
}

export const getCravingStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const range = parseDateRange(req)
    const checkinMatch = { date: { $gte: range.from, $lte: range.to }, cravingLevel: { $type: "number" } }
    const smokingMatch = { timestamp: { $gte: range.from, $lte: range.to }, cravingLevel: { $type: "number" } }

    const baseGroup = (field: string): PipelineStage.Group["$group"] => ({
      _id: periodExpression(field, range.granularity),
      averageCraving: { $avg: "$cravingLevel" },
      events: { $sum: 1 },
      highCravingEvents: { $sum: { $cond: [{ $gte: ["$cravingLevel", 7] }, 1, 0] } },
    })

    const [checkinSummary, smokingSummary, checkinRows, smokingRows] = await Promise.all([
      DailyCheckin.aggregate<{ _id: null; averageCraving: number; events: number; highCravingEvents: number }>([
        { $match: checkinMatch },
        {
          $group: {
            _id: null,
            averageCraving: { $avg: "$cravingLevel" },
            events: { $sum: 1 },
            highCravingEvents: { $sum: { $cond: [{ $gte: ["$cravingLevel", 7] }, 1, 0] } },
          },
        },
      ]),
      SmokingRecord.aggregate<{ _id: null; averageCraving: number; events: number; highCravingEvents: number }>([
        { $match: smokingMatch },
        {
          $group: {
            _id: null,
            averageCraving: { $avg: "$cravingLevel" },
            events: { $sum: 1 },
            highCravingEvents: { $sum: { $cond: [{ $gte: ["$cravingLevel", 7] }, 1, 0] } },
          },
        },
      ]),
      DailyCheckin.aggregate<{ _id: string; averageCraving: number; events: number; highCravingEvents: number }>([
        { $match: checkinMatch },
        { $group: baseGroup("date") },
        { $sort: { _id: 1 } },
      ]),
      SmokingRecord.aggregate<{ _id: string; averageCraving: number; events: number; highCravingEvents: number }>([
        { $match: smokingMatch },
        { $group: baseGroup("timestamp") },
        { $sort: { _id: 1 } },
      ]),
    ])

    const checkinEvents = checkinSummary[0]?.events || 0
    const smokingEvents = smokingSummary[0]?.events || 0
    const totalEvents = checkinEvents + smokingEvents
    const weightedAverage =
      totalEvents > 0
        ? ((checkinSummary[0]?.averageCraving || 0) * checkinEvents +
            (smokingSummary[0]?.averageCraving || 0) * smokingEvents) /
          totalEvents
        : 0

    const cravingSeries = mergeCravingSeries(checkinRows, smokingRows)

    if (req.query.format === "grafana") {
      sendGrafanaSeries(res, cravingSeries, "averageCraving")
      return
    }

    res.status(200).json({
      success: true,
      data: {
        summary: {
          events: totalEvents,
          averageCraving: roundNumber(weightedAverage),
          highCravingEvents: (checkinSummary[0]?.highCravingEvents || 0) + (smokingSummary[0]?.highCravingEvents || 0),
          sources: {
            checkins: checkinEvents,
            smokingRecords: smokingEvents,
          },
        },
        series: cravingSeries,
      },
      meta: rangePayload(range),
    })
  } catch (error) {
    console.error("[admin-stats] Error getting craving stats:", error)
    res.status(500).json({ success: false, message: "Error al obtener estadisticas de cravings" })
  }
}

export const getNotificationStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const range = parseDateRange(req)
    const match = { sentAt: { $gte: range.from, $lte: range.to } }

    const [summary, seriesRows, byTypeRows] = await Promise.all([
      NotificationLog.aggregate<{ _id: null; sent: number; read: number; uniqueUsers: string[] }>([
        { $match: match },
        {
          $group: {
            _id: null,
            sent: { $sum: 1 },
            read: { $sum: { $cond: [{ $ifNull: ["$readAt", false] }, 1, 0] } },
            uniqueUsers: { $addToSet: "$userId" },
          },
        },
      ]),
      NotificationLog.aggregate<{ _id: string; sent: number; read: number; uniqueUsers: string[] }>([
        { $match: match },
        {
          $group: {
            _id: periodExpression("sentAt", range.granularity),
            sent: { $sum: 1 },
            read: { $sum: { $cond: [{ $ifNull: ["$readAt", false] }, 1, 0] } },
            uniqueUsers: { $addToSet: "$userId" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      NotificationLog.aggregate<{ _id: string; sent: number; read: number }>([
        { $match: match },
        {
          $group: {
            _id: "$type",
            sent: { $sum: 1 },
            read: { $sum: { $cond: [{ $ifNull: ["$readAt", false] }, 1, 0] } },
          },
        },
        { $sort: { sent: -1 } },
      ]),
    ])

    const summaryRow = summary[0]
    const readRate = summaryRow && summaryRow.sent > 0 ? (summaryRow.read / summaryRow.sent) * 100 : 0
    const notifSeries = normalizeSeries(seriesRows, (row) => ({
      period: row._id,
      sent: row.sent,
      read: row.read,
      readRate: row.sent > 0 ? roundNumber((row.read / row.sent) * 100) : 0,
      uniqueUsers: row.uniqueUsers.length,
    }))

    if (req.query.format === "grafana") {
      sendGrafanaSeries(res, notifSeries, "sent")
      return
    }

    res.status(200).json({
      success: true,
      data: {
        summary: {
          sent: summaryRow?.sent || 0,
          read: summaryRow?.read || 0,
          readRate: roundNumber(readRate),
          uniqueUsers: summaryRow?.uniqueUsers.length || 0,
        },
        series: notifSeries,
        byType: byTypeRows.map((row) => ({
          type: row._id,
          sent: row.sent,
          read: row.read,
          readRate: row.sent > 0 ? roundNumber((row.read / row.sent) * 100) : 0,
        })),
      },
      meta: rangePayload(range),
    })
  } catch (error) {
    console.error("[admin-stats] Error getting notification stats:", error)
    res.status(500).json({ success: false, message: "Error al obtener estadisticas de notificaciones" })
  }
}

export const getHighRiskUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await RiskSnapshot.aggregate([
      { $sort: { dateKey: -1, createdAt: -1 } },
      {
        $group: {
          _id: "$userId",
          riskScore: { $first: "$riskScore" },
          riskLevel: { $first: "$riskLevel" },
          factors: { $first: "$factors" },
          cravingLevel: { $first: "$cravingLevel" },
          mood: { $first: "$mood" },
          smokedToday: { $first: "$smokedToday" },
          currentStreak: { $first: "$currentStreak" },
          lastSnapshot: { $first: "$dateKey" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "dailycheckins",
          let: { userId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$userId", "$$userId"] } } },
            { $sort: { date: -1 } },
            { $limit: 1 },
          ],
          as: "lastCheckin",
        },
      },
      { $unwind: { path: "$lastCheckin", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "dailycheckins",
          let: { userId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$userId", "$$userId"] }, smokedToday: true } },
            { $sort: { date: -1 } },
            { $limit: 5 },
            { $project: { date: 1, cigarettesSmokedCount: 1 } },
          ],
          as: "recentRelapses",
        },
      },
      {
        $project: {
          _id: 1,
          name: "$user.name",
          email: "$user.email",
          userId: "$user._id",
          role: "$user.role",
          status: "$user.status",
          riskScore: 1,
          riskLevel: 1,
          factors: 1,
          cravingLevel: 1,
          mood: 1,
          smokedToday: 1,
          currentStreak: 1,
          lastSnapshot: 1,
          lastCheckin: {
            date: "$lastCheckin.date",
            cravingLevel: "$lastCheckin.cravingLevel",
            mood: "$lastCheckin.mood",
            symptoms: "$lastCheckin.symptoms",
            smokedToday: "$lastCheckin.smokedToday",
          },
          recentRelapses: 1,
        },
      },
      { $sort: { riskScore: -1 } },
      { $limit: 50 },
    ])

    res.status(200).json({
      success: true,
      data: users,
    })
  } catch (error) {
    console.error("[admin-stats] Error getting high risk users:", error)
    res.status(500).json({ success: false, message: "Error al obtener usuarios de alto riesgo" })
  }
}

export const getSymptomsStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const range = parseDateRange(req)
    const match = { date: { $gte: range.from, $lte: range.to }, symptoms: { $exists: true, $ne: [] } }

    const [symptomBreakdown, symptomSeries] = await Promise.all([
      DailyCheckin.aggregate<{ _id: string; count: number; uniqueUsers: string[] }>([
        { $match: match },
        { $unwind: "$symptoms" },
        {
          $group: {
            _id: "$symptoms",
            count: { $sum: 1 },
            uniqueUsers: { $addToSet: "$userId" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),
      DailyCheckin.aggregate<{ _id: string; symptoms: Array<{ name: string; count: number }> }>([
        { $match: match },
        { $unwind: "$symptoms" },
        {
          $group: {
            _id: { period: periodExpression("date", range.granularity), symptom: "$symptoms" },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: "$_id.period",
            symptoms: { $push: { name: "$_id.symptom", count: "$count" } },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ])

    const totalAffected = await DailyCheckin.distinct("userId", match)
    const symptomTimeSeries = normalizeSeries(symptomSeries, (row) => ({
      period: row._id,
      symptomCount: row.symptoms.reduce((sum, sym) => sum + sym.count, 0),
    }))

    if (req.query.format === "grafana") {
      sendGrafanaSeries(res, symptomTimeSeries, "symptomCount")
      return
    }

    res.status(200).json({
      success: true,
      data: {
        totalSymptoms: symptomBreakdown.reduce((sum, s) => sum + s.count, 0),
        uniqueSymptoms: symptomBreakdown.length,
        affectedUsers: totalAffected.length,
        breakdown: symptomBreakdown.map((s) => ({
          symptom: s._id,
          count: s.count,
          uniqueUsers: s.uniqueUsers.length,
        })),
        series: symptomSeries.map((s) => ({
          period: s._id,
          symptoms: s.symptoms.sort((a, b) => b.count - a.count).slice(0, 5),
        })),
      },
      meta: rangePayload(range),
    })
  } catch (error) {
    console.error("[admin-stats] Error getting symptoms stats:", error)
    res.status(500).json({ success: false, message: "Error al obtener estadisticas de sintomas" })
  }
}

export const getRelapseStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const range = parseDateRange(req)

    const [relapseSeries, summary] = await Promise.all([
      DailyCheckin.aggregate<{ _id: string; relapses: number; cigarettesSmoked: number; uniqueUsers: string[] }>([
        {
          $match: {
            date: { $gte: range.from, $lte: range.to },
            smokedToday: true,
          },
        },
        {
          $group: {
            _id: periodExpression("date", range.granularity),
            relapses: { $sum: 1 },
            cigarettesSmoked: { $sum: { $ifNull: ["$cigarettesSmokedCount", 0] } },
            uniqueUsers: { $addToSet: "$userId" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      DailyCheckin.aggregate<{
        _id: null
        totalRelapses: number
        totalCigarettes: number
        totalUsers: string[]
      }>([
        {
          $match: {
            date: { $gte: range.from, $lte: range.to },
            smokedToday: true,
          },
        },
        {
          $group: {
            _id: null,
            totalRelapses: { $sum: 1 },
            totalCigarettes: { $sum: { $ifNull: ["$cigarettesSmokedCount", 0] } },
            totalUsers: { $addToSet: "$userId" },
          },
        },
      ]),
    ])

    const summaryRow = summary[0]
    const series = normalizeSeries(relapseSeries, (row) => ({
      period: row._id,
      relapses: row.relapses,
      cigarettesSmoked: row.cigarettesSmoked,
      uniqueUsers: row.uniqueUsers.length,
    }))

    if (req.query.format === "grafana") {
      sendGrafanaSeries(res, series, "relapses")
      return
    }

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRelapses: summaryRow?.totalRelapses || 0,
          totalCigarettes: summaryRow?.totalCigarettes || 0,
          affectedUsers: summaryRow?.totalUsers.length || 0,
        },
        series,
      },
      meta: rangePayload(range),
    })
  } catch (error) {
    console.error("[admin-stats] Error getting relapse stats:", error)
    res.status(500).json({ success: false, message: "Error al obtener estadisticas de recaidas" })
  }
}

export const getResearchStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const range = parseDateRange(req)
    const match = { date: { $gte: range.from, $lte: range.to } }

    const [mostActiveUsers, planAdherence, weeklyTrend] = await Promise.all([
      DailyCheckin.aggregate<{ _id: string; checkins: number; lastCheckin: Date; name: string; email: string }>([
        { $match: match },
        { $group: { _id: "$userId", checkins: { $sum: 1 }, lastCheckin: { $max: "$date" } } },
        { $sort: { checkins: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            _id: 1,
            name: "$user.name",
            email: "$user.email",
            checkins: 1,
            lastCheckin: 1,
          },
        },
      ]),
      UserPlan.aggregate<{ _id: string; count: number; avgCompletion: number; avgCurrentDay: number }>([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            avgCompletion: { $avg: "$completionPercentage" },
            avgCurrentDay: { $avg: "$currentDay" },
          },
        },
      ]),
      DailyCheckin.aggregate<{ _id: string; avgCraving: number; checkins: number; relapses: number }>([
        { $match: match },
        {
          $group: {
            _id: periodExpression("date", "week"),
            avgCraving: { $avg: "$cravingLevel" },
            checkins: { $sum: 1 },
            relapses: { $sum: { $cond: ["$smokedToday", 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ])

    const weeklySeries = normalizeSeries(weeklyTrend, (row) => ({
      period: row._id,
      avgCraving: roundNumber(row.avgCraving || 0),
      checkins: row.checkins,
      relapses: row.relapses,
    }))

    if (req.query.format === "grafana") {
      sendGrafanaSeries(res, weeklySeries, "checkins")
      return
    }

    res.status(200).json({
      success: true,
      data: {
        mostActiveUsers: mostActiveUsers.map((u) => ({
          id: u._id,
          name: u.name,
          email: u.email,
          checkins: u.checkins,
          lastCheckin: u.lastCheckin,
        })),
        planAdherence: planAdherence.map((p) => ({
          status: p._id,
          count: p.count,
          averageCompletion: roundNumber(p.avgCompletion || 0),
          averageCurrentDay: Math.round(p.avgCurrentDay || 0),
        })),
        weeklyTrend: weeklySeries,
      },
      meta: rangePayload(range),
    })
  } catch (error) {
    console.error("[admin-stats] Error getting research stats:", error)
    res.status(500).json({ success: false, message: "Error al obtener estadisticas de investigacion" })
  }
}

export const exportCheckinsCSV = async (req: Request, res: Response): Promise<void> => {
  try {
    const range = parseDateRange(req)

    const checkins = await DailyCheckin.find({
      date: { $gte: range.from, $lte: range.to },
    })
      .populate("userId", "name email")
      .sort({ date: -1 })
      .lean()

    const header = "fecha,craving,fumado,sintomas,cigarrillos,usuario,email\n"
    const rows = checkins
      .map((c: any) => {
        const date = c.date ? new Date(c.date).toISOString().split("T")[0] : ""
        const craving = c.cravingLevel ?? ""
        const smoked = c.smokedToday ? "si" : "no"
        const symptoms = (c.symptoms || []).join(";")
        const cigarettes = c.cigarettesSmokedCount ?? 0
        const userName = c.userId?.name || ""
        const userEmail = c.userId?.email || ""
        return `"${date}",${craving},"${smoked}","${symptoms}",${cigarettes},"${userName}","${userEmail}"`
      })
      .join("\n")

    const csv = header + rows

    res.setHeader("Content-Type", "text/csv; charset=utf-8")
    res.setHeader("Content-Disposition", `attachment; filename=checkins-export-${buildDateKey(new Date())}.csv`)
    res.status(200).send(csv)
  } catch (error) {
    console.error("[admin-stats] Error exporting CSV:", error)
    res.status(500).json({ success: false, message: "Error al exportar CSV" })
  }
}

const grafanaResponse = (series: PeriodMetric[], valueKey: string) => {
  return series.map((s) => ({
    time: s.period,
    value: s[valueKey] || 0,
  }))
}

export const withGrafanaFormat = (
  req: Request,
  res: Response,
  data: Record<string, unknown>,
  grafanaSeries?: PeriodMetric[],
  grafanaValueKey?: string,
): boolean => {
  if (req.query.format === "grafana" && grafanaSeries && grafanaValueKey) {
    res.status(200).json(grafanaResponse(grafanaSeries, grafanaValueKey))
    return true
  }
  return false
}

export const getSummaryStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const todayStart = startOfDay(new Date())
    const tomorrowStart = endOfDay(todayStart)
    const todayKey = buildDateKey(todayStart)

    const [totalUsers, activeUsers, cravingResult, relapsesResult, activePlans, completedPlans] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: "active" }),
      DailyCheckin.aggregate<{ _id: null; averageCraving: number }>([
        { $match: { date: { $gte: todayStart, $lt: tomorrowStart }, cravingLevel: { $type: "number" } } },
        { $group: { _id: null, averageCraving: { $avg: "$cravingLevel" } } },
      ]),
      DailyCheckin.countDocuments({ date: { $gte: todayStart, $lt: tomorrowStart }, smokedToday: true }),
      UserPlan.countDocuments({ status: "active" }),
      UserPlan.countDocuments({ status: "completed" }),
    ])

    const payload = {
      totalUsers,
      activeUsers,
      averageCraving: roundNumber(cravingResult[0]?.averageCraving || 0),
      totalRelapses: relapsesResult,
      activePlans,
      completedPlans,
    }

    if (req.query.format === "grafana") {
      res.status(200).json(payload)
      return
    }

    res.status(200).json({ success: true, data: payload })
  } catch (error) {
    console.error("[admin-stats] Error getting summary:", error)
    res.status(500).json({ success: false, message: "Error al obtener resumen" })
  }
}

export const getHeatmapCravings = async (req: Request, res: Response): Promise<void> => {
  try {
    const range = parseDateRange(req)

    const heatmap = await DailyCheckin.aggregate<{
      _id: { dayOfWeek: number; hour: number }
      avgCraving: number
      count: number
    }>([
      { $match: { date: { $gte: range.from, $lte: range.to }, cravingLevel: { $type: "number" } } },
      {
        $group: {
          _id: {
            dayOfWeek: { $dayOfWeek: "$date" },
            hour: { $hour: "$date" },
          },
          avgCraving: { $avg: "$cravingLevel" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.dayOfWeek": 1, "_id.hour": 1 } },
    ])

    const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"]
    const result = heatmap
      .filter((h) => h._id.dayOfWeek >= 1 && h._id.dayOfWeek <= 7)
      .map((h) => ({
        x: dayNames[h._id.dayOfWeek - 1] || `D${h._id.dayOfWeek}`,
        y: `${h._id.hour}:00`,
        value: roundNumber(h.avgCraving),
        count: h.count,
      }))

    res.status(200).json({ success: true, data: result })
  } catch (error) {
    console.error("[admin-stats] Error getting heatmap:", error)
    res.status(500).json({ success: false, message: "Error al obtener heatmap de cravings" })
  }
}

export const getAlertsHighRisk = async (req: Request, res: Response): Promise<void> => {
  try {
    const range = parseDateRange(req)
    const todayKey = buildDateKey(new Date())

    const [recentAlerts, recentRelapses] = await Promise.all([
      RiskSnapshot.aggregate([
        { $match: { dateKey: todayKey, riskLevel: "alto" } },
        { $sort: { riskScore: -1 } },
        { $limit: 20 },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "dailycheckins",
            let: { uid: "$userId" },
            pipeline: [
              { $match: { $expr: { $eq: ["$userId", "$$uid"] } } },
              { $sort: { date: -1 } },
              { $limit: 1 },
            ],
            as: "lastCheckin",
          },
        },
        { $unwind: { path: "$lastCheckin", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            userId: 1,
            userName: "$user.name",
            userEmail: "$user.email",
            riskScore: 1,
            riskLevel: 1,
            factors: 1,
            cravingLevel: 1,
            mood: 1,
            smokedToday: 1,
            currentStreak: 1,
            lastCheckinDate: "$lastCheckin.date",
            lastCraving: "$lastCheckin.cravingLevel",
            lastSymptoms: "$lastCheckin.symptoms",
          },
        },
      ]),
      DailyCheckin.aggregate([
        { $match: { date: { $gte: range.from, $lte: range.to }, smokedToday: true } },
        { $sort: { date: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            userName: "$user.name",
            userEmail: "$user.email",
            date: 1,
            cravingLevel: 1,
            cigarettesSmokedCount: 1,
            symptoms: 1,
          },
        },
      ]),
    ])

    const payload = { alerts: recentAlerts, recentRelapses }

    if (req.query.format === "grafana") {
      res.status(200).json(payload)
      return
    }

    res.status(200).json({ success: true, data: payload })
  } catch (error) {
    console.error("[admin-stats] Error getting alerts:", error)
    res.status(500).json({ success: false, message: "Error al obtener alertas de alto riesgo" })
  }
}
