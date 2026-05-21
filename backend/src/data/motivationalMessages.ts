export type MessageCategory = "motivation" | "craving" | "health" | "savings" | "progress"

export interface MotivationalMessage {
  id: string
  category: MessageCategory
  title: string
  bodyTemplate: string
}

const motivationalMessages: MotivationalMessage[] = [
  // ============================================================
  // MOTIVACIÓN GENERAL
  // ============================================================
  {
    id: "mot_01",
    category: "motivation",
    title: "¡Sigue así!",
    bodyTemplate:
      "Llevas {days} días sin fumar. Cada uno es una victoria. ¡Tú puedes con esto!",
  },
  {
    id: "mot_02",
    category: "motivation",
    title: "Vas muy bien",
    bodyTemplate:
      "{days} días de esfuerzo. Cada vez que resistes, te haces más fuerte. ¡No te rindas!",
  },
  {
    id: "mot_03",
    category: "motivation",
    title: "Tú decides",
    bodyTemplate:
      "Recuerda por qué empezaste. {days} días después, sigues avanzando. Confía en tu proceso.",
  },
  {
    id: "mot_04",
    category: "motivation",
    title: "Un día a la vez",
    bodyTemplate:
      "Ya superaste {days} días. Si llegaste hasta aquí, puedes llegar más lejos. Respira y continúa.",
  },
  {
    id: "mot_05",
    category: "motivation",
    title: "Eres más fuerte",
    bodyTemplate:
      "Cada día sin fumar es una prueba superada. {days} días demuestran tu determinación.",
  },
  {
    id: "mot_06",
    category: "motivation",
    title: "Sigue adelante",
    bodyTemplate:
      "No importa qué tan lento vayas, mientras no te detengas. {days} días y sumando.",
  },

  // ============================================================
  // ANSIEDAD / CRAVING
  // ============================================================
  {
    id: "cra_01",
    category: "craving",
    title: "Los antojos pasan",
    bodyTemplate:
      "Si sientes ansiedad, respira hondo 10 veces. Un antojo dura solo minutos. Tú decides no fumar.",
  },
  {
    id: "cra_02",
    category: "craving",
    title: "Momento difícil",
    bodyTemplate:
      "Los antojos son temporales. Llevas {days} días de progreso, no dejes que un momento arruine tu camino.",
  },
  {
    id: "cra_03",
    category: "craving",
    title: "Bebe agua y respira",
    bodyTemplate:
      "¿Antojo? Toma agua, camina 5 minutos, cambia de actividad. El craving desaparecerá rápido.",
  },
  {
    id: "cra_04",
    category: "craving",
    title: "Aguanta un poco más",
    bodyTemplate:
      "El craving fuerte dura 5-10 minutos. Aguanta, distráete, y verás cómo pasa. ¡Tú puedes!",
  },
  {
    id: "cra_05",
    category: "craving",
    title: "Ansiedad por fumar",
    bodyTemplate:
      "Fumar no alivia el estrés, lo causa. Tu nivel de dependencia es {dependencyLevel}. Cada antojo que superas lo reduces.",
  },
  {
    id: "cra_06",
    category: "craving",
    title: "No estás solo",
    bodyTemplate:
      "Si el antojo es muy fuerte, contacta a tu red de apoyo. Hablar con alguien ayuda a disipar la ansiedad.",
  },

  // ============================================================
  // SALUD
  // ============================================================
  {
    id: "hea_01",
    category: "health",
    title: "Tu cuerpo mejora",
    bodyTemplate:
      "En {days} días sin fumar tu circulación y respiración han mejorado. Cada día tu cuerpo se recupera más.",
  },
  {
    id: "hea_02",
    category: "health",
    title: "Pulmones más limpios",
    bodyTemplate:
      "Has evitado {cigarettes} cigarrillos. Eso significa menos alquitrán en tus pulmones y más oxígeno en tu sangre.",
  },
  {
    id: "hea_03",
    category: "health",
    title: "Corazón agradecido",
    bodyTemplate:
      "Tu riesgo cardíaco sigue bajando. A los {days} días sin fumar, tu corazón ya trabaja mejor.",
  },
  {
    id: "hea_04",
    category: "health",
    title: "Sentidos recuperados",
    bodyTemplate:
      "¿Has notado que hueles y sabes mejor? A los {days} días, tu sentido del gusto y olfato siguen mejorando.",
  },
  {
    id: "hea_05",
    category: "health",
    title: "Capacidad pulmonar",
    bodyTemplate:
      "Después de {days} días, tu capacidad pulmonar sigue aumentando. Subir escaleras se siente más fácil.",
  },
  {
    id: "hea_06",
    category: "health",
    title: "Progreso de salud",
    bodyTemplate:
      "Has alcanzado un {healthProgress}% de mejora en tu salud general. Sigue así, cada día suma.",
  },

  // ============================================================
  // AHORRO ECONÓMICO
  // ============================================================
  {
    id: "sav_01",
    category: "savings",
    title: "Dinero ahorrado",
    bodyTemplate:
      "Has ahorrado ${money} en {days} días. Ese dinero es tuyo, ¿qué harás con él?",
  },
  {
    id: "sav_02",
    category: "savings",
    title: "Tu bolsillo sano",
    bodyTemplate:
      "${money} ahorrados. Podrías darte un gusto, comprar algo especial o guardarlo para un viaje.",
  },
  {
    id: "sav_03",
    category: "savings",
    title: "Ahorro que crece",
    bodyTemplate:
      "Al mes estarías ahorrando aproximadamente ${monthlySave}. ¡Imagina todo lo que puedes hacer con ese dinero!",
  },
  {
    id: "sav_04",
    category: "savings",
    title: "Ganancia diaria",
    bodyTemplate:
      "Cada cigarrillo evitado son aproximadamente ${perCigarette} que no gastaste. {cigarettes} cigarrillos = ${money} ahorrados.",
  },
  {
    id: "sav_05",
    category: "savings",
    title: "¿Te has premiado?",
    bodyTemplate:
      "Con ${money} ahorrados, podrías comprarte algo que te motive a seguir. ¡Te lo mereces!",
  },
  {
    id: "sav_06",
    category: "savings",
    title: "Ahorro destacado",
    bodyTemplate:
      "En {days} días has ahorrado ${money}. Piensa en grande: ¿cuánto será en un año?",
  },

  // ============================================================
  // PROGRESO Y LOGROS
  // ============================================================
  {
    id: "pro_01",
    category: "progress",
    title: "{days} días sin fumar",
    bodyTemplate:
      "¡{days} días! Has evitado {cigarettes} cigarrillos. Son números que hablan de tu éxito.",
  },
  {
    id: "pro_02",
    category: "progress",
    title: "Racha activa",
    bodyTemplate:
      "Llevas {days} días de racha. Tu mejor marca es {bestStreak} días. ¿La superarás esta vez?",
  },
  {
    id: "pro_03",
    category: "progress",
    title: "Meta cercana",
    bodyTemplate:
      "Próximo hito: {nextMilestone} días. Ya casi llegas. Sigue firme y celebra cada logro.",
  },
  {
    id: "pro_04",
    category: "progress",
    title: "Impacto total",
    bodyTemplate:
      "{days} días sin fumar. {cigarettes} cigarrillos evitados. ${money} ahorrados. ¡Eso es enorme!",
  },
  {
    id: "pro_05",
    category: "progress",
    title: "Paquetes evitados",
    bodyTemplate:
      "Has evitado fumar {packs} paquetes de cigarrillos. Eso es aproximadamente {hours} horas de vida recuperadas.",
  },
  {
    id: "pro_06",
    category: "progress",
    title: "Un paso más",
    bodyTemplate:
      "{healthProgress}% de progreso en salud. A los {weeks} semanas sin fumar, los beneficios son cada vez mayores.",
  },
]

export default motivationalMessages
