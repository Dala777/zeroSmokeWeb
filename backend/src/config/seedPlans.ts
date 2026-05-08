import { Plan } from "../models/Plan"
import { Activity } from "../models/Activity"
import { readLegacyPlansFile, transformLegacyPlans } from "./transformPlans"

const seedPlans = async (): Promise<void> => {
  try {
    console.log("Iniciando seed de planes...")

    await Plan.deleteMany({})
    await Activity.deleteMany({})

    const planMetas = [
      { name: "Dependencia Baja", duration: 45, dependencyLevel: "bajo", fagerstromRange: { min: 0, max: 3 } },
      { name: "Dependencia Moderada", duration: 60, dependencyLevel: "moderado", fagerstromRange: { min: 4, max: 6 } },
      { name: "Dependencia Alta", duration: 90, dependencyLevel: "alto", fagerstromRange: { min: 7, max: 10 } },
    ]

    let transformedPlans: ReturnType<typeof transformLegacyPlans>["plans"] = []

    try {
      const transformed = transformLegacyPlans(readLegacyPlansFile())
      transformedPlans = transformed.plans
      console.log("JSON de planes transformado a formato backend-friendly")

      transformed.report.issues.forEach((issue) => {
        const location = [issue.plan, issue.section, issue.day].filter(Boolean).join(" | ")
        console.log(`[${issue.severity}] ${location}: ${issue.message}`)
      })
    } catch (error: any) {
      console.warn("No se pudo transformar planes_zerosmoke.json, se usarán valores básicos:", error.message)
    }

    const plansData = planMetas.map((meta, index) => ({
      ...meta,
      description: transformedPlans[index]?.description || "",
    }))

    const plans = await Plan.insertMany(plansData)
    console.log("Planes creados:", plans.length)

    const activities: any[] = []

    transformedPlans.forEach((plan, planIndex) => {
      const planDoc = plans[planIndex]
      const dayCounters = new Map<number, number>()

      plan.activities.forEach((activity) => {
        const orderForDay = (dayCounters.get(activity.day) || 0) + 1
        dayCounters.set(activity.day, orderForDay)

        activities.push({
          planId: planDoc._id,
          dayNumber: activity.day,
          title: activity.title,
          description: activity.description || "",
          type: "education",
          durationMinutes: 10,
          scientificBasis: activity.justification || "",
          secondaryActivity: {
            title: activity.secondary || "",
            description: "",
            isOptional: true,
          },
          order: orderForDay,
        })
      })
    })

    if (activities.length > 0) {
      await Activity.insertMany(activities)
      console.log(`Seeding ${activities.length} actividades desde JSON transformado`)
    } else {
      console.warn("No se generaron actividades: revisa planes_zerosmoke.json o la transformación.")
    }
  } catch (error) {
    console.error("Error al seed de planes:", error)
  }
}

export default seedPlans
