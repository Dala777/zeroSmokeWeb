import fs from "fs"
import path from "path"

type PlanLevel = "low" | "moderate" | "high"

interface LegacyPlanDay {
  "Día"?: string | number
  day?: string | number
  "Actividad Principal"?: string
  Actividades?: string
  "Actividad Secundaria"?: string
  "Actividad Secundaria (opcional)"?: string
  "Justificación"?: string
  "Respaldo científico"?: string
  Fundamento?: string
}

interface LegacyPlanSection {
  title?: string
  days?: LegacyPlanDay[]
}

interface LegacyPlan {
  plan?: string
  description?: string
  sections?: LegacyPlanSection[]
}

interface LegacyPlansFile {
  planes_zerosmoke?: LegacyPlan[]
}

export interface BackendPlanActivity {
  day: number
  title: string
  description: string
  secondary: string
  justification: string
}

export interface BackendFriendlyPlan {
  level: PlanLevel
  durationDays: number
  description: string
  activities: BackendPlanActivity[]
}

export interface TransformationIssue {
  severity: "warning" | "error"
  plan?: string
  section?: string
  day?: string | number
  message: string
}

export interface TransformationReport {
  totalInputActivities: number
  totalOutputActivities: number
  issues: TransformationIssue[]
  planSummaries: Array<{
    sourcePlan: string
    level: PlanLevel
    inputActivities: number
    outputActivities: number
    durationDays: number
    duplicateDays: number[]
    missingDays: number[]
  }>
}

export interface TransformationResult {
  plans: BackendFriendlyPlan[]
  report: TransformationReport
}

const DEFAULT_INPUT_PATH = path.join(__dirname, "planes_zerosmoke.json")
const DEFAULT_OUTPUT_PATH = path.join(__dirname, "planes_backend_friendly.json")

const PLAN_METADATA: Record<string, { level: PlanLevel; expectedDurationDays: number }> = {
  "PLAN 1": { level: "low", expectedDurationDays: 45 },
  "PLAN 2": { level: "moderate", expectedDurationDays: 60 },
  "PLAN 3": { level: "high", expectedDurationDays: 90 },
}

const normalizeText = (value: unknown): string => {
  if (typeof value !== "string") {
    return ""
  }

  return value.trim()
}

const parseDayValue = (value: string | number | undefined): { day?: number; raw: string } => {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return { day: value, raw: value.toString() }
  }

  if (typeof value === "string") {
    const trimmed = value.trim()
    if (/^\d+$/.test(trimmed)) {
      return { day: Number(trimmed), raw: trimmed }
    }
    return { raw: trimmed }
  }

  return { raw: "" }
}

const getSecondaryText = (entry: LegacyPlanDay): string =>
  normalizeText(entry["Actividad Secundaria (opcional)"] ?? entry["Actividad Secundaria"])

const getJustificationText = (entry: LegacyPlanDay): string =>
  normalizeText(entry["Justificación"] ?? entry["Respaldo científico"] ?? entry.Fundamento)

export const readLegacyPlansFile = (inputPath: string = DEFAULT_INPUT_PATH): LegacyPlansFile => {
  let raw = fs.readFileSync(inputPath, "utf-8")
  if (raw.charCodeAt(0) === 0xfeff) {
    raw = raw.slice(1)
  }

  return JSON.parse(raw) as LegacyPlansFile
}

