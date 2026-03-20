import { Plan } from "../models/Plan"
import { Activity } from "../models/Activity"
import fs from "fs"
import path from "path"

const seedPlans = async (): Promise<void> => {
  try {
    console.log("Iniciando seed de planes...")

    // Limpiar colecciones
    await Plan.deleteMany({})
    await Activity.deleteMany({})

    // información fija para cada plan (duración, nivel y rango de Fagerström)
    const planMetas = [
      { name: "Dependencia Baja", duration: 45, dependencyLevel: "bajo", fagerstromRange: { min: 0, max: 3 } },
      { name: "Dependencia Moderada", duration: 60, dependencyLevel: "moderado", fagerstromRange: { min: 4, max: 6 } },
      { name: "Dependencia Alta", duration: 90, dependencyLevel: "alto", fagerstromRange: { min: 7, max: 10 } },
    ]

    // cargar JSON externo con la estructura completa de planes
    let planJson: any = null
    try {
      let raw = fs.readFileSync(path.join(__dirname, "planes_zerosmoke.json"), "utf-8")
      // eliminar BOM si existe (algunos editores lo agregan)
      if (raw.charCodeAt(0) === 0xfeff) {
        raw = raw.slice(1)
      }
      planJson = JSON.parse(raw)
      console.log("JSON de planes cargado, se utilizará para generar actividades")
    } catch (e: any) {
      console.warn("No se pudo cargar planes_zerosmoke.json – se usarán valores básicos:", e.message)
    }

    // crear documentos Plan añadiendo la descripción si está en el JSON
    const plansData = planMetas.map((meta, idx) => ({
      ...meta,
      description: planJson?.planes_zerosmoke?.[idx]?.description || "",
    }))

    const plans = await Plan.insertMany(plansData)
    console.log("Planes creados:", plans.length)

    // generar actividades a partir del JSON
    const activities: any[] = []
    if (planJson && Array.isArray(planJson.planes_zerosmoke)) {
      planJson.planes_zerosmoke.forEach((p: any, planIdx: number) => {
        const planDoc = plans[planIdx]
        p.sections.forEach((section: any) => {
          (section.days || []).forEach((day: any) => {
            const dayNumber = Number(day["Día"] || day["day"])
            if (!dayNumber) return

            const primary =
              day["Actividad Principal"] ||
              day["Actividades"] ||
              ""
            const secondary =
              day["Actividad Secundaria (opcional)"] ||
              day["Actividad Secundaria"] ||
              ""
            const scientific =
              day["Justificación"] ||
              day["Respaldo científico"] ||
              day["Fundamento"] ||
              ""

            activities.push({
              planId: planDoc._id,
              dayNumber,
              title: primary,
              // si no hay descripción detallada usamos el título
              description: primary || "",
              type: "education",
              durationMinutes: 10,
              scientificBasis: scientific,
              secondaryActivity: {
                title: secondary,
                description: "",
                isOptional: true,
              },
              order: dayNumber,
            })
          })
        })
      })
    }

    if (activities.length > 0) {
      await Activity.insertMany(activities)
      console.log(`Seeding ${activities.length} actividades desde JSON`)
    } else {
      console.warn(
        "No se generaron actividades: revisa planes_zerosmoke.json o agrega datos manualmente."
      )
    }
  } catch (error) {
    console.error("Error al seed de planes:", error)
  }
}

export default seedPlans;
