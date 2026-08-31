import { useEffect, useState } from 'react'
import { api } from '../api/client.js'
import RiskStamp from '../components/RiskStamp.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { species as speciesLabels, symptoms as symptomLabels, riskLevels, caseStatuses, diseases as diseaseLabels } from '../i18n/translations.js'

export default function CaseLedger() {
  const { t, lang } = useLanguage()
  const speciesDict = speciesLabels[lang] || speciesLabels.en
  const symptomDict = symptomLabels[lang] || symptomLabels.en
  const riskDict = riskLevels[lang] || riskLevels.en
  const statusDict = caseStatuses[lang] || caseStatuses.en
  const diseaseDict = diseaseLabels[lang] || diseaseLabels.en

  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [levelFilter, setLevelFilter] = useState('ALL')

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.listCases()
      setCases(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const visible = cases.filter((c) => levelFilter === 'ALL' || c.riskLevel === levelFilter)

  return (
    <section className="panel">
      <h2>{t.ledger.heading}</h2>
      <p className="hint">{t.ledger.hint}</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
          <button
            key={lvl}
            className="btn-secondary"
            style={levelFilter === lvl ? { borderColor: 'var(--green)', color: 'var(--green-deep)' } : undefined}
            onClick={() => setLevelFilter(lvl)}
          >
            {lvl === 'ALL' ? t.ledger.all || 'All' : riskDict[lvl]}
          </button>
        ))}
      </div>

      {loading && <p className="status-msg">{t.ledger.loading}</p>}
      {error && (
        <p className="status-msg error">
          Couldn't reach the register: {error}. Is the backend running on port 8080?
        </p>
      )}

      {!loading && !error && visible.length === 0 && (
        <div className="empty-state">{t.ledger.empty}</div>
      )}

      <div className="ledger">
        {visible.map((c, idx) => (
          <div key={c.id}>
            <div className="ledger-row" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
              <div className="ledger-index">#{String(cases.length - idx).padStart(3, '0')}</div>
              <div className="ledger-main">
                <div className="animal">{speciesDict[c.animal?.species] || c.animal?.species} &middot; {c.animal?.ownerName}</div>
                <div className="meta">{new Date(c.reportedAt).toLocaleString()}</div>
              </div>
              <div className="ledger-village">{c.village}</div>
              <div className="ledger-status">{statusDict[c.status] || c.status}</div>
              <RiskStamp level={c.riskLevel} />
            </div>

            {expandedId === c.id && (
              <div className="detail" style={{ padding: '4px 4px 20px 20px' }}>
                <dl>
                  <dt>{t.ledger.score}</dt>
                  <dd>{c.riskScore?.toFixed(2)}</dd>
                  <dt>{t.ledger.recommendation}</dt>
                  <dd>{c.recommendation}</dd>
                  <dt>{t.ledger.why}</dt>
                  <dd>{c.explanation}</dd>
                  <dt>{t.ledger.symptoms}</dt>
                  <dd>{c.symptoms?.map((k) => symptomDict[k] || k).join(', ')}</dd>
                  <dt>{t.ledger.assignedVet}</dt>
                  <dd>
                    {c.assignedVet
                      ? c.assignedVet.name
                      : c.suggestedVetName
                        ? <>{t.ledger.suggestedVet}: {c.suggestedVetName} ({c.suggestedVetAddress}){c.suggestedVetMapsUrl && <> — <a href={c.suggestedVetMapsUrl} target="_blank" rel="noreferrer">Maps</a></>}</>
                        : t.ledger.notAssigned}
                  </dd>
                </dl>
                {c.possibleDiseasesJson && JSON.parse(c.possibleDiseasesJson).length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', marginBottom: 8 }}>
                      {t.ledger.possibleDiseases}
                    </div>
                    <div className="disease-list">
                      {JSON.parse(c.possibleDiseasesJson).map((d, i) => {
                        const translated = diseaseDict[d.key]
                        return (
                          <div key={i} className="disease-row">
                            <div className="disease-info">
                              <div className="disease-name">{translated ? translated.name : d.name} <span className="disease-percent">{d.matchPercent}%</span></div>
                            </div>
                            <div className="disease-bar-track">
                              <div className="disease-bar-fill" style={{ width: `${d.matchPercent}%` }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                {c.photoAnalysisJson && (() => {
                  let photo
                  try { photo = JSON.parse(c.photoAnalysisJson) } catch { return null }
                  if (!photo || photo.imageUsable === false) return null
                  return (
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', marginBottom: 8 }}>
                        {t.report.possibleConditionsFromPhoto}
                      </div>
                      {photo.visibleSigns?.length > 0 && (
                        <ul className="photo-analysis-list" style={{ marginBottom: 8 }}>
                          {photo.visibleSigns.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      )}
                      {photo.possibleConditions?.length > 0 && (
                        <div className="disease-list">
                          {photo.possibleConditions.map((cond, i) => (
                            <div key={i} className="disease-row">
                              <div className="disease-info">
                                <div className="disease-name">
                                  {cond.name} <span className={`likelihood-tag likelihood-${cond.likelihood}`}>{cond.likelihood}</span>
                                </div>
                                <div className="disease-note">{cond.description}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
