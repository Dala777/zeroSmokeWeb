import type { Request, Response } from "express"
import UserProgress from "../models/UserProgress"
import DailyPlan from "../models/DailyPlan"
import SmokingRecord from "../models/SmokingRecord"
import { Plan } from "../models/Plan"
import { ensureUserPlanForProgress, normalizePlanLevels } from "../services/userPlan.service"
import { v4 as uuidv4 } from "uuid"
import fs from "fs"
import path from "path"

const getLegacyValue = (entry: any, keys: string[]): any => {
  for (const key of keys) {
    if (entry && entry[key] !== undefined) {
      return entry[key]
    }
  }
  return undefined
}

const LEGACY_PLAN_FIELDS = {
  day: ["D\u00eda", "Dia", "day"],
  mainActivity: ["Actividad Principal", "Actividades"],
  secondaryActivity: ["Actividad Secundaria (opcional)", "Actividad Secundaria"],
  justification: ["Justificaci\u00f3n", "Respaldo cient\u00edfico", "Fundamento"],
}

// cargar configuración de planes una sola vez
let planConfig: any = null
try {
  const configPath = path.join(__dirname, "../config/planes_zerosmoke.json")
  console.log('Cargando configuración de planes desde', configPath)
  const text = fs.readFileSync(configPath, "utf-8")
  planConfig = JSON.parse(text)
  console.log('Configuración de planes cargada, planes disponibles:', planConfig?.planes_zerosmoke?.length)
} catch (err) {
  console.error("Error loading plan config:", err)
}

// obtiene array de días para un nivel de dependencia
const getDaysForPlan = (dependencyLevel: string): Array<any> => {
  if (!planConfig || !Array.isArray(planConfig.planes_zerosmoke)) return []
  const lvl = dependencyLevel.toLowerCase()
  let planEntry = planConfig.planes_zerosmoke.find((p: any) => {
    if (lvl.includes("leve") || lvl.includes("baja")) return p.plan === "PLAN 1"
    if (lvl.includes("moder")) return p.plan === "PLAN 2"
    if (lvl.includes("alta") || lvl.includes("severo")) return p.plan === "PLAN 3"
    return false
  })
  if (!planEntry) return []
  let days: any[] = []
  planEntry.sections.forEach((sec: any) => {
    if (Array.isArray(sec.days)) days = days.concat(sec.days)
  })
  return days
}

// obtener actividades según día y nivel (retorna una única actividad principal con posible secundaria)
const getConfigActivities = (dayNumber: number, dependencyLevel: string): Array<any> | null => {
  const days = getDaysForPlan(dependencyLevel)
  const dayObj = days.find(d => String(getLegacyValue(d, LEGACY_PLAN_FIELDS.day)) === String(dayNumber))
  if (!dayObj) {
    console.log(`No hay configuración para día ${dayNumber} (dependencia ${dependencyLevel})`) // debug
    return null
  }

  const mainTitle = getLegacyValue(dayObj, LEGACY_PLAN_FIELDS.mainActivity) || ''
  // la clave secundaria puede variar en el json entre con o sin "(opcional)"
  const secondaryTitle = getLegacyValue(dayObj, LEGACY_PLAN_FIELDS.secondaryActivity) || ''
  const justification = getLegacyValue(dayObj, LEGACY_PLAN_FIELDS.justification) || ''

  const acts: Array<any> = []
  if (mainTitle) {
    const activity: any = {
      title: mainTitle,
      description: '',
      type: 'exercise',
      durationMinutes: 10,
      justification,
    }
    if (secondaryTitle) {
      activity.secondary = {
        title: secondaryTitle,
        isOptional: true,
      }
    }
    acts.push(activity)
  }

  return acts
}

// Extendemos el tipo Request para incluir el userId
interface AuthRequest extends Request {
  userId?: string
}

