import { User, Article, Message, FAQ } from '../models/interfaces';
import bcrypt from 'bcryptjs';

// Usuarios de ejemplo
export const users: User[] = [
  {
    id: 1,
    email: 'admin@zerosmoke.com',
    password: bcrypt.hashSync('admin123', 10),
    fullName: 'Admin Usuario',
    isActive: true,
    isAdmin: true,
    createdAt: new Date(),
    lastLogin: new Date()
  },
  {
    id: 2,
    email: 'user@example.com',
    password: bcrypt.hashSync('user123', 10),
    fullName: 'Usuario Normal',
    isActive: true,
    isAdmin: false,
    createdAt: new Date()
  }
];

// Artículos de ejemplo
export const articles: Article[] = [
  {
    id: 1,
    title: 'Efectos del tabaco en el sistema respiratorio',
    excerpt: 'Los efectos nocivos del tabaco en el sistema respiratorio son extensos y bien documentados. Desde la irritación inmediata hasta enfermedades graves...',
    content: 'Los efectos nocivos del tabaco en el sistema respiratorio son extensos y bien documentados. Desde la irritación inmediata hasta enfermedades graves a largo plazo, el tabaquismo afecta negativamente a todo el sistema respiratorio.\n\nEl humo del tabaco contiene más de 7,000 sustancias químicas, muchas de las cuales son tóxicas y dañinas para los pulmones. Algunas de estas sustancias son conocidas por causar cáncer.\n\n**Efectos a corto plazo:**\n- Irritación de las vías respiratorias\n- Aumento de la mucosidad\n- Tos y respiración sibilante\n- Dificultad para respirar durante el ejercicio\n\n**Efectos a largo plazo:**\n- Enfermedad Pulmonar Obstructiva Crónica (EPOC)\n- Cáncer de pulmón\n- Asma\n- Mayor susceptibilidad a infecciones respiratorias',
    image: '/placeholder.svg?height=200&width=300',
    status: 'published',
    authorId: 1,
    author: 'Admin Usuario',
    createdAt: new Date('2023-05-15'),
    tags: ['salud', 'respiratorio', 'tabaco', 'pulmones']
  },
  {
    id: 2,
    title: 'Beneficios inmediatos al dejar de fumar',
    excerpt: 'Dejar de fumar tiene beneficios inmediatos para la salud. En tan solo 20 minutos después de su último cigarrillo, su cuerpo comienza un proceso de recuperación...',
    content: 'Dejar de fumar tiene beneficios inmediatos para la salud. En tan solo 20 minutos después de su último cigarrillo, su cuerpo comienza un proceso de recuperación que continúa durante años.\n\n**20 minutos después:** Su presión arterial y frecuencia cardíaca disminuyen.\n\n**12 horas después:** El nivel de monóxido de carbono en su sangre vuelve a la normalidad.\n\n**2 semanas a 3 meses después:** Su circulación mejora y la función pulmonar aumenta.\n\n**1 a 9 meses después:** La tos y la falta de aliento disminuyen; los cilios (pequeñas estructuras similares a pelos que mueven el moco fuera de los pulmones) comienzan a recuperar la función normal, aumentando la capacidad de manejar el moco, limpiar los pulmones y reducir el riesgo de infección.\n\n**1 año después:** El riesgo de enfermedad coronaria es aproximadamente la mitad que el de un fumador.',
    image: '/placeholder.svg?height=200&width=300',
    status: 'published',
    authorId: 1,
    author: 'Admin Usuario',
    createdAt: new Date('2023-06-02'),
    tags: ['beneficios', 'salud', 'tabaco']
  },
  {
    id: 3,
    title: 'Estrategias efectivas para dejar de fumar',
    excerpt: 'Hay varias estrategias que han demostrado ser efectivas para ayudar a las personas a dejar de fumar. Desde terapias de reemplazo de nicotina hasta...',
    content: 'Hay varias estrategias que han demostrado ser efectivas para ayudar a las personas a dejar de fumar. Desde terapias de reemplazo de nicotina hasta cambios en el estilo de vida, encontrar el enfoque adecuado puede marcar la diferencia en su viaje para dejar de fumar.',
    image: '/placeholder.svg?height=200&width=300',
    status: 'draft',
    authorId: 1,
    author: 'Admin Usuario',
    createdAt: new Date('2023-06-20'),
    tags: ['estrategias', 'consejos', 'tabaco']
  },
  {
    id: 4,
    title: 'El tabaquismo pasivo y sus riesgos',
    excerpt: 'El tabaquismo pasivo, también conocido como humo de segunda mano, es la inhalación involuntaria del humo de tabaco por los no fumadores...',
    content: 'El tabaquismo pasivo, también conocido como humo de segunda mano, es la inhalación involuntaria del humo de tabaco por los no fumadores. Este humo contiene más de 7,000 sustancias químicas, muchas de las cuales son tóxicas y pueden causar cáncer.',
    image: '/placeholder.svg?height=200&width=300',
    status: 'published',
    authorId: 1,
    author: 'Admin Usuario',
    createdAt: new Date('2023-07-05'),
    tags: ['tabaquismo pasivo', 'riesgos', 'salud']
  }
];

