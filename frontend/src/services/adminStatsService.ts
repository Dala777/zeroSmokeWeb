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

const getAuthToken = (): string | null => localStorage.getItem("token")

const request = async <T>(path: string, params?: AnalyticsFilters): Promise<T> => {
  const token = getAuthToken()
  const response = await axios.get<ApiResponse<T>>(`${ADMIN_STATS_URL}${path}`, {
    params,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })

  if (!response.data?.success) {
    throw new Error(response.data?.message || "No se pudieron cargar las metricas")
  }

  return response.data.data
}

export const adminStatsService = {
  getOverview: () => request<OverviewStats>("/overview"),
  getUsersStats: (filters: AnalyticsFilters) => request<UserStats>("/users", filters),
  getCheckinsStats: (filters: AnalyticsFilters) => request<CheckinStats>("/checkins", filters),
  getCravingsStats: (filters: AnalyticsFilters) => request<CravingStats>("/cravings", filters),
  getNotificationsStats: (filters: AnalyticsFilters) => request<NotificationStats>("/notifications", filters),
}

export default adminStatsService
