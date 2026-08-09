import React, { useState } from 'react'
import { useParams } from 'react-router'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview';



// ─── Section Keys ─────────────────────────────────────────────────────────────
const SECTIONS = {
  TECHNICAL: 'technical',
  BEHAVIORAL: 'behavioral',
  ROADMAP: 'roadmap',
}

// ─── Severity badge color helper ──────────────────────────────────────────────
const severityClass = (s) => {
  if (s === 'high') return 'severity-high'
  if (s === 'low') return 'severity-low'
  return 'severity-medium'
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconCode = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
)
const IconChat = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)
const IconMap = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6" />
    <line x1="9" y1="3" x2="9" y2="18" />
    <line x1="15" y1="6" x2="15" y2="21" />
  </svg>
)
const IconChevron = ({ open }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
)
const IconTarget = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)
const IconLightbulb = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M9 21h6" />
    <path d="M12 3a7 7 0 0 1 4 12.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-1.26A7 7 0 0 1 12 3z" />
  </svg>
)
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

// ─── Accordion Q&A Card ────────────────────────────────────────────────────────
const QuestionCard = ({ item, index }) => {
  const [open, setOpen] = useState(false)

  return (
    <div className={`qa-card ${open ? 'qa-card--open' : ''}`}>
      <button className="qa-card__header" onClick={() => setOpen((v) => !v)}>
        <span className="qa-card__index">Q{index + 1}</span>
        <p className="qa-card__question">{item.question}</p>
        <span className="qa-card__chevron">
          <IconChevron open={open} />
        </span>
      </button>

      {open && (
        <div className="qa-card__body">
          <div className="qa-card__intention">
            <span className="qa-card__label">
              <IconTarget /> Intention
            </span>
            <p>{item.intention}</p>
          </div>
          <div className="qa-card__answer">
            <span className="qa-card__label">
              <IconLightbulb /> Model Answer
            </span>
            <p>{item.answer}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Score Ring ────────────────────────────────────────────────────────────────
const ScoreRing = ({ score }) => {
  const r = 36
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 80 ? '#a78bfa' : score >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div className="score-ring">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="7" fill="none" />
        <circle
          cx="48"
          cy="48"
          r={r}
          stroke={color}
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 48 48)"
          style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="score-ring__value">
        <span style={{ color }}>{score}</span>
        <small>/ 100</small>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
const Interview = () => {
  const [activeSection, setActiveSection] = useState(SECTIONS.TECHNICAL)
  const { report, loading } = useInterview()

  if (loading || !report) {
    return (
      <main className='loading-screen'>
        <h1>Loading your interview plan...</h1>
      </main>
    )
  }

  const navItems = [
    { key: SECTIONS.TECHNICAL, label: 'Technical Questions', icon: <IconCode /> },
    { key: SECTIONS.BEHAVIORAL, label: 'Behavioral Questions', icon: <IconChat /> },
    { key: SECTIONS.ROADMAP, label: 'Road Map', icon: <IconMap /> },
  ]

  const renderMain = () => {
    switch (activeSection) {
      case SECTIONS.TECHNICAL:
        return (
          <div className="main-section" key="technical">
            <div className="main-section__title">
              <span className="main-section__icon"><IconCode /></span>
              <h2>Technical Questions</h2>
              <span className="main-section__count">{report.technicalQuestions.length}</span>
            </div>
            <p className="main-section__subtitle">
              Role-specific technical problems designed to evaluate your depth of knowledge.
            </p>
            <div className="qa-list">
              {report.technicalQuestions.map((q, i) => (
                <QuestionCard key={i} item={q} index={i} />
              ))}
            </div>
          </div>
        )

      case SECTIONS.BEHAVIORAL:
        return (
          <div className="main-section" key="behavioral">
            <div className="main-section__title">
              <span className="main-section__icon"><IconChat /></span>
              <h2>Behavioral Questions</h2>
              <span className="main-section__count">{report.behavioralQuestions.length}</span>
            </div>
            <p className="main-section__subtitle">
              Situational questions that assess your soft skills and professional approach.
            </p>
            <div className="qa-list">
              {report.behavioralQuestions.map((q, i) => (
                <QuestionCard key={i} item={q} index={i} />
              ))}
            </div>
          </div>
        )

      case SECTIONS.ROADMAP:
        return (
          <div className="main-section" key="roadmap">
            <div className="main-section__title">
              <span className="main-section__icon"><IconMap /></span>
              <h2>Preparation Road Map</h2>
              <span className="main-section__count">{report.preparationPlan.length} Days</span>
            </div>
            <p className="main-section__subtitle">
              A structured day-by-day plan to bridge your skill gaps before the interview.
            </p>
            <div className="roadmap-timeline">
              {report.preparationPlan.map((item, i) => (
                <div key={i} className="roadmap-day-card">
                  <div className="roadmap-day-card__badge">
                    <span>Day {item.day}</span>
                  </div>
                  <div className="roadmap-day-card__body">
                    <p className="roadmap-day-card__focus">{item.focus}</p>
                    {item.tasks && item.tasks.length > 0 ? (
                      <ul className="roadmap-day-card__tasks">
                        {item.tasks.map((t, ti) => <li key={ti}>{t}</li>)}
                      </ul>
                    ) : (
                      <p className="roadmap-day-card__empty">Tasks will be added soon.</p>
                    )}
                  </div>
                  {i < report.preparationPlan.length - 1 && <div className="roadmap-connector" />}
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="interview-theme-wrapper">
      <div className="interview">
        {/* Ambient orbs */}
        <div className="interview__orb interview__orb--top" />
        <div className="interview__orb interview__orb--bottom" />

        <div className="interview__layout">

          {/* ── Left Sidebar ───────────────────────────────────── */}
          <aside className="interview__sidebar">
            <div className="sidebar-score-card">
              <p className="sidebar-score-card__label">Match Score</p>
              <ScoreRing score={report.matchScore} />
              <p className="sidebar-score-card__desc">
                {report.matchScore >= 80
                  ? 'Strong match — well prepared!'
                  : 'Good potential. Address the gaps.'}
              </p>
            </div>

            <nav className="sidebar-nav">
              {navItems.map(({ key, label, icon }) => (
                <button
                  key={key}
                  id={`nav-${key}`}
                  className={`sidebar-nav__item ${activeSection === key ? 'sidebar-nav__item--active' : ''}`}
                  onClick={() => setActiveSection(key)}
                >
                  <span className="sidebar-nav__icon">{icon}</span>
                  <span className="sidebar-nav__label">{label}</span>
                  {activeSection === key && <span className="sidebar-nav__active-bar" />}
                </button>
              ))}
            </nav>
          </aside>

          {/* ── Main Content ────────────────────────────────────── */}
          <main className="interview__main">
            {renderMain()}
          </main>

          {/* ── Right Sidebar ───────────────────────────────────── */}
          <aside className="interview__right-sidebar">

            {/* Skill Gaps */}
            <div className="right-panel-card">
              <div className="right-panel-card__header">
                <h3>Skill Gaps</h3>
                <span className="right-panel-card__badge">{report.skillGaps.length}</span>
              </div>
              <div className="skill-gap-tags">
                {report.skillGaps.map((gap, i) => (
                  <span key={i} className={`skill-tag ${severityClass(gap.severity)}`}>
                    {gap.skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Preparation Plan */}
            <div className="right-panel-card">
              <div className="right-panel-card__header">
                <h3>Prep Timeline</h3>
                <span className="right-panel-card__badge">{report.preparationPlan.length}d</span>
              </div>
              <div className="prep-plan-list">
                {report.preparationPlan.map((item, i) => (
                  <div key={i} className="prep-plan-item">
                    <div className="prep-plan-item__day">Day {item.day}</div>
                    <div className="prep-plan-item__focus">{item.focus}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Generated timestamp */}
            <div className="right-meta">
              <span className="right-meta__icon"><IconCalendar /></span>
              <span>
                Generated{' '}
                {new Date(report.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </aside>

        </div>
      </div>
    </div>
  )
}

export default Interview