// Guardar resultados del test inicial
export const saveInitialTest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      })
      return
    }

    // Verificar si ya existe un progreso para este usuario
    const existingProgress = await UserProgress.findOne({ userId })
    if (existingProgress) {
      res.status(400).json({
        success: false,
        message: "Ya existe un test inicial para este usuario",
      })
      return
    }

    let { cigarettesPerDay, packagePrice, dependencyLevel, motivations, fagerstromScore } = req.body

    // Normalizar nivel de dependencia para que coincida con el enum interno
    const normalizeLevel = (lvl: string): string => {
      if (!lvl) return lvl
      const lower = lvl.toLowerCase()
      if (lower.includes('baja') || lower === 'leve') return 'Leve'
      if (lower.includes('moderada') || lower === 'moderado') return 'Moderado'
      if (lower.includes('alta') || lower === 'severo') return 'Severo'
      return lvl
    }
    dependencyLevel = normalizeLevel(dependencyLevel)

    // Crear nuevo progreso
    const userProgress = new UserProgress({
      userId,
      startDate: new Date(),
      cigarettesPerDay,
      packagePrice,
      dependencyLevel,
      fagerstromScore: fagerstromScore || 0,
      motivations,
      daysWithoutSmoking: 0,
      cigarettesAvoided: 0,
      moneySaved: 0,
      healthProgress: 0,
      achievements: {
        firstDay: {
          title: "Primer día sin fumar",
          description: "Completaste tu primer día sin fumar",
          completed: false
        },
        firstWeek: {
          title: "Una semana sin fumar",
          description: "Completaste una semana sin fumar",
          completed: false
        },
        firstMonth: {
          title: "Un mes sin fumar",
          description: "Completaste un mes sin fumar",
          completed: false,
          progress: 0
        },
        moneySaved: {
          title: "Ahorrar $200",
          description: "Has ahorrado $200 al no fumar",
          completed: false,
          progress: 0
        }
      },
      weeklyData: [{
        weekStart: new Date(),
        dailyCigarettes: [0, 0, 0, 0, 0, 0, 0],
        weeklyGoal: cigarettesPerDay * 7,
        totalSmoked: 0
      }]
    })

    await userProgress.save()

    // Asignar un plan concreto si existe en la coleccion Plan y sincronizar UserPlan
    try {
      const score = fagerstromScore || 0
      const lvl = normalizePlanLevels(dependencyLevel, score).plan
      // buscar plan que corresponda al nivel y rango de Fagerström
      const planDoc = await Plan.findOne({
        dependencyLevel: lvl,
        isActive: true,
        "fagerstromRange.min": { $lte: score },
        "fagerstromRange.max": { $gte: score },
      })
      if (planDoc) {
        userProgress.assignedPlan = planDoc._id.toString();
        await userProgress.save()
      }
      await ensureUserPlanForProgress(userId, userProgress)
    } catch (err) {
      console.warn("No se pudo asignar plan automático:", err)
    }

    // Crear el primer plan diario
    await createInitialDailyPlan(userId)

    // volver a cargar el progreso para incluir el plan poblado
    const resultProgress = await UserProgress.findById(userProgress._id).populate('assignedPlan')

    res.status(201).json({
      success: true,
      message: "Test inicial guardado correctamente",
      data: resultProgress,
    })
  } catch (err) {
    const error = err as Error
    console.error("Error al guardar test inicial:", error)
    res.status(500).json({
      success: false,
      message: "Error al guardar el test inicial",
      error: error.message,
    })
  }
}

// Obtener progreso del usuario
export const getUserProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      })
      return
    }

    // incluir datos del plan asignado
    const userProgress = await UserProgress.findOne({ userId }).populate('assignedPlan')
    if (!userProgress) {
      res.status(404).json({
        success: false,
        message: "No se encontró progreso para este usuario",
      })
      return
    }

    res.status(200).json({
      success: true,
      message: "Progreso obtenido correctamente",
      data: userProgress,
    })
  } catch (err) {
    const error = err as Error
    console.error("Error al obtener progreso:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener el progreso",
      error: error.message,
    })
  }
}

