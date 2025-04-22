"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import styled, { keyframes } from "styled-components"
import { AppColors } from "../styles/colors"
import Button from "./ui/Button"
import Input from "./ui/Input"
import { useChatbot } from "./ChatbotContext"

// Animaciones
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`

const pulse = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.3);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }
`

const typing = keyframes`
  0% { width: 0 }
  100% { width: 100% }
`

const blinkCaret = keyframes`
  from, to { border-color: transparent }
  50% { border-color: ${AppColors.primary} }
`

// Componentes estilizados
const ChatbotContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  font-family: 'Inter', sans-serif;
`

const ChatbotButton = styled.button`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${AppColors.primary};
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    background-color: ${AppColors.tertiary};
    animation: ${pulse} 1s infinite;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::after {
    opacity: 1;
  }
`

const NotificationBadge = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #ff5252;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  animation: ${fadeIn} 0.3s ease-out;
`

const ChatWindow = styled.div<{ isOpen: boolean }>`
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 350px;
  height: 500px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform-origin: bottom right;
  animation: ${fadeIn} 0.3s ease-out;
  transition: all 0.3s ease;
  
  @media (max-width: 480px) {
    width: 90vw;
    height: 70vh;
    bottom: 70px;
    right: 0;
  }
`

const ChatHeader = styled.div`
  background-color: ${AppColors.primary};
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`

const ChatTitle = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '🔹';
    font-size: 1rem;
  }
`

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`

const ChatMessages = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: #f8f9fa;
  
  /* Estilizar la barra de desplazamiento */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
`

const MessageContainer = styled.div<{ isUser: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.isUser ? "flex-end" : "flex-start")};
  max-width: 100%;
  animation: ${(props) => (props.isUser ? slideIn : fadeIn)} 0.3s ease-out;
`

const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 80%;
  padding: 0.75rem 1rem;
  border-radius: 18px;
  background-color: ${(props) => (props.isUser ? AppColors.primary : "white")};
  color: ${(props) => (props.isUser ? "white" : AppColors.text)};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  font-size: 0.95rem;
  line-height: 1.4;
  border: ${(props) => (props.isUser ? "none" : "1px solid rgba(0, 0, 0, 0.1)")};
  
  /* Ajustar la forma del globo según el remitente */
  border-bottom-left-radius: ${(props) => (props.isUser ? "18px" : "4px")};
  border-bottom-right-radius: ${(props) => (props.isUser ? "4px" : "18px")};
`

const MessageTime = styled.span`
  font-size: 0.7rem;
  color: rgba(0, 0, 0, 0.5);
  margin-top: 4px;
  margin-left: 8px;
  margin-right: 8px;
`

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 15px;
  background-color: white;
  border-radius: 18px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  width: fit-content;
  margin-top: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.3s ease-out;
`

const TypingDot = styled.div`
  width: 8px;
  height: 8px;
  background-color: ${AppColors.primary};
  border-radius: 50%;
  opacity: 0.7;
  animation: ${pulse} 1s infinite;
  
  &:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  &:nth-child(3) {
    animation-delay: 0.4s;
  }
`

const ChatInputContainer = styled.div`
  padding: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 0.5rem;
  background-color: white;
`

const SuggestedQuestions = styled.div`
  padding: 0.5rem 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  background-color: white;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  max-height: 120px;
  overflow-y: auto;
  
  /* Estilizar la barra de desplazamiento */
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
`

const SuggestedQuestion = styled.button`
  background-color: #f0f2f5;
  color: ${AppColors.text};
  border: none;
  border-radius: 16px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background-color: ${AppColors.primary}20;
    transform: translateY(-2px);
  }
`

const StyledInput = styled(Input)`
  border-radius: 20px;
  background-color: #f0f2f5;
  transition: all 0.2s ease;
  
  &:focus {
    box-shadow: 0 0 0 2px ${AppColors.primary}40;
  }
`

const SendButton = styled(Button)`
  border-radius: 50%;
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  &:hover {
    transform: scale(1.05);
  }
`

const WelcomeAnimation = styled.div`
  overflow: hidden;
  border-right: .15em solid ${AppColors.primary};
  white-space: nowrap;
  margin: 0 auto;
  letter-spacing: .15em;
  animation: 
    ${typing} 3.5s steps(40, end),
    ${blinkCaret} .75s step-end infinite;
`

