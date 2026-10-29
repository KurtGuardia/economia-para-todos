import {
  ageGroups, demographicSegments, departments, getDashboardMetrics,
  matchesDashboardFilters, performanceMetrics, sectors, sexes,
  type DashboardFilters, type TrafficLight,
} from './mock-data'

export type MetricId = (typeof performanceMetrics)[number]['id']

// Additional fictional retention cohorts extend the existing 810 segments.
// Counts, rather than percentages, are aggregated so every filtered rate and
// its breakdown reconcile. Calibrate the national rate to the approved 76%.
const departmentEffect: Record<string, number> = {
  LP: .035, SC: .05, CB: .025, OR: -.025, PT: -.05,
  CH: -.04, TJ: .005, BE: -.06, PA: -.075,
}
const sectorEffect: Record<string, number> = {
  comercio: .005, gastronomia: -.01, textil: .035, servicios: .02,
  transporte: -.02, agro: -.035, artesania: -.015, digital: .04, belleza: .01,
}
const ageEffect: Record<string, number> = {
  '18–24': -.035, '25–34': -.005, '35–44': .025, '45–54': .015, '55+': -.015,
}
const cohorts = demographicSegments.map((row) => ({
  ...row,
  eligible: Math.round(row.registered * .7),
  effect: departmentEffect[row.departmentId] + sectorEffect[row.sectorId]
    + ageEffect[row.ageGroup] + (row.sex === 'Mujer' ? .008 : -.008),
}))
const eligibleTotal = cohorts.reduce((sum, row) => sum + row.eligible, 0)
const averageEffect = cohorts.reduce((sum, row) => sum + row.eligible * row.effect, 0) / eligibleTotal
const retentionSegments = cohorts.map((row) => ({
  ...row,
  retained: Math.round(row.eligible * (.76 + row.effect - averageEffect)),
}))
let remainder = Math.round(eligibleTotal * .76) - retentionSegments.reduce((sum, row) => sum + row.retained, 0)
for (const row of retentionSegments) {
  if (remainder === 0) break
  const correction = Math.sign(remainder)
  if (row.retained + correction >= 0 && row.retained + correction <= row.eligible) {
    row.retained += correction
    remainder -= correction
  }
}

const limits: Record<MetricId, { green: number; yellow: number }> = {
  formalizacion: { green: 80, yellow: 65 },
  permanencia: { green: 75, yellow: 60 },
  credito: { green: 40, yellow: 25 },
  proteccion: { green: 35, yellow: 20 },
  mercados: { green: 25, yellow: 15 },
}

export function getPerformanceStatus(id: MetricId, value: number): TrafficLight {
  return value >= limits[id].green ? 'green' : value >= limits[id].yellow ? 'yellow' : 'red'
}

export function getPerformanceMetrics(filters: DashboardFilters = {}) {
  const dashboard = getDashboardMetrics(filters)
  const retention = retentionSegments.filter((row) => matchesDashboardFilters(row, filters))
  const retained = retention.reduce((sum, row) => sum + row.retained, 0)
  const eligible = retention.reduce((sum, row) => sum + row.eligible, 0)
  const counts: Record<MetricId, { numerator: number; denominator: number }> = {
    formalizacion: { numerator: dashboard.active, denominator: dashboard.registered },
    permanencia: { numerator: retained, denominator: eligible },
    credito: { numerator: dashboard.creditsGranted, denominator: dashboard.active },
    proteccion: { numerator: dashboard.protected, denominator: dashboard.active },
    mercados: { numerator: dashboard.marketIntegrated, denominator: dashboard.active },
  }
  return performanceMetrics.map((definition) => {
    const { numerator, denominator } = counts[definition.id]
    const valuePct = denominator ? Number((numerator / denominator * 100).toFixed(1)) : 0
    return { ...definition, numerator, denominator, valuePct, status: getPerformanceStatus(definition.id, valuePct) }
  })
}

/** Compare the first unfiltered dimension, keeping all other filters intact. */
export function getPerformanceBreakdown(id: MetricId, filters: DashboardFilters) {
  const dimensions = [
    { key: 'department', title: 'Comparación por departamento', options: departments.map((item) => item.name) },
    { key: 'sector', title: 'Comparación por sector', options: sectors.map((item) => item.name) },
    { key: 'sex', title: 'Comparación por sexo', options: [...sexes] },
    { key: 'ageGroup', title: 'Comparación por edad', options: [...ageGroups] },
  ] as const
  const dimension = dimensions.find((item) => !filters[item.key] || filters[item.key] === 'Todos') ?? dimensions[3]
  const rows = dimension.options.map((label) => {
    const metric = getPerformanceMetrics({ ...filters, [dimension.key]: label }).find((item) => item.id === id)!
    return { ...metric, label }
  }).sort((left, right) => left.valuePct - right.valuePct)
  return { title: dimension.title, dimension: dimension.key, rows }
}