// Actualizar progreso del usuario
export const updateUserProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      })
      return
    }

    const userProgress = await UserProgress.findOne({ userId })
    if (!userProgress) {
      res.status(404).json({
        success: false,
        message: "No se encontró progreso para este usuario",
      })
      return
    }

    // Actualizar campos
    const updatedFields = req.body

    // Forma segura de actualizar campos
    const allowedFields = [
      "cigarettesPerDay",
      "packagePrice",
      "cigarettesAvoided",
      "moneySaved",
      "daysWithoutSmoking",
      "healthProgress",
      "dependencyLevel",
      "fagerstromScore",
      "motivations",
      "healthMetrics",
      "achievements",
    ]

    // cuando se actualiza el nivel, también normalizamos
    const normalizeLevel = (lvl: string): string => {
      if (!lvl) return lvl
      const lower = lvl.toLowerCase()
      if (lower.includes('baja') || lower === 'leve') return 'Leve'
      if (lower.includes('moderada') || lower === 'moderado') return 'Moderado'
      if (lower.includes('alta') || lower === 'severo') return 'Severo'
      return lvl
    }

    let dependencyChanged = false
    allowedFields.forEach((field) => {
      if (updatedFields[field] !== undefined) {
        // Normalizar antes de asignar
        const value = field === 'dependencyLevel' ? normalizeLevel(updatedFields[field]) : updatedFields[field]
        ;(userProgress as any)[field] = value
        if (field === 'dependencyLevel') {
          dependencyChanged = true
        }
      }
    })

    // si cambió el nivel de dependencia, buscamos un nuevo plan correspondiente
    if (dependencyChanged) {
      try {
        const lvl = normalizePlanLevels(userProgress.dependencyLevel, userProgress.fagerstromScore || 0).plan
        // también podría filtrarse por score si existe
        const planDoc = await Plan.findOne({ dependencyLevel: lvl, isActive: true })
        if (planDoc) {
          userProgress.assignedPlan = planDoc._id.toString();
        }
      } catch (err) {
        console.warn('Error al reasignar plan tras actualización:', err)
      }
    }

    await userProgress.save()

    try {
      await ensureUserPlanForProgress(userId, userProgress)
    } catch (err) {
      console.warn("No se pudo sincronizar UserPlan tras actualizar progreso:", err)
    }

    res.status(200).json({
      success: true,
      message: "Progreso actualizado correctamente",
      data: userProgress,
    })
  } catch (err) {
    const error = err as Error
    console.error("Error al actualizar progreso:", error)
    res.status(500).json({
      success: false,
      message: "Error al actualizar el progreso",
      error: error.message,
    })
  }
}

// Guardar registro de cigarrillo
export const saveSmokingRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      })
      return
    }

    const { timestamp, emotion, symptoms, note } = req.body

    const smokingRecord = new SmokingRecord({
      userId,
      timestamp: timestamp || new Date(),
      emotion,
      symptoms,
      note,
    })

    await smokingRecord.save()

    // Actualizar datos semanales
    const userProgress = await UserProgress.findOne({ userId })
    
    if (userProgress) {
      // Asegurarse de que hay datos semanales
      if (!userProgress.weeklyData || userProgress.weeklyData.length === 0) {
        userProgress.weeklyData = [{
          weekStart: new Date(),
          dailyCigarettes: [0, 0, 0, 0, 0, 0, 0],
          weeklyGoal: userProgress.cigarettesPerDay * 7,
          totalSmoked: 0
        }];
      }
      
      // Obtener el día de la semana (0 = Domingo, 1 = Lunes, etc.)
      const recordDate = new Date(timestamp) || new Date();
      const dayOfWeek = recordDate.getDay();
      
      // Incrementar el contador del día
      userProgress.weeklyData[0].dailyCigarettes[dayOfWeek]++;
      userProgress.weeklyData[0].totalSmoked++;
      
      await userProgress.save();
    }

    res.status(201).json({
      success: true,
      message: "Registro guardado correctamente",
      data: smokingRecord,
    })
  } catch (err) {
    const error = err as Error
    console.error("Error al guardar registro:", error)
    res.status(500).json({
      success: false,
      message: "Error al guardar el registro",
      error: error.message,
    })
  }
}

