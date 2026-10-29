'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BatteryFull,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CreditCard,
  GraduationCap,
  IdCard,
  Landmark,
  Phone,
  QrCode,
  RotateCcw,
  Settings,
  ShieldCheck,
  Signal,
  SlidersHorizontal,
  Store,
  UserRound,
  Upload,
  Wifi,
} from 'lucide-react'
import { BoliviaMap } from '@/components/bolivia-map'
import { Opportunities, Protection, Training } from '@/components/mobile-benefits'
import { boliviaLocations, getMunicipalities } from '@/lib/bolivia-locations'
import { createEmptyRegistration, createInitialCourseCompletion, demoRegistration, type CourseCompletion, type RegistrationValues } from '@/lib/mobile-details'
import { getPerformanceBreakdown, getPerformanceMetrics } from '@/lib/performance-details'
import {
  ageGroups,
  departments,
  getDashboardMetrics,
  maria,
  sectors,
  sexes,
} from '@/lib/mock-data'

type MobileScreen =
  | 'landing'
  | 'registration'
  | 'success'
  | 'wallet'
  | 'home'
  | 'contribution'
  | 'credit'
  | 'protection'
  | 'training'
  | 'opportunities'
  | 'profile'
  | 'settings'
type DashboardTab = 'Resumen' | 'Desempeño'
type Filters = { department: string; sector: string; sex: string; ageGroup: string }

const initialFilters: Filters = { department: 'Todos', sector: 'Todos', sex: 'Todos', ageGroup: 'Todos' }
const money = (value: number) => `Bs ${new Intl.NumberFormat('es-BO', { maximumFractionDigits: 0 }).format(value)}`
const number = (value: number) => new Intl.NumberFormat('es-BO').format(value)
const statusLabels = { green: 'VERDE', yellow: 'AMARILLO', red: 'ROJO' } as const

type ButtonProps = {
  children: React.ReactNode
  onClick?: () => void
  secondary?: boolean
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
}

function Button({ children, onClick, secondary = false, className = '', type = 'button', disabled = false }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`demo-button ${secondary ? 'demo-button-secondary' : ''} ${className}`}
    >
      {children}
    </button>
  )
}

function Back({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} className="back-button"><ArrowLeft size={18} /> Volver</button>
}

type PhoneFrameProps = {
  children: React.ReactNode
  activeTab: string
  showNavigation: boolean
  screen: MobileScreen
  onTab: (value: 'home' | 'profile' | 'settings') => void
}

function PhoneFrame({ children, activeTab, showNavigation, onTab, screen }: PhoneFrameProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => { scrollRef.current?.scrollTo({ top: 0 }) }, [screen])
  return (
    <div className="phone-frame">
      <div className="phone-statusbar" aria-hidden="true">
        <span className="phone-time">9:41</span>
        <div className="phone-speaker" />
        <div className="phone-status-icons"><Signal size={16} /><Wifi size={15} /><BatteryFull size={21} /></div>
      </div>
      <div ref={scrollRef} className="phone-content">{children}</div>
      {showNavigation && (
        <nav className="mobile-nav" aria-label="Navegación principal">
          <button type="button" onClick={() => onTab('home')} className={activeTab === 'home' ? 'active' : ''}><Landmark size={19} /><span>Inicio</span></button>
          <button type="button" onClick={() => onTab('profile')} className={activeTab === 'profile' ? 'active' : ''}><UserRound size={19} /><span>Perfil</span></button>
          <button type="button" onClick={() => onTab('settings')} className={activeTab === 'settings' ? 'active' : ''}><Settings size={19} /><span>Ajustes</span></button>
        </nav>
      )}
    </div>
  )
}

type MobileCardProps = {
  icon: React.ElementType
  title: string
  text: string
  onClick?: () => void
}

function MobileCard({ icon: Icon, title, text, onClick }: MobileCardProps) {
  const content = (
    <>
      <div className="mobile-card-heading"><Icon size={20} /><strong>{title}</strong></div>
      <span>{text}</span>
      {onClick && <span className="card-link">Ver <ArrowRight size={15} /></span>}
    </>
  )

  return onClick ? (
    <button type="button" onClick={onClick} className="mobile-card">{content}</button>
  ) : (
    <article className="mobile-card">{content}</article>
  )
}