export const transformLegacyPlans = (source: LegacyPlansFile): TransformationResult => {
  const issues: TransformationIssue[] = []
  const plans: BackendFriendlyPlan[] = []
  const planSummaries: TransformationReport["planSummaries"] = []

  const legacyPlans = Array.isArray(source.planes_zerosmoke) ? source.planes_zerosmoke : []
  let totalInputActivities = 0
  let totalOutputActivities = 0

  legacyPlans.forEach((legacyPlan) => {
    const sourcePlan = normalizeText(legacyPlan.plan) || "UNKNOWN"
    const metadata = PLAN_METADATA[sourcePlan]

    if (!metadata) {
      issues.push({
        severity: "error",
        plan: sourcePlan,
        message: "Plan no mapeado a level. Revisa PLAN_METADATA.",
      })
      return
    }

    const sections = Array.isArray(legacyPlan.sections) ? legacyPlan.sections : []
    const activities: BackendPlanActivity[] = []
    const seenDays = new Map<number, number>()
    const inputActivities = sections.reduce((total, section) => total + (section.days?.length || 0), 0)

    totalInputActivities += inputActivities

    sections.forEach((section) => {
      const sectionTitle = normalizeText(section.title)
      const sectionDays = Array.isArray(section.days) ? section.days : []

      sectionDays.forEach((entry) => {
        const parsedDay = parseDayValue(entry["Día"] ?? entry.day)
        const rawDay = parsedDay.raw

        if (!parsedDay.day) {
          issues.push({
            severity: "error",
            plan: sourcePlan,
            section: sectionTitle,
            day: rawDay,
            message: 'Valor de "Día" mal formateado o no numérico.',
          })
          return
        }

        const description = normalizeText(entry["Actividad Principal"] ?? entry.Actividades)
        const secondary = getSecondaryText(entry)
        const justification = getJustificationText(entry)

        if (!description) {
          issues.push({
            severity: "warning",
            plan: sourcePlan,
            section: sectionTitle,
            day: parsedDay.day,
            message: 'Actividad sin "Actividad Principal".',
          })
        }

        if (!justification) {
          issues.push({
            severity: "warning",
            plan: sourcePlan,
            section: sectionTitle,
            day: parsedDay.day,
            message: 'Actividad sin "Justificación".',
          })
        }

        seenDays.set(parsedDay.day, (seenDays.get(parsedDay.day) || 0) + 1)

        activities.push({
          day: parsedDay.day,
          title: sectionTitle || `Día ${parsedDay.day}`,
          description,
          secondary,
          justification,
        })
      })
    })

    activities.sort((left, right) => left.day - right.day)

    const duplicateDays = [...seenDays.entries()]
      .filter(([, count]) => count > 1)
      .map(([day]) => day)

    duplicateDays.forEach((day) => {
      issues.push({
        severity: "warning",
        plan: sourcePlan,
        day,
        message: "Día repetido detectado dentro del mismo plan.",
      })
    })

    const maxDay = activities.reduce((highest, activity) => Math.max(highest, activity.day), 0)
    const durationDays = maxDay || metadata.expectedDurationDays
    const missingDays: number[] = []

    for (let day = 1; day <= durationDays; day += 1) {
      if (!seenDays.has(day)) {
        missingDays.push(day)
      }
    }

    if (durationDays !== metadata.expectedDurationDays) {
      issues.push({
        severity: "warning",
        plan: sourcePlan,
        message: `La duración detectada (${durationDays}) no coincide con la esperada (${metadata.expectedDurationDays}).`,
      })
    }

    if (activities.length !== inputActivities) {
      issues.push({
        severity: "error",
        plan: sourcePlan,
        message: "La cantidad de actividades transformadas no coincide con la cantidad de entradas de origen.",
      })
    }

    totalOutputActivities += activities.length

    plans.push({
      level: metadata.level,
      durationDays,
      description: normalizeText(legacyPlan.description),
      activities,
    })

    planSummaries.push({
      sourcePlan,
      level: metadata.level,
      inputActivities,
      outputActivities: activities.length,
      durationDays,
      duplicateDays,
      missingDays,
    })
  })

  return {
    plans,
    report: {
      totalInputActivities,
      totalOutputActivities,
      issues,
      planSummaries,
    },
  }
}

export const writeTransformedPlansFile = (
  inputPath: string = DEFAULT_INPUT_PATH,
  outputPath: string = DEFAULT_OUTPUT_PATH,
): TransformationResult => {
  const result = transformLegacyPlans(readLegacyPlansFile(inputPath))
  fs.writeFileSync(outputPath, `${JSON.stringify({ plans: result.plans }, null, 2)}\n`, "utf-8")
  return result
}

const logReport = (report: TransformationReport): void => {
  console.log(`Actividades origen: ${report.totalInputActivities}`)
  console.log(`Actividades salida: ${report.totalOutputActivities}`)

  report.planSummaries.forEach((summary) => {
    console.log(
      `[${summary.sourcePlan}] level=${summary.level} durationDays=${summary.durationDays} input=${summary.inputActivities} output=${summary.outputActivities}`,
    )

    if (summary.duplicateDays.length > 0) {
      console.log(`  duplicateDays: ${summary.duplicateDays.join(", ")}`)
    }

    if (summary.missingDays.length > 0) {
      console.log(`  missingDays: ${summary.missingDays.join(", ")}`)
    }
  })

  if (report.issues.length > 0) {
    console.log("\nIssues detectados:")
    report.issues.forEach((issue) => {
      const location = [issue.plan, issue.section, issue.day].filter(Boolean).join(" | ")
      console.log(`- [${issue.severity}] ${location}: ${issue.message}`)
    })
  }
}

const runCli = (): void => {
  const result = writeTransformedPlansFile()
  logReport(result.report)

  const blockingErrors = result.report.issues.filter((issue) => issue.severity === "error")
  if (blockingErrors.length > 0) {
    process.exitCode = 1
    return
  }

  console.log(`\nArchivo generado: ${DEFAULT_OUTPUT_PATH}`)
}

if (require.main === module) {
  runCli()
}