// Mensajes de ejemplo
export const messages: Message[] = [
  {
    id: 1,
    name: 'Juan Pérez',
    email: 'juan.perez@example.com',
    subject: 'Consulta sobre el programa para dejar de fumar',
    message: 'Hola, estoy interesado en el programa para dejar de fumar. Me gustaría saber cuánto tiempo dura y si tiene algún costo. Gracias de antemano por su respuesta.',
    status: 'new',
    createdAt: new Date('2023-07-15T10:30:00')
  },
  {
    id: 2,
    name: 'María González',
    email: 'maria.gonzalez@example.com',
    subject: 'Problemas con la app',
    message: 'Buenas tardes, he estado intentando registrarme en la aplicación pero me aparece un error cada vez que intento crear una cuenta. ¿Podrían ayudarme a solucionar este problema?',
    status: 'read',
    createdAt: new Date('2023-07-14T15:45:00')
  },
  {
    id: 3,
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@example.com',
    subject: 'Agradecimiento',
    message: 'Quería expresar mi agradecimiento por la ayuda que me ha brindado su programa. Llevo 3 meses sin fumar y me siento mejor que nunca. Muchas gracias por todo el apoyo.',
    status: 'answered',
    createdAt: new Date('2023-07-13T09:20:00')
  },
  {
    id: 4,
    name: 'Ana Martínez',
    email: 'ana.martinez@example.com',
    subject: 'Solicitud de información adicional',
    message: 'Hola, me gustaría recibir más información sobre los efectos del tabaco en el embarazo. ¿Tienen algún artículo o recurso sobre este tema en particular?',
    status: 'new',
    createdAt: new Date('2023-07-12T14:10:00')
  }
];

// FAQs de ejemplo
export const faqs: FAQ[] = [
  {
    id: 1,
    question: '¿Cuáles son los beneficios inmediatos de dejar de fumar?',
    answer: 'Los beneficios inmediatos incluyen una mejora en la circulación sanguínea, normalización de la presión arterial y la frecuencia cardíaca, y un aumento en los niveles de oxígeno en la sangre. Además, el sentido del gusto y el olfato comienzan a mejorar en pocos días.',
    category: 'Beneficios',
    createdAt: new Date()
  },
  {
    id: 2,
    question: '¿Cómo puedo manejar los antojos de nicotina?',
    answer: 'Para manejar los antojos, puedes intentar técnicas como respiración profunda, beber agua, mantener las manos ocupadas con actividades, masticar chicle sin azúcar, y evitar situaciones que asocias con fumar. También puedes considerar terapias de reemplazo de nicotina como parches o chicles.',
    category: 'Consejos',
    createdAt: new Date()
  },
  {
    id: 3,
    question: '¿Cuánto tiempo duran los síntomas de abstinencia?',
    answer: 'Los síntomas físicos de abstinencia suelen alcanzar su punto máximo en los primeros 3-5 días y disminuyen gradualmente durante 2-4 semanas. Sin embargo, los antojos psicológicos pueden persistir durante meses, aunque con menor frecuencia e intensidad con el tiempo.',
    category: 'Abstinencia',
    createdAt: new Date()
  },
  {
    id: 4,
    question: '¿Es efectiva la terapia de reemplazo de nicotina?',
    answer: 'Sí, la terapia de reemplazo de nicotina (TRN) ha demostrado ser efectiva para ayudar a las personas a dejar de fumar. Proporciona nicotina en forma controlada sin las toxinas dañinas del humo del tabaco, ayudando a reducir los síntomas de abstinencia mientras se rompe el hábito.',
    category: 'Tratamientos',
    createdAt: new Date()
  }
];