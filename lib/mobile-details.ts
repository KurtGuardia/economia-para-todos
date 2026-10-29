import { maria, opportunities, trainings } from './mock-data'

export type RegistrationValues = {
  firstName: string
  lastName: string
  cedula: string
  department: string
  municipality: string
  activity: string
  sales: string
  phone: string
}

export const createEmptyRegistration = (): RegistrationValues => ({
  firstName: '', lastName: '', cedula: '', department: '', municipality: '', activity: '', sales: '', phone: '',
})

export const demoRegistration: RegistrationValues = {
  firstName: maria.firstName, lastName: maria.lastName,
  cedula: '8347621', department: maria.department, municipality: maria.municipality,
  activity: maria.activity, sales: String(maria.monthlySalesBs), phone: '71234567',
}

export const courseTopics: Record<(typeof trainings)[number]['id'], readonly string[]> = {
  'educacion-financiera': [
    'Ingresos y gastos', 'Separar el dinero personal y del negocio', 'Ahorro para imprevistos',
    'Uso responsable del crédito', 'Planificación simple del negocio',
  ],
  'ventas-digitales': [
    'Preparar un catálogo de productos', 'Fotos y mensajes que comunican valor',
    'Atender consultas por WhatsApp', 'Cerrar una venta y coordinar la entrega',
  ],
  'gestion-costos': [
    'Identificar materiales y costos fijos', 'Valorar tu tiempo de trabajo',
    'Calcular el costo por producto', 'Definir el margen y el precio de venta',
  ],
  'servicio-cliente': [
    'Escuchar lo que necesita el cliente', 'Comunicar precios y plazos con claridad',
    'Resolver reclamos', 'Dar seguimiento y generar confianza',
  ],
}

export type CourseCompletion = Record<string, number[]>
export function createInitialCourseCompletion(): CourseCompletion {
  return Object.fromEntries(trainings.map((course) => [
    course.id,
    Array.from({ length: Math.round(courseTopics[course.id].length * course.mariaProgressPct / 100) }, (_, index) => index),
  ]))
}
export function getCourseProgress(courseId: (typeof trainings)[number]['id'], completion: CourseCompletion) {
  return Math.round((completion[courseId]?.length ?? 0) / courseTopics[courseId].length * 100)
}

// Fictional benefit descriptions for the presentation; these are not policy terms.
export const protectionDetails = [
  {
    id: 'insurance', title: 'Seguro básico', status: 'ACTIVO',
    summary: 'Orientación y atención básica para acompañarte en tu actividad.',
    description: 'Un primer punto de apoyo para consultas de salud y orientación ante imprevistos.',
    features: ['Consultas básicas y atención primaria', 'Orientación sobre los pasos para recibir atención', 'Atención inicial ante emergencias dentro de la cobertura prevista'],
    note: 'Cobertura ilustrativa de la demostración, sujeta al diseño final del programa.',
    action: 'Solicitar orientación', confirmation: 'Orientación solicitada',
  },
  {
    id: 'retirement', title: 'Previsión / retiro', status: 'HABILITADO',
    summary: 'Conoce opciones de ahorro para tu futuro.',
    description: 'El beneficio contempla acompañamiento para organizar un ahorro de largo plazo, según tus posibilidades.',
    features: ['Definir una meta de ahorro', 'Revisar opciones de aportes voluntarios', 'Consultar el seguimiento de tus aportes'],
    note: 'Escenario de demostración. Las condiciones dependerán del diseño final del programa.',
    action: 'Solicitar información', confirmation: 'Interés registrado',
  },
] as const

const opportunityCopy: Record<string, { description: string; category: string; action: string }> = {
  'opp-lp-uniformes-municipio': {
    description: 'Convocatoria para confeccionar y entregar prendas de trabajo para equipos municipales.',
    category: 'Público', action: 'Aplicar',
  },
  'opp-lp-uniformes-privado': {
    description: 'Una empresa busca un taller para producir uniformes de su personal y coordinar entregas.',
    category: 'Privado', action: 'Contactar',
  },
  'opp-lp-feria-productiva': {
    description: 'Espacio para exhibir productos, conocer compradores y crear contactos con otros negocios.',
    category: 'Feria', action: 'Registrar interés',
  },
}

export const mariaOpportunities = opportunities
  .filter((opportunity) => opportunity.matchForMaria)
  .map((opportunity) => ({ ...opportunity, ...opportunityCopy[opportunity.id] }))

export function formatOpportunityDate(value: string) {
  return new Intl.DateTimeFormat('es-BO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${value}T12:00:00Z`))
}
