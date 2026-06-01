export function isGreekLanguage() {
  if (typeof navigator === 'undefined') return false
  return String(navigator.language || '').toLowerCase().startsWith('el')
}

const COUNTRY_NAME_EL = {
  Argentina: 'Αργεντινή',
  Australia: 'Αυστραλία',
  Austria: 'Αυστρία',
  Belgium: 'Βέλγιο',
  'Bosnia-Herzegovina': 'Βοσνία-Ερζεγοβίνη',
  Brazil: 'Βραζιλία',
  Cameroon: 'Καμερούν',
  Canada: 'Καναδάς',
  Chile: 'Χιλή',
  Colombia: 'Κολομβία',
  Croatia: 'Κροατία',
  Czechia: 'Τσεχία',
  Denmark: 'Δανία',
  Ecuador: 'Ισημερινός',
  Egypt: 'Αίγυπτος',
  England: 'Αγγλία',
  France: 'Γαλλία',
  Germany: 'Γερμανία',
  Ghana: 'Γκάνα',
  Iran: 'Ιράν',
  Iraq: 'Ιράκ',
  Italy: 'Ιταλία',
  'Ivory Coast': 'Ακτή Ελεφαντοστού',
  Japan: 'Ιαπωνία',
  Mexico: 'Μεξικό',
  Morocco: 'Μαρόκο',
  Netherlands: 'Ολλανδία',
  'New Zealand': 'Νέα Ζηλανδία',
  Nigeria: 'Νιγηρία',
  Norway: 'Νορβηγία',
  Paraguay: 'Παραγουάη',
  Peru: 'Περού',
  Poland: 'Πολωνία',
  Portugal: 'Πορτογαλία',
  Qatar: 'Κατάρ',
  'Korea Republic': 'Νότια Κορέα',
  'South Korea': 'Νότια Κορέα',
  'Saudi Arabia': 'Σαουδική Αραβία',
  Senegal: 'Σενεγάλη',
  Serbia: 'Σερβία',
  Spain: 'Ισπανία',
  'South Africa': 'Νότια Αφρική',
  Sweden: 'Σουηδία',
  Switzerland: 'Ελβετία',
  Tunisia: 'Τυνησία',
  Turkey: 'Τουρκία',
  Uruguay: 'Ουρουγουάη',
  USA: 'ΗΠΑ',
  'United States': 'ΗΠΑ',
  Wales: 'Ουαλία',
}

const STAGE_NAME_EL = {
  group: 'όμιλοι',
  round_of_32: 'φάση των 32',
  round_of_16: 'φάση των 16',
  quarterfinals: 'προημιτελικά',
  semifinals: 'ημιτελικά',
  third_place: 'μικρός τελικός',
  final: 'τελικός',
}

export function tCountry(name, isGreek = false) {
  const value = String(name || '').trim()
  if (!isGreek) return value
  return COUNTRY_NAME_EL[value] || value
}

export function tStage(stage, isGreek = false) {
  const key = String(stage || '').toLowerCase()
  if (!isGreek) return key.replaceAll('_', ' ')
  return STAGE_NAME_EL[key] || key.replaceAll('_', ' ')
}
