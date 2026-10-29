'use client'

import { useEffect, useMemo, useState } from 'react'
import { MapPin } from 'lucide-react'
import { getDashboardMetrics, type DashboardFilters } from '@/lib/mock-data'

const departmentNamesBySvgId: Record<string, string> = {
  pando: 'Pando', beni: 'Beni', 'la-paz': 'La Paz', cochabamba: 'Cochabamba',
  'santa-cruz': 'Santa Cruz', oruro: 'Oruro', potosi: 'Potosí', chuquisaca: 'Chuquisaca', tarija: 'Tarija',
}
type MapGeometry = { viewBox: string; paths: { id: string; d: string }[]; attribution: string }
const formatNumber = (value: number) => new Intl.NumberFormat('es-BO').format(value)
const formatMoney = (value: number) => `Bs ${new Intl.NumberFormat('es-BO', { maximumFractionDigits: 0 }).format(value)}`

export function BoliviaMap({ selected, onSelect, filters }: {
  selected: string
  onSelect: (department: string) => void
  filters?: DashboardFilters
}) {
  const [geometry, setGeometry] = useState<MapGeometry | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [hoveredDepartment, setHoveredDepartment] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/assets/bolivia-departments.svg', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('No se pudo cargar el mapa')
        return response.text()
      })
      .then((markup) => {
        // Retain exact geometry and attribution from the supplied SVG.
        // React owns each path so state updates preserve event handlers.
        const source = new DOMParser().parseFromString(markup, 'image/svg+xml')
        const paths = Array.from(source.querySelectorAll('path.department')).map((path) => ({
          id: path.id, d: path.getAttribute('d') ?? '',
        }))
        const viewBox = source.documentElement.getAttribute('viewBox')
        if (!viewBox || paths.length !== 9 || paths.some((path) => !departmentNamesBySvgId[path.id] || !path.d)) {
          throw new Error('Geometría incompleta')
        }
        if (!controller.signal.aborted) setGeometry({ viewBox, paths, attribution: source.querySelector('metadata')?.textContent ?? '' })
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadError(true)
      })
    return () => controller.abort()
  }, [])

  const hoveredMetrics = useMemo(
    () => hoveredDepartment ? getDashboardMetrics({ ...filters, department: hoveredDepartment }) : null,
    [filters, hoveredDepartment],
  )

  return (
    <section className="map-panel">
      <h3><MapPin size={19} />Mapa interactivo{selected !== 'Todos' && ` · ${selected} seleccionado`}</h3>
      <div className="map-stage">
        {loadError ? <p className="map-error">No se pudo cargar el mapa de Bolivia.</p> : geometry ? (
          <div className="bolivia-svg">
            <svg viewBox={geometry.viewBox} role="group" aria-labelledby="bolivia-map-title" preserveAspectRatio="xMidYMid meet">
              <title id="bolivia-map-title">Mapa interactivo de Bolivia por departamentos</title>
              <metadata>{geometry.attribution}</metadata>
              <g id="departamentos">
                {geometry.paths.map(({ id, d }) => {
                  const name = departmentNamesBySvgId[id]
                  return <path
                    id={id} key={id} d={d} tabIndex={0} role="button"
                    aria-label={`Seleccionar ${name}`} aria-pressed={selected === name}
                    className={`department ${selected === name ? 'is-selected' : selected !== 'Todos' ? 'is-subdued' : ''}`}
                    onMouseEnter={() => setHoveredDepartment(name)} onMouseLeave={() => setHoveredDepartment(null)}
                    onFocus={() => setHoveredDepartment(name)} onBlur={() => setHoveredDepartment(null)}
                    onClick={() => onSelect(name)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        onSelect(name)
                      }
                    }}
                  ><title>{name}</title></path>
                })}
              </g>
            </svg>
          </div>
        ) : <div className="map-loading" aria-label="Cargando mapa" />}
        {hoveredDepartment && hoveredMetrics && <div className="map-tooltip" role="status">
          <strong>{hoveredDepartment}</strong>
          <span>Personas registradas: {formatNumber(hoveredMetrics.registered)}</span>
          <span>Contribuyentes activos: {formatNumber(hoveredMetrics.active)}</span>
          <span>Capital movilizado: {formatMoney(hoveredMetrics.capitalMobilizedBs)}</span>
        </div>}
      </div>
    </section>
  )
}
