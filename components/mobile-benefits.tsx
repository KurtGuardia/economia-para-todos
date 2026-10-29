'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, BriefcaseBusiness, Check, HandCoins, ShieldCheck } from 'lucide-react'
import { trainings } from '@/lib/mock-data'
import {
  courseTopics, formatOpportunityDate, getCourseProgress, mariaOpportunities,
  protectionDetails, type CourseCompletion,
} from '@/lib/mobile-details'

const money = (value: number) => `Bs ${new Intl.NumberFormat('es-BO').format(value)}`

function BenefitScreen({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) {
  const screenRef = useRef<HTMLDivElement>(null)
  useEffect(() => { screenRef.current?.closest('.phone-content')?.scrollTo({ top: 0 }) }, [title])
  return (
    <div ref={screenRef} className="mobile-screen">
      <button type="button" className="back-button" onClick={onBack}><ArrowLeft size={18} />Volver</button>
      <h2>{title}</h2>
      {children}
    </div>
  )
}

function Confirmation({ title, text }: { title: string; text: string }) {
  return <div className="inline-success" role="status"><Check size={22} /><div><strong>{title}</strong><span>{text}</span></div></div>
}

export function Protection({ onBack }: { onBack: () => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [requests, setRequests] = useState<string[]>([])
  const selected = protectionDetails.find((item) => item.id === selectedId)

  if (selected) return (
    <BenefitScreen title={selected.title} onBack={() => setSelectedId(null)}>
      <span className="benefit-status"><Check size={16} />Estado: {selected.status}</span>
      <p>{selected.description}</p>
      <ul className="benefit-list">{selected.features.map((item) => <li key={item}>{item}</li>)}</ul>
      <p className="detail-note">{selected.note}</p>
      {requests.includes(selected.id)
        ? <Confirmation title={selected.confirmation} text="Tu solicitud quedó registrada. Un asesor podrá orientarte sobre los siguientes pasos." />
        : <button type="button" className="demo-button" onClick={() => setRequests((current) => [...current, selected.id])}>{selected.action}</button>}
    </BenefitScreen>
  )

  return (
    <BenefitScreen title="Protección" onBack={onBack}>
      {protectionDetails.map((item, index) => {
        const Icon = index === 0 ? ShieldCheck : HandCoins
        return <button type="button" className="mobile-card detail-card" key={item.id} onClick={() => setSelectedId(item.id)}>
          <div className="mobile-card-heading"><Icon size={20} /><strong>{item.title}</strong></div>
          <span className="benefit-status">Estado: {item.status}</span>
          <span>{item.summary}</span>
          <span className="card-link">Ver detalle<ArrowRight size={15} /></span>
        </button>
      })}
    </BenefitScreen>
  )
}

export function Training({ onBack, completion, onToggleTopic }: {
  onBack: () => void
  completion: CourseCompletion
  onToggleTopic: (courseId: string, topicIndex: number) => void
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = trainings.find((course) => course.id === selectedId)

  if (selected) {
    const topics = courseTopics[selected.id]
    const completed = completion[selected.id] ?? []
    const progress = getCourseProgress(selected.id, completion)
    return (
      <BenefitScreen title={selected.title} onBack={() => setSelectedId(null)}>
        <p className="screen-subtitle">{selected.format} · {selected.duration}</p>
        <p>{selected.description}</p>
        <div className="course-meta"><span>{completed.length} de {topics.length} temas completados</span><strong>{progress}%</strong></div>
        <div className="course-progress" role="progressbar" aria-label="Avance del curso" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress}%` }} /></div>
        <h4>Temario</h4>
        <p className="detail-note">Marca cada tema cuando lo hayas completado.</p>
        <div className="topic-checklist">
          {topics.map((topic, index) => <label key={topic} className={completed.includes(index) ? 'is-complete' : ''}>
            <input type="checkbox" checked={completed.includes(index)} onChange={() => onToggleTopic(selected.id, index)} />
            <span>{topic}</span>
          </label>)}
        </div>
        {progress === 100 && <Confirmation title="Curso completado" text="Terminaste todos los temas de este curso." />}
      </BenefitScreen>
    )
  }

  return (
    <BenefitScreen title="Capacitación" onBack={onBack}>
      <div className="training-list">
        {trainings.map((course) => {
          const progress = getCourseProgress(course.id, completion)
          const completed = progress === 100
          return <article className="training-card" key={course.id}>
            <div className="mobile-card-heading"><BookOpen size={20} /><strong>{course.title}</strong></div>
            <p>{course.description}</p>
            <div className="course-meta"><span>{course.duration}</span><span>{progress}%</span></div>
            <div className="course-progress" role="progressbar" aria-label={`Avance: ${course.title}`} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress}%` }} /></div>
            <button type="button" className={completed ? 'completed' : ''} onClick={() => setSelectedId(course.id)}>
              {completed && <Check size={15} />}{completed ? 'Completado' : progress === 0 ? 'Empezar' : 'Continuar'}
            </button>
          </article>
        })}
      </div>
    </BenefitScreen>
  )
}

export function Opportunities({ onBack, interests, onRegisterInterest }: {
  onBack: () => void
  interests: string[]
  onRegisterInterest: (id: string) => void
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = mariaOpportunities.find((item) => item.id === selectedId)

  if (selected) return (
    <BenefitScreen title={selected.title} onBack={() => setSelectedId(null)}>
      <p className="screen-subtitle">{selected.buyerDisplay}</p>
      <p>{selected.description}</p>
      <dl className="opportunity-facts">
        <div><dt>Categoría</dt><dd>{selected.category}</dd></div>
        <div><dt>Ubicación</dt><dd>{selected.municipality}, {selected.department}</dd></div>
        {selected.estimatedValueBs !== null && <div><dt>Monto estimado</dt><dd>{money(selected.estimatedValueBs)}</dd></div>}
        {selected.deadline && <div><dt>Fecha límite</dt><dd>{formatOpportunityDate(selected.deadline)}</dd></div>}
      </dl>
      <p className="detail-note">Convocatoria de demostración · calendario del programa 2026.</p>
      <h4>Requisitos</h4>
      <ul className="benefit-list">{selected.eligibility.map((item) => <li key={item}>{item}</li>)}</ul>
      <span className="benefit-status"><Check size={16} />Tu perfil es compatible</span>
      <p className="detail-note">La participación está sujeta a la revisión de los requisitos por la entidad.</p>
      {interests.includes(selected.id)
        ? <Confirmation title={selected.action === 'Aplicar' ? 'Solicitud enviada' : 'Interés registrado'} text="Tu interés quedó registrado para esta oportunidad." />
        : <button type="button" className="demo-button" onClick={() => onRegisterInterest(selected.id)}>{selected.action}</button>}
    </BenefitScreen>
  )

  return (
    <BenefitScreen title="Oportunidades para ti" onBack={onBack}>
      {mariaOpportunities.map((item) => <button type="button" key={item.id} className="mobile-card detail-card" onClick={() => setSelectedId(item.id)}>
        <div className="mobile-card-heading"><BriefcaseBusiness size={20} /><strong>{item.title}</strong></div>
        <span>{item.buyerDisplay}</span>
        <span>{item.category} · {item.estimatedValueBs === null ? 'Convocatoria abierta' : money(item.estimatedValueBs)}</span>
        <span className="card-link">Ver oportunidad<ArrowRight size={15} /></span>
      </button>)}
    </BenefitScreen>
  )
}