// Obtener plan diario
export const getDailyPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      })
      return
    }

    const dateStr = req.query.date as string

    let queryDate: Date
    if (dateStr) {
      queryDate = new Date(dateStr)
    } else {
      queryDate = new Date()
    }

    // Establecer hora a 00:00:00 para comparar solo la fecha
    queryDate.setHours(0, 0, 0, 0)

    // Buscar plan para la fecha especificada
    let dailyPlan = await DailyPlan.findOne({
      userId,
      date: {
        $gte: queryDate,
        $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000),
      },
    })

    // Si ya existía, comprobar si coincide con la configuración actual
    if (dailyPlan) {
      try {
        const userProgress = await UserProgress.findOne({ userId })
        const dependency = userProgress ? userProgress.dependencyLevel : 'Moderado'
        const configActs = getConfigActivities(dailyPlan.dayNumber, dependency)
        if (configActs && configActs.length > 0) {
          const firstConfig = configActs[0].title || ''
          // si el título principal almacenado difiere del configurado, regeneramos
          if (!dailyPlan.activities.some((act: any) => act.title === firstConfig)) {
            console.log(
              `Plan diario existente (día ${dailyPlan.dayNumber}) no coincide con config, regenerando`
            )
            // eliminar el plan antiguo para evitar duplicados
            await DailyPlan.deleteOne({ _id: dailyPlan._id })
            dailyPlan = await createDailyPlan(userId, queryDate)
          }
        }
      } catch (e) {
        console.warn('Error verificando plan contra configuración:', e)
      }
    }

    // Si no existe, crear uno nuevo
    if (!dailyPlan) {
      dailyPlan = await createDailyPlan(userId, queryDate)
    }

    res.status(200).json({
      success: true,
      message: "Plan diario obtenido correctamente",
      data: dailyPlan,
    })
  } catch (err) {
    const error = err as Error
    console.error("Error al obtener plan diario:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener el plan diario",
      error: error.message,
    })
  }
}

// Marcar actividad como completada
export const completeActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      })
      return
    }

    const { planId, activityId } = req.params

    const dailyPlan = await DailyPlan.findOne({
      _id: planId,
      userId,
    })

    if (!dailyPlan) {
      res.status(404).json({
        success: false,
        message: "Plan diario no encontrado",
      })
      return
    }

    // Buscar la actividad y marcarla como completada
    const activity = dailyPlan.activities.find((act: any) => act.id === activityId)
    if (!activity) {
      res.status(404).json({
        success: false,
        message: "Actividad no encontrada",
      })
      return
    }

    activity.isCompleted = true

    // Verificar si todas las actividades están completadas
    const allCompleted = dailyPlan.activities.every((act: any) => act.isCompleted)
    if (allCompleted) {
      dailyPlan.isCompleted = true

      // Actualizar progreso del usuario
      await updateProgressOnPlanCompletion(userId, dailyPlan.dayNumber)
    }

    await dailyPlan.save()

    res.status(200).json({
      success: true,
      message: "Actividad marcada como completada",
      data: dailyPlan,
    })
  } catch (err) {
    const error = err as Error
    console.error("Error al completar actividad:", error)
    res.status(500).json({
      success: false,
      message: "Error al completar la actividad",
      error: error.message,
    })
  }
}

// Obtener progreso semanal
export const getWeeklyProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
      return;
    }
    
    const userProgress = await UserProgress.findOne({ userId });
    
    if (!userProgress) {
      res.status(404).json({
        success: false,
        message: "No se encontró progreso para este usuario",
      });
      return;
    }
    
    // Si no hay datos semanales, crear datos iniciales
    if (!userProgress.weeklyData || userProgress.weeklyData.length === 0) {
      userProgress.weeklyData = [{
        weekStart: new Date(),
        dailyCigarettes: [0, 0, 0, 0, 0, 0, 0],
        weeklyGoal: userProgress.cigarettesPerDay * 7,
        totalSmoked: 0
      }];
      await userProgress.save();
    }
    
    res.status(200).json({
      success: true,
      message: "Progreso semanal obtenido correctamente",
      data: userProgress.weeklyData[0] // Devolvemos la semana actual
    });
  } catch (err) {
    const error = err as Error;
    console.error("Error al obtener progreso semanal:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener el progreso semanal",
      error: error.message,
    });
  }
};

