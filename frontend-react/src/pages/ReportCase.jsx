import { useState } from 'react'
import { Phone, Navigation } from 'lucide-react'
import { api } from '../api/client.js'
import RiskStamp from '../components/RiskStamp.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { species as speciesLabels, symptoms as symptomLabels, diseases as diseaseLabels } from '../i18n/translations.js'
import { SPECIES_SYMPTOMS } from '../utils/speciesSymptoms.js'

const SPECIES = ['cattle', 'buffalo', 'goat', 'sheep', 'poultry', 'pig']

const emptyForm = {
  species: 'cattle',
  breed: '',
  ageMonths: '',
  ownerName: '',
  ownerPhone: '',
  village: '',
  vaccinated: false,
  daysSinceOnset: '0',
  photoUrl: '',
}

export default function ReportCase() {
  const { t, lang } = useLanguage()
  const speciesDict = speciesLabels[lang] || speciesLabels.en
  const symptomDict = symptomLabels[lang] || symptomLabels.en
  const diseaseDict = diseaseLabels[lang] || diseaseLabels.en
  const [form, setForm] = useState(emptyForm)
  const symptomKeysForSpecies = SPECIES_SYMPTOMS[form.species] || SPECIES_SYMPTOMS.cattle
  const [symptoms, setSymptoms] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [locating, setLocating] = useState(false)
  const [coords, setCoords] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoBase64, setPhotoBase64] = useState(null)
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false)
  const [photoAnalysis, setPhotoAnalysis] = useState(null)
  const [photoError, setPhotoError] = useState(null)

  const toggleSymptom = (key) => {
    setSymptoms((prev) => (prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]))
  }

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoAnalysis(null)
    setPhotoError(null)
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      setPhotoPreview(dataUrl)
      setPhotoBase64(dataUrl.split(',')[1])
    }
    reader.readAsDataURL(file)
  }

  const retakePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    setPhotoBase64(null)
    setPhotoAnalysis(null)
    setPhotoError(null)
  }

  const analyzePhoto = async () => {
    if (!photoBase64 || !photoFile) return
    setAnalyzingPhoto(true)
    setPhotoError(null)
    try {
      const res = await api.analyzePhoto({
        imageBase64: photoBase64,
        mediaType: photoFile.type || 'image/jpeg',
        species: form.species,
      })
      if (!res.configured) {
        setPhotoError(t.report.photoNotConfigured)
        return
      }
      if (res.imageUsable === false) {
        setPhotoAnalysis(null)
        setPhotoError(res.retakeMessage || t.report.retakePhoto)
      } else {
        setPhotoAnalysis(res)
      }
    } catch (err) {
      setPhotoError(err.message)
    } finally {
      setAnalyzingPhoto(false)
    }
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('This browser cannot share location. Enter the village name instead.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
        setLocating(false)
      },
      () => {
        setError('Could not read your location. Enter the village name instead.')
        setLocating(false)
      }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setResult(null)

    if (symptoms.length === 0) {
      setError('Select at least one symptom before submitting.')
      return
    }
    if (!form.ownerName.trim() || !form.village.trim()) {
      setError('Owner name and village are required.')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        species: form.species,
        breed: form.breed || null,
        ageMonths: form.ageMonths ? Number(form.ageMonths) : null,
        ownerName: form.ownerName,
        ownerPhone: form.ownerPhone || null,
        village: form.village,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
        vaccinated: form.vaccinated,
        daysSinceOnset: Number(form.daysSinceOnset || 0),
        photoUrl: form.photoUrl || null,
        photoAnalysisJson: photoAnalysis ? JSON.stringify(photoAnalysis) : null,
        symptoms,
      }
      const created = await api.reportCase(payload)
      setResult(created)
      setForm(emptyForm)
      setSymptoms([])
      setCoords(null)
      retakePhoto()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <section className="panel">
        <h2>{t.report.heading}</h2>
        <p className="hint">{t.report.hint}</p>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div>
              <label htmlFor="species">{t.report.species}</label>
              <select
                id="species"
                value={form.species}
                onChange={(e) => {
                  const nextSpecies = e.target.value
                  setForm({ ...form, species: nextSpecies })
                  const allowed = SPECIES_SYMPTOMS[nextSpecies] || []
                  setSymptoms((prev) => prev.filter((s) => allowed.includes(s)))
                }}
              >
                {SPECIES.map((s) => <option key={s} value={s}>{speciesDict[s]}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="breed">{t.report.breed}</label>
              <input id="breed" type="text" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} />
            </div>

            <div>
              <label htmlFor="age">{t.report.age}</label>
              <input id="age" type="number" min="0" value={form.ageMonths} onChange={(e) => setForm({ ...form, ageMonths: e.target.value })} />
            </div>
            <div>
              <label htmlFor="onset">{t.report.onset}</label>
              <input id="onset" type="number" min="0" value={form.daysSinceOnset} onChange={(e) => setForm({ ...form, daysSinceOnset: e.target.value })} />
            </div>

            <div>
              <label htmlFor="owner">{t.report.owner}</label>
              <input id="owner" type="text" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} required />
            </div>
            <div>
              <label htmlFor="phone">{t.report.phone}</label>
              <input id="phone" type="tel" value={form.ownerPhone} onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })} />
            </div>

            <div>
              <label htmlFor="village">{t.report.village}</label>
              <input id="village" type="text" value={form.village} onChange={(e) => setForm({ ...form, village: e.target.value })} required />
            </div>
            <div>
              <label>{t.report.location}</label>
              <button type="button" className="btn-secondary" onClick={useMyLocation} disabled={locating}>
                <Navigation size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
                {locating ? t.report.locating : coords ? t.report.locationCaptured : t.report.useLocation}
              </button>
            </div>

            <div className="full">
              <label>
                <input
                  type="checkbox"
                  checked={form.vaccinated}
                  onChange={(e) => setForm({ ...form, vaccinated: e.target.checked })}
                  style={{ width: 'auto', marginRight: 8 }}
                />
                {t.report.vaccinated}
              </label>
            </div>

            <div className="full">
              <label>{t.report.symptomsLabel}</label>
              <div className="symptom-grid">
                {symptomKeysForSpecies.map((key) => (
                  <label key={key} className={`symptom-chip ${symptoms.includes(key) ? 'checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={symptoms.includes(key)}
                      onChange={() => toggleSymptom(key)}
                      style={{ width: 'auto' }}
                    />
                    {symptomDict[key]}
                  </label>
                ))}
              </div>
            </div>

            {(
              <div className="full">
                <label>{t.report.photoLabel}</label>
                <div className="photo-upload">
                  {photoPreview && <img src={photoPreview} alt="Selected animal" className="photo-preview" />}
                  <div className="photo-actions">
                    <label className="btn-secondary" style={{ cursor: 'pointer' }}>
                      {photoPreview ? t.report.changePhoto : t.report.choosePhoto}
                      <input type="file" accept="image/*" onChange={handlePhotoSelect} style={{ display: 'none' }} />
                    </label>
                    {photoFile && (
                      <button type="button" className="btn-secondary" onClick={analyzePhoto} disabled={analyzingPhoto}>
                        {analyzingPhoto ? t.report.analyzingPhoto : t.report.analyzePhoto}
                      </button>
                    )}
                  </div>
                </div>

                {photoError && (
                  <div className="photo-retake-notice">{photoError}</div>
                )}

                {photoAnalysis && (
                  <div className="photo-analysis-panel">
                    {photoAnalysis.visibleSigns?.length > 0 && (
                      <>
                        <div className="photo-analysis-heading">{t.report.visibleSigns}</div>
                        <ul className="photo-analysis-list">
                          {photoAnalysis.visibleSigns.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </>
                    )}
                    {photoAnalysis.possibleConditions?.length > 0 && (
                      <>
                        <div className="photo-analysis-heading">{t.report.possibleConditionsFromPhoto}</div>
                        <div className="disease-list">
                          {photoAnalysis.possibleConditions.map((c, i) => (
                            <div key={i} className="disease-row">
                              <div className="disease-info">
                                <div className="disease-name">{c.name} <span className={`likelihood-tag likelihood-${c.likelihood}`}>{c.likelihood}</span></div>
                                <div className="disease-note">{c.description}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    {photoAnalysis.firstAid?.length > 0 && (
                      <>
                        <div className="photo-analysis-heading">{t.report.firstAid}</div>
                        <ul className="photo-analysis-list">
                          {photoAnalysis.firstAid.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </>
                    )}
                    <p className="hint" style={{ marginTop: 8, marginBottom: 0 }}>{photoAnalysis.disclaimer || t.report.photoDisclaimer}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && <p className="status-msg error">{error}</p>}

          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? t.report.submitting : t.report.submit}
          </button>
        </form>
      </section>

      {result && (
        <section className="panel">
          <h2>{t.report.resultHeading}</h2>
          <div className="detail" style={{ marginTop: 12 }}>
            <p style={{ marginBottom: 12 }}>
              <RiskStamp level={result.riskLevel} /> &nbsp; {t.ledger.score} {result.riskScore.toFixed(2)}
            </p>
            <dl>
              <dt>{t.report.recommendation}</dt>
              <dd>{result.recommendation}</dd>
              <dt>{t.report.why}</dt>
              <dd>{result.explanation}</dd>
              {result.flaggedSymptoms?.length > 0 && (
                <>
                  <dt>{t.report.flagged}</dt>
                  <dd>{result.flaggedSymptoms.map((k) => symptomDict[k] || k).join(', ')}</dd>
                </>
              )}
              <dt>{t.report.villageLabel}</dt>
              <dd>{result.village}</dd>
            </dl>
          </div>

          {result.possibleDiseasesJson && JSON.parse(result.possibleDiseasesJson).length > 0 && (
            <div style={{ marginTop: 18 }}>
              <h2 style={{ fontSize: 16, marginBottom: 6 }}>{t.report.possibleDiseasesHeading}</h2>
              <p className="hint" style={{ marginBottom: 12 }}>{t.report.diseaseDisclaimer}</p>
              <div className="disease-list">
                {JSON.parse(result.possibleDiseasesJson).map((d, i) => {
                  const translated = diseaseDict[d.key]
                  return (
                    <div key={i} className="disease-row">
                      <div className="disease-info">
                        <div className="disease-name">{translated ? translated.name : d.name} <span className="disease-percent">{d.matchPercent}%</span></div>
                        <div className="disease-note">{translated ? translated.note : d.note}</div>
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
        </section>
      )}

      <div className="helpline-banner">
        <div>
          <div className="title">{t.report.helplineTitle}</div>
          <div className="text">{t.report.helplineText}</div>
        </div>
        <a className="helpline-call-btn" href="tel:1962">
          <Phone size={15} />
          {t.report.helplineCall}
        </a>
      </div>
    </>
  )
}
