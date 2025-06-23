import type { Request, Response } from "express"
import UserProgress from "../models/UserProgress"
import DailyPlan from "../models/DailyPlan"
import SmokingRecord from "../models/SmokingRecord"
import { v4 as uuidv4 } from "uuid"

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

    const { cigarettesPerDay, packagePrice, dependencyLevel, motivations } = req.body

    // Crear nuevo progreso
    const userProgress = new UserProgress({
      userId,
      startDate: new Date(),
      cigarettesPerDay,
      packagePrice,
      dependencyLevel,
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

    // Crear el primer plan diario
    await createInitialDailyPlan(userId)

    res.status(201).json({
      success: true,
      message: "Test inicial guardado correctamente",
      data: userProgress,
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

    const userProgress = await UserProgress.findOne({ userId })
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
      "motivations",
      "healthMetrics",
      "achievements",
    ]

    allowedFields.forEach((field) => {
      if (updatedFields[field] !== undefined) {
        // Usamos type assertion para evitar el error de índice
        ;(userProgress as any)[field] = updatedFields[field]
      }
    })

    await userProgress.save()

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
    const activity = dailyPlan.activities.find((act) => act.id === activityId)
    if (!activity) {
      res.status(404).json({
        success: false,
        message: "Actividad no encontrada",
      })
      return
    }

    activity.isCompleted = true

    // Verificar si todas las actividades están completadas
    const allCompleted = dailyPlan.activities.every((act) => act.isCompleted)
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
    userProgress.weeklyData[0].totalSmoked = userProgress.weeklyData[0].dailyCigarettes.reduce((a, b) => a + b, 0);
    
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
const createInitialDailyPlan = async (userId: string): Promise<any> => {
  const activities = [
    {
      id: uuidv4(),
      title: "Reflexión inicial",
      description: "Tómate 5 minutos para reflexionar sobre por qué quieres dejar de fumar",
      type: "reflection",
      durationMinutes: 5,
      isCompleted: false,
    },
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

  const dailyPlan = new DailyPlan({
    userId,
    date: new Date(),
    activities,
    isCompleted: false,
    message: "¡Bienvenido a tu primer día! Completa estas actividades para comenzar tu viaje.",
    dayNumber: 1,
  })

  return await dailyPlan.save()
}

// Función para crear un plan diario para una fecha específica
const createDailyPlan = async (userId: string, date: Date): Promise<any> => {
  // Obtener el progreso del usuario para saber en qué día va
  const userProgress = await UserProgress.findOne({ userId })
  const dayNumber = userProgress ? userProgress.daysWithoutSmoking + 1 : 1

  // Generar actividades basadas en el día
  const activities = generateActivitiesForDay(dayNumber)

  const dailyPlan = new DailyPlan({
    userId,
    date,
    activities,
    isCompleted: false,
    message: `Día ${dayNumber} de tu viaje sin tabaco. ¡Sigue adelante!`,
    dayNumber,
  })

  return await dailyPlan.save()
}

// Función para generar actividades basadas en el día
const generateActivitiesForDay = (dayNumber: number): Array<any> => {
  // Aquí puedes implementar lógica para generar actividades diferentes según el día
  // Por ahora, usaremos actividades genéricas
  const activities = [
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

  // Añadir actividades específicas según el día
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