// Obtener logros
export const getAchievements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
      return;
    }
    
    const userProgress = await UserProgress.findOne({ userId });
    
    if (!userProgress) {
      res.status(404).json({
        success: false,
        message: "No se encontró progreso para este usuario",
      });
      return;
    }
    
    // Si no hay logros, inicializarlos
    if (!userProgress.achievements) {
      userProgress.achievements = {
        firstDay: {
          title: "Primer día sin fumar",
          description: "Completaste tu primer día sin fumar",
          completed: false
        },
        firstWeek: {
          title: "Una semana sin fumar",
          description: "Completaste una semana sin fumar",
          completed: false
        },
        firstMonth: {
          title: "Un mes sin fumar",
          description: "Completaste un mes sin fumar",
          completed: false,
          progress: 0
        },
        moneySaved: {
          title: "Ahorrar $200",
          description: "Has ahorrado $200 al no fumar",
          completed: false,
          progress: 0
        }
      };
      await userProgress.save();
    }
    
    // Actualizar logros basados en el progreso actual
    await updateAchievements(userId);
    
    // Obtener el progreso actualizado
    const updatedProgress = await UserProgress.findOne({ userId });
    
    res.status(200).json({
      success: true,
      message: "Logros obtenidos correctamente",
      data: updatedProgress?.achievements || {}
    });
  } catch (err) {
    const error = err as Error;
    console.error("Error al obtener logros:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los logros",
      error: error.message,
    });
  }
};

// Obtener resumen de progreso
export const getProgressSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
      return;
    }
    
    const userProgress = await UserProgress.findOne({ userId });
    
    if (!userProgress) {
      res.status(404).json({
        success: false,
        message: "No se encontró progreso para este usuario",
      });
      return;
    }
    
    // Calcular porcentaje de reducción
    const reductionPercentage = calculateReductionPercentage(userProgress);
    
    const summary = {
      reductionPercentage,
      daysWithoutSmoking: userProgress.daysWithoutSmoking,
      moneySaved: userProgress.moneySaved,
      message: generateMotivationalMessage(reductionPercentage)
    };
    
    res.status(200).json({
      success: true,
      message: "Resumen de progreso obtenido correctamente",
      data: summary
    });
  } catch (err) {
    const error = err as Error;
    console.error("Error al obtener resumen de progreso:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener el resumen de progreso",
      error: error.message,
    });
  }
};

// Actualizar registro de cigarrillo y progreso semanal
export const updateSmokingRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
      return;
    }
    
    const { date, count } = req.body;
    const recordDate = date ? new Date(date) : new Date();
    const dayOfWeek = recordDate.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    
    // Obtener progreso del usuario
    const userProgress = await UserProgress.findOne({ userId });
    
    if (!userProgress) {
      res.status(404).json({
        success: false,
        message: "No se encontró progreso para este usuario",
      });
      return;
    }
    
    // Asegurarse de que hay datos semanales
    if (!userProgress.weeklyData || userProgress.weeklyData.length === 0) {
      userProgress.weeklyData = [{
        weekStart: new Date(),
        dailyCigarettes: [0, 0, 0, 0, 0, 0, 0],
        weeklyGoal: userProgress.cigarettesPerDay * 7,
        totalSmoked: 0
      }];
    }
    
    // Actualizar el contador del día
    userProgress.weeklyData[0].dailyCigarettes[dayOfWeek] = count;
    
    // Recalcular total fumado
    userProgress.weeklyData[0].totalSmoked = userProgress.weeklyData[0].dailyCigarettes.reduce((a: number, b: number) => a + b, 0);
    
    await userProgress.save();
    
    res.status(200).json({
      success: true,
      message: "Registro de cigarrillos actualizado correctamente",
      data: userProgress.weeklyData[0]
    });
  } catch (err) {
    const error = err as Error;
    console.error("Error al actualizar registro de cigarrillos:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el registro de cigarrillos",
      error: error.message,
    });
  }
};

// Función auxiliar para crear el plan diario inicial
// delega en createDailyPlan para aprovechar la lógica basada en nivel de dependencia
const createInitialDailyPlan = async (userId: string): Promise<any> => {
  return await createDailyPlan(userId, new Date());
}

