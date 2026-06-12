import axios from "axios"

const GROQ_API_URL = process.env.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions"
const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile"
const GROQ_FALLBACK_MODEL = "llama-3.3-70b-versatile"

const VISITOR_SYSTEM_PROMPT = [
  "Eres el asistente virtual PUBLICO de ZeroSmoke, una aplicacion para dejar de fumar.",
  "Responde SIEMPRE en espanol, con tono EMPATICO, CALIDO y BREVE (max 3 parrafos).",
  "",
  "INFORMACION SOBRE ZEROSMOKE:",
  "- ZeroSmoke es una aplicacion que ayuda a las personas a dejar de fumar mediante herramientas personalizadas.",
  "- Ofrece un TEST DE DEPENDENCIA (Fagerstrom) para evaluar el nivel de adiccion a la nicotina.",
  "- CHATBOT EMOCIONAL: asistente conversacional para apoyo en momentos de ansiedad o antojo.",
  "- SEGUIMIENTO DE CONSUMO: registro de cigarrillos, calculo de dinero ahorrado y dias sin fumar.",
  "- GAMIFICACION: logros, puntos de motivacion y recompensas por progreso.",
  "- PLANES PERSONALIZADOS: plan diario con actividades para dejar de fumar gradualmente.",
  "- REPORTES: graficos de progreso semanal, reduccion de consumo y estado emocional.",
  "- APLICACION MOVIL: disponible para descargar, con todas las funcionalidades en tu telefono.",
  "",
  "REGLAS DE CONDUCTA:",
  "- Responde preguntas sobre tabaquismo con informacion basada en evidencia.",
  "- Explica las funcionalidades de ZeroSmoke de forma clara y atractiva.",
  "- Anima a los visitantes a descargar la app y realizar el test de dependencia.",
  "- NO realices diagnosticos medicos ni recomiendes tratamientos especificos.",
  "- NO reemplaces la atencion profesional de salud.",
  "- NO inventes funcionalidades que no existen en ZeroSmoke.",
  "- Si te preguntan sobre sintomas graves, recomienda consultar a un medico.",
  "- NO compartas datos del usuario ni informacion personal.",
  "- Manten las respuestas conversacionales y naturales, no robotizadas.",
  "",
  "EJEMPLOS DE RESPUESTAS:",
  "Usuario: '¿Que es ZeroSmoke?'",
  "Asistente: 'ZeroSmoke es una aplicacion disenada para ayudarte a dejar de fumar de manera progresiva y personalizada. Ofrece herramientas como un test de dependencia, chatbot de apoyo emocional, seguimiento de tu consumo, planes diarios y gamificacion para mantenerte motivado. Todo esta disponible tanto en la web como en nuestra app movil.'",
  "",
  "Usuario: '¿Como funciona el test?'",
  "Asistente: 'El test de dependencia esta basado en el cuestionario de Fagerstrom, un estandar medico reconocido. Responde unas preguntas sobre tu consumo y obtendras tu nivel de dependencia (baja, moderada o alta), junto con recomendaciones personalizadas para empezar tu proceso.'",
].join("\n")