function Landing({ go }: { go: (screen: MobileScreen) => void }) {
  return (
    <div className="mobile-screen landing">
      <div className="brand">ECONOMÍA PARA TODOS</div>
      <h1>Tu negocio puede<br />crecer más</h1>
      <p>Formaliza de manera simple y accede a crédito, protección y nuevos mercados.</p>
      <div className="landing-art"><Store size={38} /><span>Tu actividad, tus oportunidades.</span></div>
      <Button onClick={() => go('registration')}>Crear mi Libreta Digital</Button>
      <button type="button" className="text-action" onClick={() => go('registration')}>Ya estoy registrado</button>
    </div>
  )
}

function Registration({ onRegister }: { onRegister: (values: RegistrationValues) => void }) {
  const [values, setValues] = useState(createEmptyRegistration)
  const [ciDocument, setCiDocument] = useState<File | 'demo' | null>(null)
  const [documentError, setDocumentError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const municipalities = getMunicipalities(values.department)
  const valid = Object.values(values).every((value) => value.trim().length > 0) && ciDocument !== null

  const fillDemo = () => {
    setValues(demoRegistration)
    setCiDocument('demo')
    setDocumentError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const update = (key: keyof typeof values, value: string) => {
    setValues((current) => ({
      ...current,
      [key]: value,
      ...(key === 'department' ? { municipality: '' } : {}),
    }))
  }

  return (
    <div className="mobile-screen">
      <h2>Crear mi Libreta Digital</h2>
      <p className="screen-subtitle">Paso 1 de 1 · Datos básicos</p>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (valid) onRegister(Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()])) as RegistrationValues)
        }}
        className="form-stack"
      >
        <label>
          Nombre
          <input required autoComplete="given-name" value={values.firstName} onChange={(event) => update('firstName', event.target.value)} />
        </label>
        <label>
          Apellido
          <input required autoComplete="family-name" value={values.lastName} onChange={(event) => update('lastName', event.target.value)} />
        </label>
        <label>
          Cédula
          <input required inputMode="numeric" autoComplete="off" value={values.cedula} onChange={(event) => update('cedula', event.target.value)} />
        </label>
        <div className="ci-field">
          <span id="ci-upload-label">Subir C.I.</span>
          <label className={`ci-upload ${ciDocument ? 'has-document' : ''}`}>
            <input
              ref={fileInputRef}
              id="ci-file"
              type="file"
              accept="image/*,.pdf"
              required={!ciDocument}
              aria-labelledby="ci-upload-label"
              aria-describedby="ci-upload-hint"
              aria-invalid={Boolean(documentError)}
              onChange={(event) => {
                const file = event.target.files?.[0]
                setDocumentError('')
                if (!file) return
                if ((!file.type.startsWith('image/') && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) || file.size > 10 * 1024 * 1024) {
                  setDocumentError('Selecciona una imagen o PDF de hasta 10 MB.')
                  setCiDocument(null)
                  event.target.value = ''
                  return
                }
                setCiDocument(file)
              }}
            />
            {ciDocument ? <IdCard size={26} /> : <Upload size={23} />}
            <span className="ci-upload-copy">
              <strong>{ciDocument === 'demo' ? 'C.I. de María Quispe · ejemplo' : ciDocument ? ciDocument.name : 'Seleccionar carnet de identidad'}</strong>
              <small>{ciDocument === 'demo' ? 'Documento de ejemplo listo para continuar' : ciDocument ? 'Archivo seleccionado · pulsa para cambiar' : 'Foto o PDF de tu carnet'}</small>
            </span>
            {ciDocument && <Check size={18} className="ci-upload-check" />}
          </label>
          <div className="ci-upload-footer">
            <small id="ci-upload-hint">Imagen o PDF · hasta 10 MB</small>
            {ciDocument && <button type="button" onClick={() => {
              setCiDocument(null)
              setDocumentError('')
              if (fileInputRef.current) fileInputRef.current.value = ''
            }}>Quitar archivo</button>}
          </div>
          {documentError && <p className="field-error" role="alert">{documentError}</p>}
        </div>
        <label>
          Departamento
          <div className="form-select">
            <select required value={values.department} onChange={(event) => update('department', event.target.value)}>
              <option value="" disabled>Selecciona un departamento</option>
              {boliviaLocations.map((department) => <option key={department.name}>{department.name}</option>)}
            </select>
            <ChevronDown size={16} />
          </div>
        </label>
        <label>
          Municipio
          <div className="form-select">
            <select
              required
              disabled={!values.department}
              value={values.municipality}
              onChange={(event) => update('municipality', event.target.value)}
            >
              <option value="" disabled>{values.department ? 'Selecciona un municipio' : 'Selecciona primero un departamento'}</option>
              {municipalities.map((municipality) => <option key={municipality}>{municipality}</option>)}
            </select>
            <ChevronDown size={16} />
          </div>
        </label>
        <label>
          Actividad económica
          <input required value={values.activity} onChange={(event) => update('activity', event.target.value)} />
        </label>
        <label>
          Ventas mensuales aproximadas
          <input required inputMode="numeric" value={values.sales} onChange={(event) => update('sales', event.target.value)} />
        </label>
        <label>
          Teléfono
          <input required inputMode="tel" autoComplete="tel" value={values.phone} onChange={(event) => update('phone', event.target.value)} />
        </label>
        <Button type="submit" disabled={!valid} className={!valid ? 'button-disabled' : ''}>Confirmar registro</Button>
        <button type="button" className="presenter-helper" onClick={fillDemo}>llenar datos demo</button>
      </form>
    </div>
  )
}