// Función para crear un plan diario para una fecha específica
// ahora tiene en cuenta el nivel de dependencia almacenado en el progreso del usuario
const createDailyPlan = async (userId: string, date: Date): Promise<any> => {
  // Obtener el progreso del usuario para saber en qué día va
  const userProgress = await UserProgress.findOne({ userId })
  const dayNumber = userProgress ? userProgress.daysWithoutSmoking + 1 : 1
  const dependencyLevel = userProgress ? userProgress.dependencyLevel : 'Moderado'

  // intentar obtener del JSON de configuración
  let activities: any[] = []
  const configActs = getConfigActivities(dayNumber, dependencyLevel)
  if (configActs && configActs.length > 0) {
    console.log(`Usando configuración para día ${dayNumber}, dependencia ${dependencyLevel}`)
    activities = configActs.map(act => {
      const activity: any = {
        id: uuidv4(),
        title: act.title || '',
        description: act.description || '',
        type: act.type || 'education',
        durationMinutes: act.durationMinutes || 10,
        justification: act.justification || '',
        isCompleted: false,
      }
      // si la configuración incluye un objeto secondary, incrustarlo
      if (act.secondary) {
        activity.secondaryActivity = {
          title: act.secondary.title || '',
          description: act.secondary.description || '',
          isOptional: act.secondary.isOptional || false,
        }
      }
      return activity
    })
  } else {
    console.log(`Usando generador genérico para día ${dayNumber}, dependencia ${dependencyLevel}`)
    // fallback al generador genérico
    activities = generateActivitiesForDay(dayNumber, dependencyLevel)
  }

  // Mensaje informativo de cabecera según dependencia
  let message = `Día ${dayNumber} de tu viaje sin tabaco. ¡Sigue adelante!`;
  if (dependencyLevel === 'Leve') {
    message = `Día ${dayNumber} - Dependencia baja. Avanza con confianza.`;
  } else if (dependencyLevel === 'Moderado') {
    message = `Día ${dayNumber} - Dependencia moderada. Mantén el ritmo.`;
  } else if (dependencyLevel === 'Severo') {
    message = `Día ${dayNumber} - Dependencia alta. Toma medidas extra de autocuidado.`;
  }

  const dailyPlan = new DailyPlan({
    userId,
    date,
    activities,
    isCompleted: false,
    message,
    dayNumber,
  })

  return await dailyPlan.save()
}

// Función para generar actividades basadas en el día y nivel de dependencia
const generateActivitiesForDay = (dayNumber: number, dependencyLevel: string): Array<any> => {
  // actividades base comunes a todos los niveles
  const activities: Array<any> = [
    {
      id: uuidv4(),
      title: "Ejercicio de respiración",
      description: "Realiza 10 respiraciones profundas cuando sientas ansiedad",
      type: "breathing",
      durationMinutes: 3,
      isCompleted: false,
    },
    {
      id: uuidv4(),
      title: "Beber agua",
      description: "Bebe al menos 8 vasos de agua durante el día",
      type: "health",
      durationMinutes: 1,
      isCompleted: false,
    },
  ]

  // Ajustes según nivel de dependencia
  if (dependencyLevel === 'Severo') {
    // añadir tareas adicionales de apoyo emocional o físico
    activities.push({
      id: uuidv4(),
      title: "Soporte social",
      description: "Contacta a un amigo o familiar y comparte cómo te sientes",
      type: "social",
      durationMinutes: 10,
      isCompleted: false,
    })
    activities.push({
      id: uuidv4(),
      title: "Respiración profunda extra",
      description: "Cuando sientas un antojo fuerte, haz 15 respiraciones profundas",
      type: "breathing",
      durationMinutes: 5,
      isCompleted: false,
    })
  } else if (dependencyLevel === 'Moderado') {
    // actividades moderadas adicionales
    activities.push({
      id: uuidv4(),
      title: "Mini paseo",
      description: "Da una caminata de 10 minutos para despejarte",
      type: "exercise",
      durationMinutes: 10,
      isCompleted: false,
    })
  } else if (dependencyLevel === 'Leve') {
    // plan más ligero
    // puede mantener solo las actividades base
  }

  // Actividades periódicas basadas en el día
  if (dayNumber % 3 === 0) {
    activities.push({
      id: uuidv4(),
      title: "Ejercicio físico",
      description: "Realiza 15 minutos de actividad física moderada",
      type: "exercise",
      durationMinutes: 15,
      isCompleted: false,
    })
  }

  if (dayNumber % 7 === 0) {
    activities.push({
      id: uuidv4(),
      title: "Reflexión semanal",
      description: "Reflexiona sobre tu progreso durante esta semana",
      type: "reflection",
      durationMinutes: 10,
      isCompleted: false,
    })
  }

  return activities
}

