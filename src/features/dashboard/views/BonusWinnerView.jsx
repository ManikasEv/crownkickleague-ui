import { useMemo, useState } from 'react'

import { getTeamFlagCode, getTeamFlagUrl } from '../../../lib/flags.js'
import { isGreekLanguage, tCountry } from '../../../lib/localization.js'

function BonusWinnerView({ bonusData, onSave, saving }) {
  const isGreek = isGreekLanguage()
  const [selectedTeam, setSelectedTeam] = useState(bonusData?.prediction?.predictedTeam || '')
  const teams = bonusData?.teams || []

  const potentialPointsText = useMemo(() => {
    const points = Number(bonusData?.potentialPoints ?? 3)
    return `${points} ${isGreek ? 'πόντοι' : 'points'}`
  }, [bonusData?.potentialPoints, isGreek])

  return (
    <section className="rounded-2xl border border-blue-900/60 bg-slate-900/70 p-6">
      <h2 className="text-2xl font-semibold text-white">{isGreek ? 'Bonus Νικητή' : 'Winner Bonus'}</h2>
      <p className="mt-2 text-sm text-blue-100/80">
        {isGreek ? (
          <>
            Πρόβλεψε τον νικητή του Μουντιάλ. Τρέχουσα ανταμοιβή: <strong>{potentialPointsText}</strong>.
          </>
        ) : (
          <>
            Predict the World Cup winner. Current reward: <strong>{potentialPointsText}</strong>.
          </>
        )}
      </p>
      <p className="mt-1 text-xs text-blue-100/70">
        {isGreek
          ? 'Ξεκινά από 11 πόντους πριν την 1η αγωνιστική. Μειώνεται κατά 1 σε κάθε αγωνιστική που ξεκινά, έως ελάχιστο 3.'
          : 'Starts at 11 points before matchday 1. Drops by 1 each started matchday until minimum 3.'}
      </p>

      <div className="mt-5 max-w-md space-y-3">
        <label htmlFor="winner-team" className="block text-sm text-blue-100">
          {isGreek ? 'Διάλεξε νικήτρια ομάδα' : 'Choose winning team'}
        </label>
        <select
          id="winner-team"
          value={selectedTeam}
          onChange={(event) => setSelectedTeam(event.target.value)}
          className="w-full rounded-lg border border-blue-900/80 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-600/30"
        >
          <option value="">{isGreek ? 'Επίλεξε χώρα...' : 'Select a country...'}</option>
          {teams.map((team) => (
            <option key={team} value={team}>
              {`${getTeamFlagCode(team) || ''} ${tCountry(team, isGreek)}`.trim()}
            </option>
          ))}
        </select>

        <button
          type="button"
          disabled={!selectedTeam || saving}
          onClick={() => onSave(selectedTeam)}
          className="rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:from-blue-600 hover:to-blue-400 disabled:opacity-60"
        >
          {saving ? (isGreek ? 'Αποθήκευση...' : 'Saving...') : isGreek ? 'Αποθήκευση πρόβλεψης νικητή' : 'Save winner prediction'}
        </button>
      </div>

      {bonusData?.prediction && (
        <div className="mt-6 rounded-xl border border-blue-900/60 bg-slate-950/40 p-4 text-sm text-blue-100/90">
          <p>
            {isGreek ? 'Η επιλογή σου:' : 'Your pick:'}{' '}
            {getTeamFlagUrl(bonusData.prediction.predictedTeam) ? (
              <img
                src={getTeamFlagUrl(bonusData.prediction.predictedTeam)}
                alt={`${bonusData.prediction.predictedTeam} flag`}
                className="mr-1 inline-block h-3 w-5 rounded-[2px] object-cover align-middle"
                loading="lazy"
              />
            ) : null}
            <strong>{tCountry(bonusData.prediction.predictedTeam, isGreek)}</strong>
          </p>
          <p className="mt-1">
            {isGreek ? 'Δυνητικοί πόντοι' : 'Potential points'}: <strong>{bonusData.prediction.potentialPoints}</strong>
          </p>
          <p className="mt-1">
            {isGreek ? 'Πόντοι που δόθηκαν' : 'Awarded points'}: <strong>{bonusData.prediction.pointsAwarded}</strong>
          </p>
        </div>
      )}
    </section>
  )
}

export default BonusWinnerView