function Success({ go }: { go: (screen: MobileScreen) => void }) {
  return (
    <div className="mobile-screen centered-screen">
      <Check className="success-check" size={48} />
      <h2>Tu Libreta está lista</h2>
      <p>Identidad verificada · Actividad registrada</p>
      <div className="time-box"><span>Tiempo de registro</span><strong>03:42</strong></div>
      <Button onClick={() => go('wallet')}>Ver mi Libreta</Button>
    </div>
  )
}

function WalletCard({ profile = false, identity }: { profile?: boolean; identity: RegistrationValues }) {
  return (
    <div className={`wallet-card ${profile ? 'wallet-card-profile' : ''}`}>
      <div className="eyebrow">ECONOMÍA PARA TODOS</div>
      <h3>{`${identity.firstName} ${identity.lastName}`.toUpperCase()}</h3>
      <p>{identity.activity} · {identity.municipality}, {identity.department}</p>
      <strong>Estado: {maria.programStatus.toUpperCase()} ✓</strong>
      <div className="qr"><QrCode aria-hidden="true" /><span>Credencial demo</span></div>
      <small>{maria.id} · Miembro desde abril 2026</small>
    </div>
  )
}

function Wallet({ onContinue, identity }: { onContinue: () => void; identity: RegistrationValues }) {
  return (
    <div className="mobile-screen">
      <h2>Mi Libreta Digital</h2>
      <WalletCard identity={identity} />
      <Button onClick={onContinue}>Continuar</Button>
    </div>
  )
}

function HomeScreen({ go, identity }: { go: (screen: MobileScreen) => void; identity: RegistrationValues }) {
  return (
    <div className="mobile-screen home-screen">
      <h2>Buenos días, {identity.firstName}</h2>
      <strong className="section-label">Tu negocio</strong>
      <div className="mini-grid">
        <div><small>Estado</small><b>{maria.programStatus}</b></div>
        <div><small>Ventas este mes</small><b>{money(maria.monthlySalesBs)}</b></div>
        <div><small>Aporte del mes</small><b>{money(maria.contributionThisMonthBs)}</b></div>
        <div><small>Historial formal</small><b>{maria.monthsInProgram} meses</b></div>
      </div>
      <button type="button" className="outline-cta" onClick={() => go('contribution')}>Ver cómo se utiliza mi aporte <ArrowRight size={17} /></button>
      <strong className="section-label">Tus beneficios</strong>
      <div className="benefits-grid">
        <MobileCard icon={CreditCard} title="Crédito" text={`Hasta ${money(maria.creditPrequalifiedBs)}`} onClick={() => go('credit')} />
        <MobileCard icon={ShieldCheck} title="Protección" text="Seguro básico activo" onClick={() => go('protection')} />
        <MobileCard icon={GraduationCap} title="Capacitación" text="Programas disponibles" onClick={() => go('training')} />
        <MobileCard icon={BriefcaseBusiness} title="Oportunidades" text={`${maria.matchedOpportunityIds.length} disponibles`} onClick={() => go('opportunities')} />
      </div>
    </div>
  )
}

function Detail({ title, children, go }: { title: string; children: React.ReactNode; go: (screen: MobileScreen) => void }) {
  return <div className="mobile-screen"><Back onClick={() => go('home')} /><h2>{title}</h2>{children}</div>
}

