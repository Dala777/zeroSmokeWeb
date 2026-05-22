import axios from "axios"
import "./api"

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"
const ADMIN_STATS_URL = `${API_URL}/admin/stats`

export type AnalyticsGranularity = "day" | "week" | "month"

export interface AnalyticsFilters {
  from: string
  to: string
  granularity: AnalyticsGranularity
}

export interface OverviewStats {
  totalUsers: number
  activeUsers: number
  todayCheckins: number
  averageCraving: number
  relapsesToday: number
  notificationsSent: number
  highRiskUsers: number
}

export interface UserStats {
  totals: {
    totalUsers: number
    activeUsers: number
    pendingUsers: number
    inactiveUsers: number
    adminUsers: number
  }
  series: Array<{
    period: string
    registeredUsers: number
    activeUsers: number
  }>
  planUsage: Array<{
    status: string
    count: number
    averageCompletion: number
  }>
}

export interface CheckinStats {
  summary: {
    totalCheckins: number
    uniqueUsers: number
    relapses: number
    cigarettesSmoked: number
    averageCraving: number
  }
  series: Array<{
    period: string
    checkins: number
    uniqueUsers: number
    relapses: number
    cigarettesSmoked: number
    averageCraving: number
  }>
  topSymptoms: Array<{
    symptom: string
    count: number
  }>
}

export interface CravingStats {
  summary: {
    events: number
    averageCraving: number
    highCravingEvents: number
    sources: {
      checkins: number
      smokingRecords: number
    }
  }
  series: Array<{
    period: string
    events: number
    averageCraving: number
    highCravingEvents: number
  }>
}

export interface NotificationStats {
  summary: {
    sent: number
    read: number
    readRate: number
    uniqueUsers: number
  }
  series: Array<{
    period: string
    sent: number
    read: number
    readRate: number
    uniqueUsers: number
  }>
  byType: Array<{
    type: string
    sent: number
    read: number
    readRate: number
  }>
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

const request = async <T>(path: string, params?: AnalyticsFilters): Promise<T> => {
  const response = await axios.get<ApiResponse<T>>(`${ADMIN_STATS_URL}${path}`, { params })

  if (!response.data?.success) {
    throw new Error(response.data?.message || "No se pudieron cargar las metricas")
  }

  return response.data.data
}

export interface HighRiskUser {
  _id: string
  name: string
  email: string
  userId: string
  role: string
  status: string
  riskScore: number
  riskLevel: string
  factors: string[]
  cravingLevel: number
  mood: string
  smokedToday: boolean
  currentStreak: number
  lastSnapshot: string
  lastCheckin: {
    date: string
    cravingLevel: number
    mood: string
    symptoms: string[]
    smokedToday: boolean
  } | null
  recentRelapses: Array<{
    date: string
    cigarettesSmokedCount: number
  }>
}

export interface SymptomStats {
  totalSymptoms: number
  uniqueSymptoms: number
  affectedUsers: number
  breakdown: Array<{
    symptom: string
    count: number
    uniqueUsers: number
  }>
  series: Array<{
    period: string
    symptoms: Array<{
      name: string
      count: number
    }>
  }>
}

export interface ResearchStats {
  mostActiveUsers: Array<{
    id: string
    name: string
    email: string
    checkins: number
    lastCheckin: string
  }>
  planAdherence: Array<{
    status: string
    count: number
    averageCompletion: number
    averageCurrentDay: number
  }>
  weeklyTrend: Array<{
    period: string
    avgCraving: number
    checkins: number
    relapses: number
  }>
}

export interface RelapseStats {
  summary: {
    totalRelapses: number
    totalCigarettes: number
    affectedUsers: number
  }
  series: Array<{
    period: string
    relapses: number
    cigarettesSmoked: number
    uniqueUsers: number
  }>
}

export const adminStatsService = {
  getOverview: () => request<OverviewStats>("/overview"),
  getUsersStats: (filters: AnalyticsFilters) => request<UserStats>("/users", filters),
  getCheckinsStats: (filters: AnalyticsFilters) => request<CheckinStats>("/checkins", filters),
  getCravingsStats: (filters: AnalyticsFilters) => request<CravingStats>("/cravings", filters),
  getNotificationsStats: (filters: AnalyticsFilters) => request<NotificationStats>("/notifications", filters),
  getHighRiskUsers: () => request<HighRiskUser[]>("/high-risk-users"),
  getSymptomsStats: (filters: AnalyticsFilters) => request<SymptomStats>("/symptoms", filters),
  getRelapseStats: (filters: AnalyticsFilters) => request<RelapseStats>("/relapses", filters),
  getResearchStats: (filters: AnalyticsFilters) => request<ResearchStats>("/research", filters),
  downloadCheckinsCSV: async () => {
    const response = await axios.get(`${ADMIN_STATS_URL}/export/checkins`, {
      responseType: "blob",
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `checkins-export-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}

export default adminStatsService
