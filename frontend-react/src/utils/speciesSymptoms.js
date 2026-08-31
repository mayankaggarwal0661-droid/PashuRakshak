// Which symptoms are relevant to ask about for each species. Keeps the
// checklist from showing irrelevant options (e.g. "reduced milk yield"
// for poultry, or "reduced egg production" for cattle).
export const SPECIES_SYMPTOMS = {
  cattle: ['fever', 'nasal_discharge', 'loss_of_appetite', 'lameness', 'diarrhea', 'skin_lesions', 'labored_breathing', 'excessive_drooling', 'reduced_milk_yield', 'sudden_death_nearby'],
  buffalo: ['fever', 'nasal_discharge', 'loss_of_appetite', 'lameness', 'diarrhea', 'skin_lesions', 'labored_breathing', 'excessive_drooling', 'reduced_milk_yield', 'sudden_death_nearby'],
  goat: ['fever', 'nasal_discharge', 'loss_of_appetite', 'lameness', 'diarrhea', 'skin_lesions', 'labored_breathing', 'reduced_milk_yield', 'sudden_death_nearby'],
  sheep: ['fever', 'nasal_discharge', 'loss_of_appetite', 'lameness', 'diarrhea', 'skin_lesions', 'labored_breathing', 'reduced_milk_yield', 'sudden_death_nearby'],
  poultry: ['fever', 'loss_of_appetite', 'diarrhea', 'labored_breathing', 'reduced_egg_production', 'sudden_death_nearby'],
  pig: ['fever', 'nasal_discharge', 'loss_of_appetite', 'diarrhea', 'skin_lesions', 'labored_breathing', 'sudden_death_nearby'],
}