function Contribution({ go }: { go: (screen: MobileScreen) => void }) {
  const contribution = maria.contributionThisMonthBs
  const benefit = maria.benefitEstimateBs.total
  const contributionWidth = `${(contribution / benefit) * 100}%`
  const benefitRows = [
    ['Mejores condiciones financieras', maria.benefitEstimateBs.financial],
    ['Protección', maria.benefitEstimateBs.protection],
    ['Capacitación', maria.benefitEstimateBs.training],
    ['Acceso a mercados', maria.benefitEstimateBs.marketAccess],
  ] as const

  return (
    <Detail title="Mi aporte" go={go}>
      <div className="highlight-box"><b>Este mes</b><span>Ventas registradas: {money(maria.monthlySalesBs)}</span></div>
      <div className="comparison-chart" aria-label={`Comparación: aporte ${money(contribution)}, valor estimado recibido ${money(benefit)}`}>
        <div className="comparison-item">
          <div className="comparison-label"><span>Aporte</span><b>{money(contribution)}</b></div>
          <div className="comparison-track"><span className="contribution-bar" style={{ width: contributionWidth }} /></div>
        </div>
        <div className="comparison-item">
          <div className="comparison-label"><span>Valor estimado recibido</span><b>{money(benefit)}</b></div>
          <div className="comparison-track"><span className="benefit-bar" /></div>
        </div>
      </div>
      <p className="comparison-note">Tu valor estimado recibido equivale a aproximadamente 1,9 veces tu aporte.</p>
      <h4>¿Qué incluye este valor estimado?</h4>
      {benefitRows.map(([label, value]) => <div className="benefit-row" key={label}><span>{label}</span><b>{money(value)}</b></div>)}
    </Detail>
  )
}

function Credit({ go, submitted, onSubmit }: { go: (screen: MobileScreen) => void; submitted: boolean; onSubmit: () => void }) {
  return (
    <Detail title="Crédito" go={go}>
      <h4>Tu perfil financiero</h4>
      <ul className="check-list">
        {['Identidad verificada', 'Actividad económica', '4 meses de historial', 'Aportes al día', 'Ventas registradas'].map((item) => <li key={item}><Check size={16} />{item}</li>)}
      </ul>
      <div className="credit-box">
        <small>Precalificación</small>
        <strong>Hasta {money(maria.creditPrequalifiedBs)}</strong>
        <span>Capital de trabajo · Maquinaria · Mejora del negocio</span>
      </div>
      {submitted ? (
        <div className="inline-success" role="status" aria-live="polite">
          <Check size={22} />
          <div><strong>Solicitud enviada</strong><span>Tu solicitud quedó registrada para evaluación.</span></div>
        </div>
      ) : (
        <Button onClick={onSubmit}>Solicitar evaluación</Button>
      )}
    </Detail>
  )
}

function Profile({ go, onPresent, identity }: { go: (screen: MobileScreen) => void; onPresent: () => void; identity: RegistrationValues }) {
  return (
    <Detail title="Mi perfil" go={go}>
      <WalletCard profile identity={identity} />
      <div className="profile-data">
        <div><span>Actividad</span><strong>{identity.activity}</strong></div>
        <div><span>Sector</span><strong>{maria.sector}</strong></div>
        <div><span>Ubicación</span><strong>{identity.municipality}, {identity.department}</strong></div>
        <div><span>Estado</span><strong className="active-profile">{maria.programStatus}</strong></div>
      </div>
      <button type="button" className="presenter-helper profile-presenter-helper" onClick={onPresent}>Vista institucional</button>
    </Detail>
  )
}

type MobileExperienceProps = {
  screen: MobileScreen
  onboardingCompleted: boolean
  creditSubmitted: boolean
  go: (screen: MobileScreen) => void
  onCompleteOnboarding: () => void
  onSubmitCredit: () => void
  onTab: (value: 'home' | 'profile' | 'settings') => void
  onPresent: () => void
  completion: CourseCompletion
  onToggleTopic: (courseId: string, index: number) => void
  interests: string[]
  onRegisterInterest: (id: string) => void
  identity: RegistrationValues
  onRegister: (values: RegistrationValues) => void
}

