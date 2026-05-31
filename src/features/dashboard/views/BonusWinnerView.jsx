import { useMemo, useState } from 'react'

import { getTeamFlag } from '../../../lib/flags.js'

function BonusWinnerView({ bonusData, onSave, saving }) {
  const [selectedTeam, setSelectedTeam] = useState(bonusData?.prediction?.predictedTeam || '')
  const teams = bonusData?.teams || []

  const potentialPointsText = useMemo(() => {
    const points = Number(bonusData?.potentialPoints ?? 3)
    return `${points} points`
  }, [bonusData?.potentialPoints])

  return (
    <section className="rounded-2xl border border-blue-900/60 bg-slate-900/70 p-6">
      <h2 className="text-2xl font-semibold text-white">Winner Bonus</h2>
      <p className="mt-2 text-sm text-blue-100/80">
        Predict the World Cup winner. Current reward: <strong>{potentialPointsText}</strong>.
      </p>
      <p className="mt-1 text-xs text-blue-100/70">
        Starts at 11 points before matchday 1. Drops by 1 each started matchday until minimum 3.
      </p>

      <div className="mt-5 max-w-md space-y-3">
        <label htmlFor="winner-team" className="block text-sm text-blue-100">
          Choose winning team
        </label>
        <select
          id="winner-team"
          value={selectedTeam}
          onChange={(event) => setSelectedTeam(event.target.value)}
          className="w-full rounded-lg border border-blue-900/80 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-600/30"
        >
          <option value="">Select a country...</option>
          {teams.map((team) => (
            <option key={team} value={team}>
              {`${getTeamFlag(team)} ${team}`.trim()}
            </option>
          ))}
        </select>

        <button
          type="button"
          disabled={!selectedTeam || saving}
          onClick={() => onSave(selectedTeam)}
          className="rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:from-blue-600 hover:to-blue-400 disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save winner prediction'}
        </button>
      </div>

      {bonusData?.prediction && (
        <div className="mt-6 rounded-xl border border-blue-900/60 bg-slate-950/40 p-4 text-sm text-blue-100/90">
          <p>
            Your pick: <strong>{bonusData.prediction.predictedTeam}</strong>
          </p>
          <p className="mt-1">
            Potential points: <strong>{bonusData.prediction.potentialPoints}</strong>
          </p>
          <p className="mt-1">
            Awarded points: <strong>{bonusData.prediction.pointsAwarded}</strong>
          </p>
        </div>
      )}
    </section>
  )
}

export default BonusWinnerView