const visitorFallbackReply = (message: string): string => {
  const lower = message.toLowerCase()
  if (lower.includes("hola") || lower.includes("buenas") || lower.includes("que es zerosmoke") || lower.includes("zerosmoke")) {
    return "¡Hola! Soy el asistente de ZeroSmoke, una aplicacion diseñada para ayudarte a dejar de fumar. Ofrecemos test de dependencia, chatbot emocional, seguimiento de consumo, planes personalizados y gamificacion. ¿Te gustaria saber mas sobre alguna funcionalidad en particular?"
  }
  if (lower.includes("test") || lower.includes("dependencia") || lower.includes("fagerstrom")) {
    return "Nuestro test de dependencia usa el cuestionario de Fagerstrom para evaluar tu nivel de adiccion a la nicotina. Es rapido, anonimo y te dara recomendaciones personalizadas. Puedes realizarlo directamente en nuestra web o en la app movil. ¿Quieres que te cuente mas detalles?"
  }
  if (lower.includes("beneficio") || lower.includes("dejar de fumar")) {
    return "Dejar de fumar tiene beneficios increibles: mejora tu circulacion sanguinea en 20 minutos, reduce el riesgo de enfermedades cardiacas, mejora tu capacidad pulmonar, recuperas el sentido del gusto y el olfato, y aumentas tu esperanza de vida. ZeroSmoke te acompania en todo este proceso con herramientas personalizadas. ¿Te gustaria saber como empezar?"
  }
  if (lower.includes("app") || lower.includes("descargar") || lower.includes("movil")) {
    return "La aplicacion movil de ZeroSmoke esta disponible para descargar. Incluye todas las funcionalidades de la version web mas herramientas adicionales como notificaciones, seguimiento offline y una comunidad de apoyo. Puedes encontrar los enlaces de descarga en nuestra pagina principal."
  }
  if (lower.includes("consejo") || lower.includes("tips") || lower.includes("ayuda")) {
    return "Claro, aqui tienes algunos consejos para dejar de fumar: 1) Establece una fecha para comenzar, 2) Identifica tus detonantes, 3) Busca actividades sustitutivas como mascar chicle o hacer ejercicio, 4) Usa nuestro test para conocer tu nivel de dependencia, 5) No te desanimes si tienes recaidas, cada intento cuenta. ¿Quieres que profundice en alguno de estos puntos?"
  }
  return "¡Hola! Soy el asistente virtual de ZeroSmoke. Puedo ayudarte con informacion sobre como dejar de fumar, explicarte nuestras funcionalidades (test de dependencia, chatbot emocional, seguimiento, planes personalizados) o darte consejos practicos. ¿En que puedo ayudarte hoy?"
}

export const publicChatService = {
  async sendMessage(message: string, history: Array<{ role: string; text: string }> = []): Promise<{ reply: string; model: string; fallback: boolean }> {
    if (!GROQ_API_KEY) {
      return { reply: visitorFallbackReply(message), model: GROQ_MODEL, fallback: true }
    }

    let messages: { role: string; content: string }[] = []

    try {
      messages = [
        { role: "system", content: VISITOR_SYSTEM_PROMPT },
        ...history.slice(-10).map((item) => ({
          role: item.role === "user" ? "user" : "assistant",
          content: item.text,
        })),
        { role: "user", content: message },
      ]

      const payload = {
        model: GROQ_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }

      console.log("[PublicChat] Modelo usado:", GROQ_MODEL)
      console.log("[PublicChat] Mensajes:", messages.length)

      const response = await axios.post(GROQ_API_URL, payload, {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      })

      console.log("[PublicChat] response.status:", response.status)

      const reply = response.data?.choices?.[0]?.message?.content?.trim()
      if (reply) {
        return { reply, model: GROQ_MODEL, fallback: false }
      }

      throw new Error("Respuesta vacia de Groq")
    } catch (error: any) {
      console.error("[PublicChat] Error:", error instanceof Error ? error.message : error)

      if (error?.config?.data && messages.length > 0) {
        try {
          const fallbackRes = await axios.post(GROQ_API_URL, {
            model: GROQ_FALLBACK_MODEL,
            messages,
            temperature: 0.7,
            max_tokens: 500,
          }, {
            headers: {
              Authorization: `Bearer ${GROQ_API_KEY}`,
              "Content-Type": "application/json",
            },
            timeout: 20000,
          })
          const fallbackReplyText = fallbackRes.data?.choices?.[0]?.message?.content?.trim()
          if (fallbackReplyText) {
            return { reply: fallbackReplyText, model: GROQ_FALLBACK_MODEL, fallback: false }
          }
        } catch (fallbackError: any) {
          console.error("[PublicChat] Fallback tambien fallo:", fallbackError.message)
        }
      }

      return { reply: visitorFallbackReply(message), model: GROQ_MODEL, fallback: true }
    }
  },
}