function MobileExperience({ screen, onboardingCompleted, creditSubmitted, go, onCompleteOnboarding, onSubmitCredit, onTab, onPresent, completion, onToggleTopic, interests, onRegisterInterest, identity, onRegister }: MobileExperienceProps) {
  let content: React.ReactNode

  if (screen === 'landing') content = <Landing go={go} />
  else if (screen === 'registration') content = <Registration onRegister={onRegister} />
  else if (screen === 'success') content = <Success go={go} />
  else if (screen === 'wallet') content = <Wallet onContinue={onCompleteOnboarding} identity={identity} />
  else if (screen === 'home') content = <HomeScreen go={go} identity={identity} />
  else if (screen === 'contribution') content = <Contribution go={go} />
  else if (screen === 'credit') content = <Credit go={go} submitted={creditSubmitted} onSubmit={onSubmitCredit} />
  else if (screen === 'protection') content = <Protection onBack={() => go('home')} />
  else if (screen === 'training') content = <Training onBack={() => go('home')} completion={completion} onToggleTopic={onToggleTopic} />
  else if (screen === 'opportunities') content = <Opportunities onBack={() => go('home')} interests={interests} onRegisterInterest={onRegisterInterest} />
  else if (screen === 'profile') content = <Profile go={go} onPresent={onPresent} identity={identity} />
  else content = <Detail title="Ajustes" go={go}><div className="settings-list"><div><Phone size={18} /> Teléfono <span>Registrado</span></div><div><SlidersHorizontal size={18} /> Notificaciones <span>Activas</span></div></div></Detail>

  const showNavigation = onboardingCompleted && !['landing', 'registration', 'success', 'wallet'].includes(screen)

  return (
    <PhoneFrame
      screen={screen}
      activeTab={screen === 'profile' ? 'profile' : screen === 'settings' ? 'settings' : 'home'}
      showNavigation={showNavigation}
      onTab={onTab}
    >
      {content}
    </PhoneFrame>
  )
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return <div className="kpi-card"><span>{label}</span><strong>{value}</strong></div>
}

