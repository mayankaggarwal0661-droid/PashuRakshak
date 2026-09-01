import { useState } from 'react'
import { Syringe, AlertCircle } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { species as speciesLabels } from '../i18n/translations.js'

const SPECIES = ['cattle', 'buffalo', 'goat', 'sheep', 'poultry', 'pig']

const VACCINE_SCHEDULE = {
  cattle: [
    { age: '4 Months', name: 'Foot and Mouth Disease (FMD)', booster: 'Every 6 months', notes: 'First dose at 4 months or above' },
    { age: '6 Months', name: 'Haemorrhagic Septicaemia (HS)', booster: 'Annually before monsoon', notes: 'Critical in endemic areas' },
    { age: '6 Months', name: 'Black Quarter (BQ)', booster: 'Annually before monsoon', notes: 'Usually given along with HS' },
    { age: '4 to 8 Months', name: 'Brucellosis', booster: 'Once in a lifetime', notes: 'Given to female calves only' },
  ],
  buffalo: [
    { age: '4 Months', name: 'Foot and Mouth Disease (FMD)', booster: 'Every 6 months', notes: 'First dose at 4 months or above' },
    { age: '6 Months', name: 'Haemorrhagic Septicaemia (HS)', booster: 'Annually before monsoon', notes: 'Buffaloes are highly susceptible' },
    { age: '6 Months', name: 'Black Quarter (BQ)', booster: 'Annually before monsoon', notes: 'Usually given along with HS' },
    { age: '4 to 8 Months', name: 'Brucellosis', booster: 'Once in a lifetime', notes: 'Given to female calves only' },
  ],
  goat: [
    { age: '3 Months', name: 'Peste des Petits Ruminants (PPR)', booster: 'Once in 3 years', notes: 'Highly contagious, strict adherence required' },
    { age: '3 Months', name: 'Goat Pox', booster: 'Annually', notes: 'Endemic areas only' },
    { age: '4 Months', name: 'Foot and Mouth Disease (FMD)', booster: 'Every 6 months', notes: 'First dose at 4 months' },
    { age: '4 Months', name: 'Enterotoxemia (ET)', booster: 'Annually before monsoon', notes: 'Requires booster 15 days after primary dose' },
  ],
  sheep: [
    { age: '3 Months', name: 'Peste des Petits Ruminants (PPR)', booster: 'Once in 3 years', notes: 'Highly contagious viral disease' },
    { age: '3 Months', name: 'Sheep Pox', booster: 'Annually', notes: 'Very important for wool breeds' },
    { age: '4 Months', name: 'Foot and Mouth Disease (FMD)', booster: 'Every 6 months', notes: 'First dose at 4 months' },
    { age: '4 Months', name: 'Enterotoxemia (ET)', booster: 'Annually before monsoon', notes: 'Requires booster 15 days after primary dose' },
  ],
  poultry: [
    { age: 'Day 1', name: "Marek's Disease", booster: 'None', notes: 'Given at hatchery (Subcutaneous)' },
    { age: 'Day 5-7', name: 'Newcastle Disease (Ranikhet) - F Strain', booster: 'Day 28 (Lasota strain)', notes: 'Eye drop or drinking water' },
    { age: 'Day 14-16', name: 'Infectious Bursal Disease (IBD)', booster: 'Day 21-24', notes: 'Drinking water' },
    { age: 'Week 6-8', name: 'Fowl Pox', booster: 'None', notes: 'Wing web puncture' },
  ],
  pig: [
    { age: '2 Months', name: 'Classical Swine Fever', booster: 'Annually', notes: 'Core vaccine' },
    { age: '2 Months', name: 'Foot and Mouth Disease (FMD)', booster: 'Every 6 months', notes: 'Important in endemic areas' },
  ]
}

export default function VaccinationGuide() {
  const { lang } = useLanguage()
  const speciesDict = speciesLabels[lang] || speciesLabels.en
  
  const [selectedSpecies, setSelectedSpecies] = useState('cattle')

  const schedule = VACCINE_SCHEDULE[selectedSpecies] || []

  return (
    <>
      <section className="panel">
        <h2>Vaccination Guide</h2>
        <p className="hint">Select your livestock to view the recommended vaccination schedule.</p>

        <div className="form-grid" style={{ marginBottom: 24, marginTop: 16 }}>
          <div className="full">
            <label htmlFor="speciesSelect">Species</label>
            <select 
              id="speciesSelect"
              value={selectedSpecies}
              onChange={(e) => setSelectedSpecies(e.target.value)}
              style={{ maxWidth: '300px' }}
            >
              {SPECIES.map((s) => (
                <option key={s} value={s}>{speciesDict[s]}</option>
              ))}
            </select>
          </div>
        </div>

        {schedule.length > 0 ? (
          <div className="ledger" style={{ marginTop: 0 }}>
            {schedule.map((vac, idx) => (
              <div key={idx} className="ledger-row" style={{ gridTemplateColumns: '120px 1fr 1fr' }}>
                <div className="ledger-village" style={{ fontWeight: 600, color: 'var(--green-deep)' }}>
                  {vac.age}
                </div>
                <div className="ledger-main">
                  <div className="animal">{vac.name}</div>
                  <div className="meta">Booster: {vac.booster}</div>
                </div>
                <div className="ledger-status" style={{ textAlign: 'left', fontWeight: 'normal', color: 'var(--ink-muted)' }}>
                  {vac.notes}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No vaccination data available for this species.</div>
        )}

        <div className="status-msg" style={{ marginTop: 24, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <AlertCircle size={16} style={{ color: '#d97706', flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontSize: 13, color: '#92400e' }}>
            <strong>Disclaimer:</strong> This schedule is a general guideline. Consult your local veterinarian for region-specific requirements, especially during disease outbreaks. Always ensure animals are dewormed before vaccination.
          </span>
        </div>
      </section>
    </>
  )
}