const Chatbot: React.FC = () => {
  const { isOpen, messages, toggleChat, addMessage } = useChatbot()
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [hasNewMessage, setHasNewMessage] = useState(false)

  // Preguntas sugeridas
  const suggestedQuestions = [
    "¿Cómo puedo dejar de fumar?",
    "¿Cuáles son los beneficios de dejar de fumar?",
    "¿Qué es el síndrome de abstinencia?",
    "¿Cómo manejar la ansiedad al dejar de fumar?",
    "¿Qué hacer si tengo una recaída?",
    "¿Cómo funciona la app ZeroSmoke?",
    "¿Cuánto tiempo tardaré en dejar de fumar?",
    "¿Qué alternativas existen al tabaco?",
    "¿Cómo afecta el tabaco a mi salud?",
    "¿Cómo puedo ayudar a alguien a dejar de fumar?",
    "¿Qué técnicas de relajación recomiendan?",
    "¿Cómo evitar el aumento de peso?",
  ]

  // Respuestas predefinidas
  const responses: Record<string, string[]> = {
    hola: [
      "¡Hola! Soy el asistente virtual de ZeroSmoke. ¿En qué puedo ayudarte hoy?",
      "¡Bienvenido a ZeroSmoke! Estoy aquí para responder tus preguntas sobre cómo dejar de fumar.",
      "¡Hola! Me alegra que estés aquí. Soy tu asistente personal para ayudarte en tu camino para dejar de fumar.",
      "¡Saludos! Soy el asistente de ZeroSmoke, estoy aquí para apoyarte en tu decisión de dejar el tabaco.",
    ],
    ayuda: [
      "Puedo ayudarte con información sobre cómo dejar de fumar, los beneficios para la salud, y estrategias para manejar la abstinencia. ¿Sobre qué te gustaría saber más?",
      "Estoy aquí para apoyarte en tu camino para dejar de fumar. Puedo ofrecerte información, consejos y recursos útiles.",
      "Puedo proporcionarte información sobre métodos para dejar de fumar, consejos para manejar los antojos, y estrategias para prevenir recaídas. ¿Qué te interesa más?",
      "Estoy aquí para ayudarte con cualquier duda sobre el proceso de dejar de fumar. Desde técnicas efectivas hasta apoyo emocional, ¡cuenta conmigo!",
    ],
    gracias: [
      "¡De nada! Estoy aquí para ayudarte en tu camino hacia una vida libre de tabaco.",
      "Es un placer poder ayudarte. ¡Sigue adelante con tu objetivo de dejar de fumar!",
      "No hay de qué. Recuerda que cada día sin fumar es una victoria. ¡Sigue así!",
      "¡Para eso estoy! Tu determinación es admirable. Estoy aquí para apoyarte en cada paso del camino.",
    ],
    beneficios: [
      "Dejar de fumar tiene numerosos beneficios para la salud, incluyendo: mejor circulación sanguínea, reducción del riesgo de enfermedades cardíacas y cáncer, mejora en la capacidad pulmonar, y aumento de la esperanza de vida.",
      "Los beneficios de dejar de fumar comienzan casi inmediatamente: en 20 minutos tu presión arterial baja, en 12 horas el monóxido de carbono en sangre se normaliza, en 2 semanas mejora la circulación, y en 1-9 meses disminuye la tos y la dificultad para respirar.",
      "Al dejar de fumar, notarás mejoras en tu sentido del gusto y olfato, tendrás más energía, tu piel lucirá más saludable, y reducirás significativamente tu riesgo de desarrollar enfermedades graves como cáncer de pulmón y enfermedades cardíacas.",
      "Dejar de fumar no solo mejora tu salud física, sino también tu bienestar mental. Muchas personas reportan menos ansiedad, mejor calidad de sueño y una sensación general de logro y control sobre su vida.",
      "Además de los beneficios para la salud, dejar de fumar tiene ventajas económicas significativas. Un fumador promedio puede ahorrar miles de euros al año, dinero que puede invertir en actividades más saludables y placenteras.",
    ],
    abstinencia: [
      "El síndrome de abstinencia incluye síntomas como ansiedad, irritabilidad, dificultad para concentrarse, aumento del apetito, y antojos de nicotina. Estos síntomas suelen alcanzar su punto máximo en los primeros 3-5 días y disminuyen gradualmente durante 2-4 semanas.",
      "Para manejar los síntomas de abstinencia, puedes probar técnicas de relajación, ejercicio físico, mantenerte hidratado, y considerar terapias de reemplazo de nicotina bajo supervisión médica.",
      "La abstinencia de nicotina puede manifestarse con insomnio, dolores de cabeza, mareos y cambios de humor. Recuerda que estos síntomas son temporales y cada día que pasa se vuelven menos intensos.",
      "Durante la abstinencia, tu cerebro está reajustándose a funcionar sin nicotina. Puedes experimentar dificultad para concentrarte o sensación de niebla mental. Estas son señales positivas de que tu cuerpo está sanando.",
      "Un síntoma común de abstinencia es el estreñimiento o malestar digestivo. Aumentar el consumo de fibra y agua puede ayudar a aliviar estos síntomas mientras tu cuerpo se adapta.",
    ],
    "dejar de fumar": [
      "Para dejar de fumar, puedes considerar estas estrategias: establecer una fecha para dejar de fumar, buscar apoyo de amigos y familiares, usar terapias de reemplazo de nicotina, evitar situaciones que asocias con fumar, y mantenerte ocupado con actividades saludables.",
      "Existen varios métodos para dejar de fumar: dejar de golpe (cold turkey), reducción gradual, terapias de reemplazo de nicotina, medicamentos recetados, y apoyo psicológico. Lo importante es encontrar el método que mejor funcione para ti.",
      "Un enfoque efectivo para dejar de fumar es el método STAR: Selecciona una fecha para dejar, Ten un plan para manejar los antojos, Anticipa los desafíos, y Recompénsate por tus logros.",
      "La terapia cognitivo-conductual ha demostrado ser muy efectiva para dejar de fumar. Te ayuda a identificar y cambiar los patrones de pensamiento y comportamiento asociados con el tabaco.",
      "Muchas personas encuentran útil llevar un diario durante el proceso de dejar de fumar. Registra tus antojos, desencadenantes y estrategias exitosas para manejarlos. Esto te dará perspectiva y te ayudará a identificar patrones.",
    ],
    recaída: [
      "Las recaídas son parte común del proceso de dejar de fumar. Si recaes, no te desanimes. Analiza qué desencadenó la recaída, aprende de la experiencia y vuelve a intentarlo. Cada intento te acerca más al éxito.",
      "Si has tenido una recaída, recuerda que muchas personas necesitan varios intentos antes de dejar de fumar definitivamente. Considera lo que has aprendido y desarrolla un plan más fuerte para tu próximo intento.",
      "Una recaída no significa fracaso, sino una oportunidad de aprendizaje. Identifica las situaciones, emociones o personas que desencadenaron tu deseo de fumar y desarrolla estrategias específicas para manejarlas en el futuro.",
      "Después de una recaída, es importante que te perdones a ti mismo. La culpa y la vergüenza solo aumentan el estrés, lo que puede llevarte a fumar más. Reconoce que estás haciendo un cambio difícil y sé amable contigo mismo.",
      "Si has recaído, considera buscar apoyo adicional. Unirte a un grupo de apoyo, hablar con un consejero especializado en adicciones o utilizar recursos adicionales como aplicaciones de seguimiento pueden aumentar tus probabilidades de éxito en el próximo intento.",
    ],
    ansiedad: [
      "La ansiedad es un síntoma común al dejar de fumar. Puedes manejarla con técnicas de respiración profunda, meditación, ejercicio físico regular, y reduciendo el consumo de cafeína.",
      "Para reducir la ansiedad al dejar de fumar, mantén tus manos ocupadas con objetos como pelotas antiestrés, practica ejercicios de relajación, y considera hablar con un profesional si la ansiedad es severa.",
      "La técnica 4-7-8 puede ayudar a reducir la ansiedad: inhala por 4 segundos, mantén la respiración por 7 segundos, y exhala lentamente por 8 segundos. Repite este ciclo varias veces cuando sientas ansiedad.",
      "El ejercicio físico libera endorfinas, que son analgésicos naturales que mejoran el estado de ánimo. Incluso una caminata corta de 10 minutos puede reducir significativamente la ansiedad asociada con dejar de fumar.",
      "Muchas personas encuentran útil la aromaterapia para reducir la ansiedad. Aceites esenciales como lavanda, manzanilla o bergamota pueden tener efectos calmantes. Puedes usar un difusor o aplicar unas gotas en un pañuelo para inhalar cuando sientas ansiedad.",
    ],
    app: [
      "Nuestra aplicación móvil te ofrece herramientas para seguir tu progreso, recibir consejos personalizados, conectar con una comunidad de apoyo, y acceder a recursos para dejar de fumar en cualquier momento y lugar.",
      "La app de ZeroSmoke incluye un contador de días sin fumar, calculadora de dinero ahorrado, seguimiento de síntomas y mejoras de salud, y ejercicios para manejar los antojos.",
      "ZeroSmoke te permite establecer metas personalizadas y te recompensa con logros virtuales a medida que avanzas en tu camino para dejar de fumar, lo que aumenta tu motivación y compromiso.",
      "Una característica única de nuestra app es el 'Botón SOS', que puedes usar en momentos de antojo intenso para recibir técnicas de distracción inmediatas y mensajes de apoyo personalizados.",
      "La app ZeroSmoke utiliza inteligencia artificial para aprender de tus patrones y desencadenantes, ofreciéndote consejos cada vez más personalizados a medida que la usas.",
    ],
    test: [
      "Nuestro test de dependencia a la nicotina te ayuda a entender tu nivel de adicción y te proporciona recomendaciones personalizadas basadas en tus resultados.",
      "El test de dependencia evalúa factores como la cantidad de cigarrillos que fumas, cuándo fumas tu primer cigarrillo del día, y qué situaciones te provocan más antojos.",
      "El test de ZeroSmoke está basado en el Test de Fagerström, una herramienta validada científicamente para evaluar la dependencia física a la nicotina, complementado con evaluaciones de dependencia psicológica.",
      "Completar nuestro test te llevará menos de 5 minutos, pero los resultados pueden ser transformadores para tu estrategia de dejar de fumar, ya que te ayudarán a entender qué tipo de apoyo necesitas.",
      "Después de completar el test, recibirás un informe detallado con tu nivel de dependencia, factores de riesgo personales, y un plan de acción personalizado con recomendaciones específicas para tu caso.",
    ],
    alternativas: [
      "Existen varias alternativas al tabaco tradicional, como los cigarrillos electrónicos, terapias de reemplazo de nicotina (parches, chicles, inhaladores), y medicamentos recetados como bupropión o vareniclina. Consulta con un profesional de la salud para encontrar la mejor opción para ti.",
      "Las terapias de reemplazo de nicotina (TRN) como parches, chicles o pastillas pueden duplicar tus posibilidades de dejar de fumar con éxito al reducir los síntomas de abstinencia mientras trabajas en cambiar los hábitos asociados con fumar.",
      "Algunas personas encuentran útil el vapeo como una herramienta de reducción de daños o como paso intermedio para dejar de fumar. Sin embargo, es importante recordar que no está libre de riesgos y el objetivo final debería ser dejar toda forma de nicotina.",
      "Las hierbas como la valeriana, la pasiflora o el ginseng son utilizadas por algunas personas para reducir la ansiedad y los antojos durante el proceso de dejar de fumar. Consulta con un especialista antes de usar cualquier suplemento herbal.",
      "La acupuntura y la hipnoterapia son métodos alternativos que algunas personas encuentran efectivos para dejar de fumar. Aunque la evidencia científica es mixta, pueden funcionar bien como complemento a otros métodos más establecidos.",
    ],
    salud: [
      "El tabaco afecta prácticamente a todos los órganos del cuerpo. Aumenta el riesgo de cáncer, enfermedades cardíacas, accidentes cerebrovasculares, enfermedades pulmonares, diabetes y enfermedades crónicas.",
      "Fumar daña los pulmones de varias maneras: destruye los alvéolos (pequeños sacos de aire), inflama el revestimiento de las vías respiratorias, y paraliza los cilios (pequeños pelos que limpian los pulmones), lo que lleva a acumulación de mucosidad y mayor riesgo de infecciones.",
      "El tabaco contiene más de 7,000 sustancias químicas, de las cuales al menos 70 son conocidas por causar cáncer. Estas sustancias no solo afectan a los pulmones, sino que viajan por el torrente sanguíneo a todo el cuerpo.",
      "El humo del tabaco daña el ADN de tus células, lo que puede llevar a mutaciones y eventualmente al desarrollo de cáncer. Este daño comienza con el primer cigarrillo y se acumula con el tiempo.",
      "Además de los efectos a largo plazo, fumar tiene consecuencias inmediatas: aumenta tu presión arterial y frecuencia cardíaca, reduce el oxígeno en la sangre, y disminuye la función pulmonar, lo que afecta tu rendimiento físico diario.",
    ],
    peso: [
      "Es común preocuparse por el aumento de peso al dejar de fumar. Puedes minimizarlo con una dieta equilibrada, ejercicio regular, y manteniendo hábitos saludables. Recuerda que los beneficios para la salud de dejar de fumar superan ampliamente cualquier aumento de peso temporal.",
      "El aumento de peso promedio al dejar de fumar es de 4-5 kg, pero varía mucho entre individuos. Este aumento suele estabilizarse después de unos meses y puede gestionarse con hábitos saludables.",
      "Para evitar el aumento de peso, mantén snacks saludables a mano como frutas, verduras o frutos secos sin sal. Estos pueden ayudarte a manejar los antojos orales sin añadir calorías excesivas.",
      "El ejercicio regular no solo ayuda a controlar el peso al dejar de fumar, sino que también reduce los antojos de nicotina y mejora el estado de ánimo al liberar endorfinas, las 'hormonas de la felicidad'.",
      "La nicotina aumenta ligeramente tu metabolismo y suprime el apetito. Al dejar de fumar, es normal que tu apetito aumente temporalmente. Planifica comidas regulares y nutritivas para evitar comer en exceso por ansiedad.",
    ],
    dormir: [
      "Muchas personas experimentan dificultades para dormir al dejar de fumar. Esto es temporal y puedes mejorar tu sueño estableciendo una rutina regular, evitando la cafeína por la tarde, y creando un ambiente propicio para el descanso.",
      "La nicotina es un estimulante que puede interferir con tu ciclo de sueño natural. Al dejar de fumar, tu cuerpo necesita tiempo para reajustar sus patrones de sueño, pero eventualmente disfrutarás de un descanso más profundo y reparador.",
      "Si tienes problemas para dormir durante la abstinencia, prueba técnicas de relajación antes de acostarte: meditación guiada, baños tibios, o leer un libro (no en pantallas) pueden ayudar a preparar tu mente y cuerpo para el descanso.",
      "El ejercicio regular puede mejorar significativamente la calidad del sueño, pero trata de no hacerlo justo antes de acostarte, ya que puede tener un efecto estimulante. Lo ideal es ejercitarse al menos 3-4 horas antes de ir a la cama.",
      "Si los problemas de sueño persisten más de dos semanas después de dejar de fumar, considera consultar con un profesional de la salud. Podrían recomendarte estrategias adicionales o tratamientos temporales para ayudarte durante esta transición.",
    ],
    motivación: [
      "Mantener la motivación es clave para dejar de fumar con éxito. Escribe tus razones para dejar de fumar y revísalas cuando sientas que tu determinación flaquea.",
      "Celebra cada logro, por pequeño que sea. Cada día sin fumar es una victoria. Considera recompensarte con algo especial cuando alcances hitos importantes, como una semana, un mes o un año sin fumar.",
      "Visualiza tu futuro como no fumador: mejor salud, más energía, ahorro de dinero, y libertad de la adicción. Esta imagen mental puede ser un poderoso motivador cuando enfrentes momentos difíciles.",
      "Comparte tu objetivo de dejar de fumar con amigos y familiares de confianza. Su apoyo y aliento pueden ser cruciales en momentos de debilidad, y rendir cuentas a otros puede aumentar tu compromiso.",
      "Recuerda que los deslices no significan fracaso. Si fumas un cigarrillo después de un período de abstinencia, no te rindas. Aprende de la experiencia, refuerza tu compromiso y continúa con tu plan para dejar de fumar.",
    ],
    ayudar: [
      "Para ayudar a alguien a dejar de fumar, ofrece apoyo sin juzgar. Pregunta cómo puedes ayudar, respeta sus decisiones sobre el método para dejar de fumar, y celebra sus logros, por pequeños que sean.",
      "Evita sermonear o criticar a la persona que está intentando dejar de fumar. En su lugar, escucha activamente sus preocupaciones y ofrece palabras de aliento y apoyo práctico cuando lo necesiten.",
      "Sugiere actividades que no involucren fumar y ayuden a distraer de los antojos, como caminar, ver una película, o practicar un hobby. Participar juntos en estas actividades puede fortalecer su resolución.",
      "Aprende sobre el proceso de dejar de fumar para entender mejor lo que está experimentando tu ser querido. Esto te ayudará a ser más empático y a ofrecer un apoyo más efectivo durante los momentos difíciles.",
      "Si vives con alguien que está dejando de fumar, considera crear un ambiente libre de humo y eliminar objetos que puedan desencadenar antojos, como ceniceros o encendedores. Pequeños cambios en el entorno pueden marcar una gran diferencia.",
    ],
    tiempo: [
      "El tiempo necesario para dejar de fumar varía para cada persona. Mientras que los síntomas físicos de abstinencia suelen durar 2-4 semanas, el aspecto psicológico puede llevar más tiempo. Lo importante es mantener la perseverancia y buscar apoyo cuando lo necesites.",
      "La mayoría de las personas hacen varios intentos antes de dejar de fumar definitivamente. Cada intento es una oportunidad de aprendizaje que aumenta tus probabilidades de éxito a largo plazo.",
      "Los primeros 3-5 días suelen ser los más difíciles físicamente, ya que es cuando los síntomas de abstinencia de nicotina alcanzan su punto máximo. Después de 2-3 semanas, estos síntomas físicos disminuyen significativamente.",
      "Aunque los síntomas físicos de abstinencia disminuyen relativamente rápido, los hábitos psicológicos y las asociaciones con fumar pueden persistir durante meses. Con el tiempo y práctica consciente, estos también se debilitan.",
      "Según estudios, después de un año sin fumar, tus probabilidades de volver a la adicción caen al 5%. Cada día que pasas sin fumar fortalece tu nueva identidad como no fumador y hace más fácil mantener este cambio positivo.",
    ],
    relajación: [
      "La respiración profunda es una técnica efectiva para manejar los antojos: inhala lentamente por la nariz contando hasta 4, mantén el aire contando hasta 7, y exhala por la boca contando hasta 8. Repite 3-5 veces cuando sientas ansiedad o deseos de fumar.",
      "La meditación mindfulness puede ayudarte a observar tus antojos sin reaccionar automáticamente. Dedica 5-10 minutos diarios a sentarte en silencio, enfocándote en tu respiración y observando tus pensamientos sin juzgarlos.",
      "El ejercicio de tensión-relajación progresiva consiste en tensar y luego relajar diferentes grupos musculares, desde los pies hasta la cabeza. Esta técnica reduce la tensión física asociada con la abstinencia y la ansiedad.",
      "Actividades creativas como dibujar, colorear, tocar un instrumento o escribir pueden ser formas efectivas de relajación que mantienen tus manos y mente ocupadas durante los momentos de antojo.",
      "La visualización guiada implica imaginar un lugar tranquilo y seguro con todos tus sentidos. Dedica 5 minutos a imaginar vívidamente este refugio cuando te sientas estresado o tentado a fumar.",
    ],
    estadísticas: [
      "Según la Organización Mundial de la Salud, el tabaco mata hasta a la mitad de sus consumidores. Cada año, más de 8 millones de personas mueren por enfermedades relacionadas con el tabaco, de las cuales 1.2 millones son no fumadores expuestos al humo de segunda mano.",
      "Los estudios muestran que aproximadamente el 70% de los fumadores quieren dejar de fumar, pero solo alrededor del 7% logra hacerlo sin ayuda. Con apoyo adecuado y métodos basados en evidencia, las tasas de éxito pueden aumentar significativamente.",
      "Dejar de fumar a los 30 años reduce el riesgo de muerte prematura en casi un 90% comparado con continuar fumando. Incluso dejar de fumar a los 50 años reduce el riesgo en aproximadamente un 50%.",
      "El riesgo de enfermedad cardíaca comienza a disminuir tan solo 24 horas después de dejar de fumar. Después de un año, el riesgo se reduce a la mitad, y después de 15 años, el riesgo es similar al de alguien que nunca ha fumado.",
      "Los estudios demuestran que combinar terapia de reemplazo de nicotina con asesoramiento puede triplicar tus posibilidades de dejar de fumar con éxito comparado con intentarlo sin ayuda.",
    ],
    efectos: [
      "Los efectos positivos de dejar de fumar comienzan casi inmediatamente: en 20 minutos, tu presión arterial y pulso se normalizan; en 8 horas, los niveles de monóxido de carbono en sangre se reducen a la mitad; y en 24 horas, tu riesgo de ataque cardíaco comienza a disminuir.",
      "Después de 48 horas sin fumar, tus terminaciones nerviosas comienzan a regenerarse y tu sentido del olfato y gusto mejoran notablemente. Muchos ex fumadores se sorprenden al redescubrir sabores que habían olvidado.",
      "A las 2-3 semanas de dejar de fumar, tu función pulmonar mejora hasta en un 30%, lo que se traduce en menos tos, menos falta de aire y más energía para actividades físicas diarias.",
      "Después de 1-9 meses sin fumar, los cilios de tus pulmones (pequeños pelos que limpian los pulmones) se regeneran, mejorando la capacidad de tu cuerpo para eliminar mucosidad y reduciendo el riesgo de infecciones respiratorias.",
      "Los beneficios a largo plazo son aún más impresionantes: después de 10 años sin fumar, tu riesgo de cáncer de pulmón se reduce a la mitad, y después de 15 años, tu riesgo de enfermedad coronaria es similar al de alguien que nunca ha fumado.",
    ],
    cigarrillo: [
      "Un solo cigarrillo contiene más de 7,000 sustancias químicas, de las cuales al menos 70 son conocidas por causar cáncer. Estas incluyen arsénico (usado en veneno para ratas), formaldehído (usado para preservar cadáveres) y cianuro de hidrógeno (usado en cámaras de gas).",
      "Cada vez que inhalas humo de un cigarrillo, estas sustancias tóxicas entran en tu torrente sanguíneo y se distribuyen por todo tu cuerpo, afectando prácticamente a cada órgano y sistema.",
      "El alquitrán en los cigarrillos se acumula en tus pulmones como una sustancia pegajosa y negra que daña los alvéolos (pequeños sacos de aire) y puede eventualmente llevar a enfisema y otras enfermedades pulmonares obstructivas crónicas.",
      "La nicotina, el componente adictivo del tabaco, alcanza tu cerebro en solo 7-10 segundos después de inhalar, liberando dopamina y creando una sensación de placer y recompensa que refuerza la adicción.",
      "Además de los daños directos a tu salud, los residuos químicos de los cigarrillos permanecen en tu ropa, cabello, muebles y paredes, exponiendo a quienes te rodean a estos tóxicos incluso cuando no estás fumando activamente.",
    ],
    embarazo: [
      "Fumar durante el embarazo aumenta el riesgo de complicaciones como placenta previa, desprendimiento prematuro de placenta, embarazo ectópico, y ruptura prematura de membranas. Dejar de fumar, incluso en etapas avanzadas del embarazo, puede reducir estos riesgos.",
      "Los bebés de madres fumadoras tienen mayor probabilidad de nacer con bajo peso (menos de 2.5 kg), lo que aumenta su riesgo de problemas de salud a corto y largo plazo, incluyendo dificultades respiratorias y retraso en el desarrollo.",
      "La exposición prenatal al humo del tabaco está asociada con un mayor riesgo de síndrome de muerte súbita del lactante (SMSL), así como con problemas respiratorios como asma y bronquitis en la infancia.",
      "Dejar de fumar antes o durante el embarazo es una de las mejores cosas que puedes hacer por tu salud y la de tu bebé. Nunca es demasiado tarde: los beneficios comienzan tan pronto como dejas de fumar.",
      "Si estás embarazada y fumando, habla con tu médico sobre métodos seguros para dejar de fumar durante el embarazo. Algunas formas de terapia de reemplazo de nicotina pueden ser consideradas bajo supervisión médica si no puedes dejar de fumar por otros medios.",
    ],
  }

  // Función para obtener respuesta del bot
  const getBotResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()

    // Buscar palabras clave en el input
    for (const [keyword, responseOptions] of Object.entries(responses)) {
      if (lowerInput.includes(keyword)) {
        // Seleccionar aleatoriamente una de las respuestas disponibles
        const randomIndex = Math.floor(Math.random() * responseOptions.length)
        return responseOptions[randomIndex]
      }
    }

    // Respuestas para preguntas comunes que no coinciden exactamente con palabras clave
    if ((lowerInput.includes("cómo") || lowerInput.includes("como")) && lowerInput.includes("funciona")) {
      return "ZeroSmoke funciona a través de un enfoque integral que combina información educativa, herramientas de seguimiento, apoyo comunitario y técnicas basadas en evidencia para ayudarte a dejar de fumar de manera efectiva. Nuestra app te acompaña en cada paso del proceso, desde la preparación hasta el mantenimiento a largo plazo."
    }

    if ((lowerInput.includes("cuánto") || lowerInput.includes("cuanto")) && lowerInput.includes("tiempo")) {
      return "El tiempo necesario para dejar de fumar varía para cada persona. Los síntomas físicos de abstinencia suelen durar 2-4 semanas, mientras que los hábitos psicológicos pueden llevar más tiempo en cambiar. La mayoría de las personas hacen varios intentos antes de dejar de fumar definitivamente. Cada intento aumenta tus probabilidades de éxito a largo plazo."
    }

    if (lowerInput.includes("peso") || lowerInput.includes("engordar") || lowerInput.includes("adelgazar")) {
      return "Es común preocuparse por el aumento de peso al dejar de fumar. El aumento promedio es de 4-5 kg, pero puedes minimizarlo con una dieta equilibrada, ejercicio regular y hábitos saludables. Recuerda que los beneficios para la salud de dejar de fumar superan ampliamente cualquier aumento de peso temporal."
    }

    if (lowerInput.includes("niños") || lowerInput.includes("hijos") || lowerInput.includes("familia")) {
      return "El humo de segunda mano es especialmente perjudicial para los niños, ya que sus cuerpos están en desarrollo. Los niños expuestos al humo del tabaco tienen mayor riesgo de infecciones respiratorias, asma, problemas de oído y síndrome de muerte súbita del lactante. Dejar de fumar no solo mejora tu salud, sino que protege la de tus seres queridos."
    }

    if (lowerInput.includes("ejercicio") || lowerInput.includes("deporte") || lowerInput.includes("actividad física")) {
      return "El ejercicio es una herramienta poderosa cuando estás dejando de fumar. No solo ayuda a controlar el peso, sino que reduce los antojos, mejora el estado de ánimo, disminuye el estrés y acelera la recuperación de tus pulmones. Incluso 10 minutos diarios de actividad moderada pueden marcar una gran diferencia en tu proceso."
    }

    if (lowerInput.includes("medicamentos") || lowerInput.includes("fármacos") || lowerInput.includes("pastillas")) {
      return "Existen medicamentos recetados que pueden ayudarte a dejar de fumar, como bupropión (Zyban) y vareniclina (Champix). Estos actúan sobre los receptores cerebrales para reducir los antojos y los síntomas de abstinencia. Siempre deben usarse bajo supervisión médica y como parte de un programa integral para dejar de fumar."
    }

    // Respuesta por defecto
    return "Lo siento, no tengo información específica sobre eso. ¿Puedes reformular tu pregunta o preguntar sobre beneficios de dejar de fumar, síntomas de abstinencia, estrategias para dejar de fumar, o nuestra aplicación? Estoy aquí para ayudarte en tu camino hacia una vida libre de tabaco."
  }

  // Función para formatear la hora
  const formatTime = (date?: Date) => {
    if (!date) return ""
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Función para manejar la entrada del usuario
  const handleSendMessage = () => {
    if (inputValue.trim() === "") return

    // Añadir mensaje del usuario con timestamp
    const userMessage = {
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    }
    addMessage(userMessage)

    // Mostrar indicador de escritura
    setIsTyping(true)

    // Procesar respuesta con un retraso realista
    setTimeout(
      () => {
        setIsTyping(false)

        const botResponse = getBotResponse(inputValue)
        const botMessage = {
          text: botResponse,
          isUser: false,
          timestamp: new Date(),
        }
        addMessage(botMessage)

        if (!isOpen) {
          setHasNewMessage(true)
        }
      },
      1000 + Math.random() * 1000,
    ) // Tiempo de respuesta variable entre 1-2 segundos

    setInputValue("")
  }

  // Manejar pregunta sugerida
  const handleSuggestedQuestion = (question: string) => {
    // Añadir mensaje del usuario con timestamp
    const userMessage = {
      text: question,
      isUser: true,
      timestamp: new Date(),
    }
    addMessage(userMessage)

    // Mostrar indicador de escritura
    setIsTyping(true)

    // Procesar respuesta con un retraso realista
    setTimeout(
      () => {
        setIsTyping(false)

        const botResponse = getBotResponse(question)
        const botMessage = {
          text: botResponse,
          isUser: false,
          timestamp: new Date(),
        }
        addMessage(botMessage)
      },
      1000 + Math.random() * 1000,
    )
  }

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  // Mensaje de bienvenida
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        text: "¡Hola! Soy el asistente virtual de ZeroSmoke. ¿En qué puedo ayudarte hoy?",
        isUser: false,
        timestamp: new Date(),
      }
      addMessage(welcomeMessage)
    }
  }, [isOpen, messages.length, addMessage])

  // Limpiar notificación cuando se abre el chat
  useEffect(() => {
    if (isOpen) {
      setHasNewMessage(false)
    }
  }, [isOpen])

  return (
    <ChatbotContainer>
      <ChatbotButton onClick={toggleChat} aria-label={isOpen ? "Cerrar chat" : "Abrir chat"}>
        {isOpen ? "✕" : "💬"}
        {hasNewMessage && !isOpen && <NotificationBadge>1</NotificationBadge>}
      </ChatbotButton>

      {isOpen && (
        <ChatWindow isOpen={isOpen}>
          <ChatHeader>
            <ChatTitle>Asistente ZeroSmoke</ChatTitle>
            <CloseButton onClick={toggleChat} aria-label="Cerrar chat">
              ✕
            </CloseButton>
          </ChatHeader>

          <ChatMessages>
            {messages.map((message, index) => (
              <MessageContainer key={index} isUser={message.isUser}>
                <MessageBubble isUser={message.isUser}>{message.text}</MessageBubble>
                <MessageTime>{formatTime(message.timestamp)}</MessageTime>
              </MessageContainer>
            ))}

            {isTyping && (
              <MessageContainer isUser={false}>
                <TypingIndicator>
                  <TypingDot />
                  <TypingDot />
                  <TypingDot />
                </TypingIndicator>
              </MessageContainer>
            )}

            <div ref={messagesEndRef} />
          </ChatMessages>

          <SuggestedQuestions>
            {suggestedQuestions.map((question, index) => (
              <SuggestedQuestion key={index} onClick={() => handleSuggestedQuestion(question)}>
                {question}
              </SuggestedQuestion>
            ))}
          </SuggestedQuestions>

          <ChatInputContainer>
            <StyledInput
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe tu mensaje..."
              fullWidth
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage()
                }
              }}
            />
            <SendButton onClick={handleSendMessage} aria-label="Enviar mensaje">
              ➤
            </SendButton>
          </ChatInputContainer>
        </ChatWindow>
      )}
    </ChatbotContainer>
  )
}

export default Chatbot