function Filter({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return (
    <label className="filter">
      <span>{label}</span>
      <div>
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          <option>Todos</option>
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
        <ChevronDown size={14} />
      </div>
    </label>
  )
}

function Performance({ metricId, setMetricId, filters }: { metricId: string | null; setMetricId: (metricId: string) => void; filters: Filters }) {
  const metrics = useMemo(() => getPerformanceMetrics(filters), [filters])
  const selectedMetric = metrics.find((item) => item.id === metricId) ?? null
  const breakdown = selectedMetric ? getPerformanceBreakdown(selectedMetric.id, filters) : null
  const filtered = Object.values(filters).some((value) => value !== 'Todos')

  return (
    <div className="performance-layout">
      <section>
        <h1>Desempeño del programa</h1>
        <div className="performance-list">
          {metrics.map((metric) => (
            <button
              type="button"
              key={metric.id}
              className={metricId === metric.id ? 'selected' : ''}
              aria-pressed={metricId === metric.id}
              onClick={() => setMetricId(metric.id)}
            >
              <strong>{metric.label}</strong>
              <b>{metric.valuePct}%</b>
              <span className={`status ${metric.status}`}>{statusLabels[metric.status]}</span>
            </button>
          ))}
        </div>
      </section>
      <section className="performance-panel" aria-live="polite">
        {selectedMetric ? (
          <div className="metric-analysis">
            <div className="metric-heading">
              <div><span>{filtered ? 'Indicador del ámbito seleccionado' : 'Indicador nacional'}</span><h2>{selectedMetric.label}</h2></div>
              <div className="metric-value"><strong>{selectedMetric.valuePct}%</strong><span className={`status-pill ${selectedMetric.status}`}>{statusLabels[selectedMetric.status]}</span></div>
            </div>
            <p className="metric-definition">{selectedMetric.definition}</p>
            <div className="metric-context">
              <strong>Lectura ejecutiva</strong>
              <p>{number(selectedMetric.numerator)} de {number(selectedMetric.denominator)} participantes del ámbito seleccionado cumplen este indicador. El resultado está en estado {statusLabels[selectedMetric.status]} ({selectedMetric.thresholds[selectedMetric.status]}).</p>
              <p>{selectedMetric.status === 'red' ? 'La brecha requiere atención prioritaria. La comparación permite identificar los grupos con menor acceso.' : selectedMetric.status === 'yellow' ? 'El resultado muestra avances y espacio de mejora. Conviene reforzar el acompañamiento a los grupos con menor cobertura.' : 'El resultado cumple el umbral esperado. Conviene sostener el acompañamiento y revisar las diferencias entre grupos.'}</p>
            </div>
            {breakdown && (
              <div className="territorial-comparison">
                <h3>{breakdown.title}</h3>
                <p>{breakdown.rows.length > 5 ? 'Los cinco resultados con mayor brecha. ' : 'Resultados de menor a mayor. '}Se mantienen los demás filtros activos.</p>
                {breakdown.rows.slice(0, 5).map((row) => {
                  const status = row.status
                  return (
                    <div className="territory-bar-row" key={row.label}>
                      <div><strong>{row.label}</strong><span className={`status ${status}`}>{statusLabels[status]}</span><b>{row.valuePct}%</b></div>
                      <div className="territory-track"><span className={status} style={{ width: `${row.valuePct}%` }} /></div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="empty-performance">
            <BarChart3 size={36} />
            <h2>Explora el desempeño del programa</h2>
            <p>Selecciona un indicador para ver su valor, estado, contexto y distribución territorial disponible.</p>
          </div>
        )}
      </section>
    </div>
  )
}

type DashboardProps = {
  tab: DashboardTab
  setTab: (tab: DashboardTab) => void
  filters: Filters
  setFilters: React.Dispatch<React.SetStateAction<Filters>>
  metricId: string | null
  setMetricId: (metricId: string) => void
  onReturnToMobile: () => void
}

function Dashboard({ tab, setTab, filters, setFilters, metricId, setMetricId, onReturnToMobile }: DashboardProps) {
  const metrics = useMemo(() => getDashboardMetrics(filters), [filters])
  const hasFilters = Object.values(filters).some((value) => value !== 'Todos')
  const kpis = [
    ['Personas registradas', number(metrics.registered)],
    ['Contribuyentes activos', number(metrics.active)],
    ['Recaudación', money(metrics.revenueBs)],
    ['Capital movilizado', money(metrics.capitalMobilizedBs)],
    ['Créditos otorgados', number(metrics.creditsGranted)],
    ['Personas con protección', number(metrics.protected)],
  ] as const
  const breadcrumbs = [
    'Bolivia',
    filters.department !== 'Todos' ? filters.department : null,
    filters.sector !== 'Todos' ? filters.sector : null,
    filters.sex !== 'Todos' ? filters.sex : null,
    filters.ageGroup !== 'Todos' ? filters.ageGroup : null,
  ].filter(Boolean)
  const update = useCallback((key: keyof Filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }))
  }, [setFilters])
  const selectDepartment = useCallback((department: string) => update('department', department), [update])

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div><div className="dashboard-brand">ECONOMÍA PARA TODOS</div><div className="dashboard-subtitle">Centro Nacional de Gestión</div></div>
        <div className="dashboard-header-actions"><span>Datos de demostración</span><button type="button" onClick={onReturnToMobile}>Volver a la app móvil<ArrowRight size={14} /></button></div>
      </header>
      <div className="dashboard-tabs">
        <button type="button" className={tab === 'Resumen' ? 'active' : ''} onClick={() => setTab('Resumen')}>Resumen</button>
        <button type="button" className={tab === 'Desempeño' ? 'active' : ''} onClick={() => setTab('Desempeño')}>Desempeño</button>
      </div>
      <div className="breadcrumb" aria-label="Contexto de los filtros">{breadcrumbs.map((item, index) => <span key={item as string}>{index > 0 && <b>›</b>}{item}</span>)}</div>
      <div className="dashboard-filter-bar">
        <div className="filters">
          <Filter label="Departamento" value={filters.department} options={departments.map((department) => department.name)} onChange={(value) => update('department', value)} />
          <Filter label="Sector" value={filters.sector} options={sectors.map((sector) => sector.name)} onChange={(value) => update('sector', value)} />
          <Filter label="Sexo" value={filters.sex} options={sexes} onChange={(value) => update('sex', value)} />
          <Filter label="Edad" value={filters.ageGroup} options={ageGroups} onChange={(value) => update('ageGroup', value)} />
        </div>
        {hasFilters && <Button secondary className="reset-button" onClick={() => setFilters(initialFilters)}><RotateCcw size={16} />Restablecer filtros</Button>}
      </div>
      {tab === 'Resumen' ? (
        <>
          <div className="dashboard-layout">
            <section>
              <div className="kpi-grid">{kpis.map(([label, value]) => <KpiCard label={label} value={value} key={label} />)}</div>
            </section>
            <BoliviaMap selected={filters.department} onSelect={selectDepartment} filters={filters} />
          </div>
        </>
      ) : (
        <Performance metricId={metricId} setMetricId={setMetricId} filters={filters} />
      )}
    </main>
  )
}

export default function Home() {
  const [screen, setScreen] = useState<MobileScreen>('landing')
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)
  const [creditSubmitted, setCreditSubmitted] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [transition, setTransition] = useState(false)
  const [transitionStage, setTransitionStage] = useState(0)
  const [tab, setTab] = useState<DashboardTab>('Resumen')
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [metricId, setMetricId] = useState<string | null>(null)
  const [completion, setCompletion] = useState<CourseCompletion>(createInitialCourseCompletion)
  const [interests, setInterests] = useState<string[]>([])
  const [identity, setIdentity] = useState<RegistrationValues>(demoRegistration)
  const transitionTimers = useRef<number[]>([])
  useEffect(() => { window.scrollTo({ top: 0 }) }, [showDashboard])

  const clearTransitionTimers = useCallback(() => {
    transitionTimers.current.forEach((timer) => window.clearTimeout(timer))
    transitionTimers.current = []
  }, [])

  const present = useCallback(() => {
    clearTransitionTimers()
    setTransition(true)
    setTransitionStage(1)
    setTab('Resumen')
    transitionTimers.current = [
      window.setTimeout(() => setTransitionStage(2), 1800),
      window.setTimeout(() => {
        setShowDashboard(true)
        setTransition(false)
        setTransitionStage(0)
      }, 6000),
    ]
  }, [clearTransitionTimers])

  const returnToMobile = useCallback(() => {
    clearTransitionTimers()
    setTransition(false)
    setTransitionStage(0)
    setShowDashboard(false)
    setOnboardingCompleted(true)
    setScreen('home')
  }, [clearTransitionTimers])

  const reset = useCallback(() => {
    clearTransitionTimers()
    setShowDashboard(false)
    setTransition(false)
    setTransitionStage(0)
    setScreen('landing')
    setOnboardingCompleted(false)
    setCreditSubmitted(false)
    setTab('Resumen')
    setFilters(initialFilters)
    setMetricId(null)
    setCompletion(createInitialCourseCompletion())
    setInterests([])
    setIdentity(demoRegistration)
  }, [clearTransitionTimers])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey || !event.shiftKey) return
      const key = event.key.toLowerCase()
      if (key === 'r') {
        event.preventDefault()
        reset()
      } else if (key === 'n') {
        event.preventDefault()
        present()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      clearTransitionTimers()
    }
  }, [clearTransitionTimers, present, reset])

  const completeOnboarding = () => {
    setOnboardingCompleted(true)
    setScreen('home')
  }

  return (
    <div className={showDashboard ? 'app-root dashboard-root' : 'app-root'}>
      {showDashboard ? (
        <Dashboard
          tab={tab}
          setTab={setTab}
          filters={filters}
          setFilters={setFilters}
          metricId={metricId}
          setMetricId={setMetricId}
          onReturnToMobile={returnToMobile}
        />
      ) : (
        <div className="mobile-stage">
          <MobileExperience
            screen={screen}
            onboardingCompleted={onboardingCompleted}
            creditSubmitted={creditSubmitted}
            go={setScreen}
            onCompleteOnboarding={completeOnboarding}
            onSubmitCredit={() => setCreditSubmitted(true)}
            identity={identity}
            onRegister={(values) => {
              setIdentity(values)
              setScreen('success')
            }}
            onPresent={present}
            completion={completion}
            onToggleTopic={(courseId, index) => setCompletion((current) => {
              const done = current[courseId] ?? []
              return { ...current, [courseId]: done.includes(index) ? done.filter((item) => item !== index) : [...done, index] }
            })}
            interests={interests}
            onRegisterInterest={(id) => setInterests((current) => current.includes(id) ? current : [...current, id])}
            onTab={(destination) => {
              if (onboardingCompleted) setScreen(destination)
            }}
          />
        </div>
      )}
      {transition && (
        <div className="transition-overlay">
          <div key={transitionStage} className={`transition-message transition-stage-${transitionStage}`}>{transitionStage === 1 ? 'Esa fue solo María…' : '¿Qué sucede cuando son 200.000 Marías?'}</div>
        </div>
      )}
    </div>
  )
}