// Función auxiliar para calcular el porcentaje de reducción
const calculateReductionPercentage = (userProgress: any): number => {
  if (!userProgress.weeklyData || userProgress.weeklyData.length === 0) {
    return 0;
  }
  
  const weeklyData = userProgress.weeklyData[0];
  const totalSmoked = weeklyData.totalSmoked;
  const weeklyGoal = weeklyData.weeklyGoal;
  
  if (weeklyGoal === 0) return 0;
  
  // Calcular porcentaje de reducción
  const reduction = Math.max(0, (weeklyGoal - totalSmoked) / weeklyGoal * 100);
  return Math.round(reduction);
};

// Función auxiliar para generar mensaje motivacional
const generateMotivationalMessage = (reductionPercentage: number): string => {
  if (reductionPercentage >= 90) {
    return "¡Excelente! Has reducido significativamente tu consumo de tabaco.";
  } else if (reductionPercentage >= 50) {
    return "¡Sigue así! Has reducido significativamente tu consumo de tabaco.";
  } else if (reductionPercentage >= 20) {
    return "¡Buen progreso! Estás en camino de reducir tu consumo de tabaco.";
  } else {
    return "¡Ánimo! Cada paso cuenta en tu camino para dejar de fumar.";
  }
};

// Función auxiliar para actualizar logros
const updateAchievements = async (userId: string): Promise<void> => {
  const userProgress = await UserProgress.findOne({ userId });
  
  if (!userProgress) return;
  
  const now = new Date();
  const startDate = userProgress.startDate;
  const daysDifference = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Actualizar logros basados en días sin fumar
  if (daysDifference >= 1 && !userProgress.achievements.firstDay.completed) {
    userProgress.achievements.firstDay.completed = true;
    userProgress.achievements.firstDay.date = now.toISOString();
  }
  
  if (daysDifference >= 7 && !userProgress.achievements.firstWeek.completed) {
    userProgress.achievements.firstWeek.completed = true;
    userProgress.achievements.firstWeek.date = now.toISOString();
  }
  
  if (daysDifference < 30 && !userProgress.achievements.firstMonth.completed) {
    userProgress.achievements.firstMonth.progress = daysDifference / 30;
  } else if (daysDifference >= 30 && !userProgress.achievements.firstMonth.completed) {
    userProgress.achievements.firstMonth.completed = true;
    userProgress.achievements.firstMonth.date = now.toISOString();
  }
  
  // Actualizar logro de dinero ahorrado
  if (userProgress.moneySaved < 200 && !userProgress.achievements.moneySaved.completed) {
    userProgress.achievements.moneySaved.progress = userProgress.moneySaved / 200;
  } else if (userProgress.moneySaved >= 200 && !userProgress.achievements.moneySaved.completed) {
    userProgress.achievements.moneySaved.completed = true;
    userProgress.achievements.moneySaved.date = now.toISOString();
  }
  
  await userProgress.save();
};

// Función para actualizar el progreso cuando se completa un plan diario
const updateProgressOnPlanCompletion = async (userId: string, dayNumber: number): Promise<void> => {
  const userProgress = await UserProgress.findOne({ userId });
  if (!userProgress) return;

  // Actualizar días sin fumar si es mayor que el valor actual
  if (dayNumber > userProgress.daysWithoutSmoking) {
    userProgress.daysWithoutSmoking = dayNumber;

    // Calcular cigarrillos evitados
    userProgress.cigarettesAvoided = userProgress.cigarettesPerDay * dayNumber;

    // Calcular dinero ahorrado (asumiendo 20 cigarrillos por paquete)
    const packetsPerDay = userProgress.cigarettesPerDay / 20;
    userProgress.moneySaved = dayNumber * packetsPerDay * userProgress.packagePrice;

    // Actualizar progreso de salud (simplificado)
    userProgress.healthProgress = Math.min(dayNumber / 30, 1); // Máximo 100% después de 30 días

    // Actualizar logros
    await updateAchievements(userId);

    await userProgress.save();
  }
};
