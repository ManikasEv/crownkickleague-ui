import { useState } from 'react'

function GuessingView({ matchdayData, onChangeMatchday, onSavePrediction, onSyncLive, syncingLive }) {
  const [savingMatchId, setSavingMatchId] = useState(null)
  const [message, setMessage] = useState('')
  const matches = matchdayData?.matches || []
  const [drafts, setDrafts] = useState(() => {
    const initial = {}
    matches.forEach((match) => {
      initial[match.id] = {
        mode: match.prediction?.predictionType ?? 'outcome',
        outcome: match.prediction?.predictedOutcome ?? '1',
        home: match.prediction?.predictedHomeScore ?? '',
        away: match.prediction?.predictedAwayScore ?? '',
      }
    })
    return initial
  })

  function formatKickoff(kickoffAt) {
    if (!kickoffAt) return 'TBD'
    const date = new Date(kickoffAt)
    if (Number.isNaN(date.getTime())) return 'TBD'
    return date.toLocaleString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function formatStatus(status) {
    if (!status) return 'scheduled'
    return String(status).replaceAll('_', ' ')
  }

  function isFinished(match) {
    return String(match?.status || '').toLowerCase() === 'finished'
  }

  function setDraft(matchId, field, value) {
    setDrafts((prev) => ({
      ...prev,
      [matchId]: {
        mode: prev[matchId]?.mode ?? 'outcome',
        outcome: prev[matchId]?.outcome ?? '1',
        home: prev[matchId]?.home ?? '',
        away: prev[matchId]?.away ?? '',
        [field]: value,
      },
    }))
  }

  async function handleSave(matchId, draft) {
    setMessage('')
    setSavingMatchId(matchId)
    try {
      if (draft.mode === 'outcome') {
        await onSavePrediction({
          matchId,
          predictionType: 'outcome',
          predictedOutcome: draft.outcome,
        })
      } else {
        await onSavePrediction({
          matchId,
          predictionType: 'score',
          predictedHomeScore: Number(draft.home || 0),
          predictedAwayScore: Number(draft.away || 0),
        })
      }
      setMessage('Prediction saved.')
    } catch (error) {
      setMessage(error?.message || 'Failed to save prediction.')
    } finally {
      setSavingMatchId(null)
    }
  }

  return (
    <section className="rounded-2xl border border-blue-900/60 bg-slate-900/70 p-6">
      <h2 className="text-2xl font-semibold text-white">Guessing Bracket</h2>
      <p className="mt-1 text-sm text-blue-100/80">
        Choose one mode per match: <strong>1 / X / 2 for 1 point</strong> or <strong>Exact score for 3 points</strong>.
      </p>
      {matchdayData?.locked ? (
        <p className="mt-2 text-sm text-red-300">
          Matchday locked: predictions closed 3 hours before first kickoff.
        </p>
      ) : (
        <p className="mt-2 text-xs text-blue-100/70">
          Editing closes at: {matchdayData?.lockAt ? new Date(matchdayData.lockAt).toLocaleString() : 'N/A'}
        </p>
      )}
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChangeMatchday((matchdayData?.matchday || 1) - 1)}
          disabled={(matchdayData?.matchday || 1) <= 1}
          className="rounded-full border border-blue-400/70 bg-blue-600/20 px-3 py-1 text-sm font-semibold text-blue-100 disabled:opacity-40"
        >
          ← Previous day
        </button>
        <p className="rounded-full border border-blue-500/40 bg-slate-900/80 px-3 py-1 text-sm text-blue-100">
          Matchday {matchdayData?.matchday || 1} / {matchdayData?.maxMatchday || 1}
        </p>
        <button
          type="button"
          onClick={() => onChangeMatchday((matchdayData?.matchday || 1) + 1)}
          disabled={(matchdayData?.matchday || 1) >= (matchdayData?.maxMatchday || 1)}
          className="rounded-full border border-blue-400/70 bg-blue-600/20 px-3 py-1 text-sm font-semibold text-blue-100 disabled:opacity-40"
        >
          Next day →
        </button>
        <button
          type="button"
          onClick={onSyncLive}
          disabled={Boolean(syncingLive)}
          className="ml-auto rounded-full border border-emerald-400/70 bg-emerald-600/20 px-3 py-1 text-sm font-semibold text-emerald-100 disabled:opacity-40"
        >
          {syncingLive ? 'Syncing...' : 'Sync Live Matches'}
        </button>
      </div>

      {message && <p className="mt-3 text-sm text-blue-100">{message}</p>}

      <div className="mt-5 overflow-hidden rounded-xl border border-blue-900/60">
        <table className="w-full text-sm">
          <thead className="bg-blue-950/80 text-blue-100">
            <tr>
              <th className="px-3 py-3 text-left">#</th>
              <th className="px-3 py-3 text-left">Stage</th>
              <th className="px-3 py-3 text-left">Teams</th>
              <th className="px-3 py-3 text-left">Date & Time</th>
              <th className="px-3 py-3 text-left">Status</th>
              <th className="px-3 py-3 text-left">1 / X / 2 Odds</th>
              <th className="px-3 py-3 text-left">Your Guess</th>
              <th className="px-3 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => {
              const draft = drafts[match.id] ?? { mode: 'outcome', outcome: '1', home: '', away: '' }
              const matchFinished = isFinished(match)
              const disableInputs = Boolean(matchdayData?.locked || matchFinished)
              return (
                <tr
                  key={match.id}
                  className={`border-t border-blue-900/50 ${matchFinished ? 'bg-slate-800/70 text-slate-300' : 'text-blue-100/95'}`}
                >
                  <td className="px-3 py-3">#{match.matchOrder}</td>
                  <td className="px-3 py-3 capitalize">{match.stage.replaceAll('_', ' ')}</td>
                  <td className="px-3 py-3">
                    <div className="font-medium">
                      {match.homeTeam} vs {match.awayTeam}
                    </div>
                    {match.homeScore !== null && match.awayScore !== null && (
                      <div className="mt-1 text-xs text-emerald-300">
                        {matchFinished ? 'Final score' : 'Live score'}: {match.homeScore} - {match.awayScore}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3 text-xs text-blue-100/90">{formatKickoff(match.kickoffAt)}</td>
                  <td className="px-3 py-3 capitalize">{formatStatus(match.status)}</td>
                  <td className="px-3 py-3 text-xs text-blue-100/90">
                    {match.odds ? (
                      <div className="space-y-0.5">
                        <div>
                          1: <span className="font-semibold text-white">{match.odds.home}</span> | X:{' '}
                          <span className="font-semibold text-white">{match.odds.draw}</span> | 2:{' '}
                          <span className="font-semibold text-white">{match.odds.away}</span>
                        </div>
                        {match.odds.bookmaker && (
                          <div className="text-[10px] uppercase tracking-wide text-blue-200/70">
                            {match.odds.bookmaker}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-blue-200/60">N/A</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setDraft(match.id, 'mode', 'outcome')}
                          disabled={disableInputs}
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            draft.mode === 'outcome' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-100'
                          } disabled:opacity-50`}
                        >
                          1/X/2 (1 pt)
                        </button>
                        <button
                          type="button"
                          onClick={() => setDraft(match.id, 'mode', 'score')}
                          disabled={disableInputs}
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            draft.mode === 'score' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-100'
                          } disabled:opacity-50`}
                        >
                          Exact score (3 pts)
                        </button>
                      </div>

                      {draft.mode === 'outcome' ? (
                        <div className="flex gap-2">
                          {['1', 'X', '2'].map((outcome) => (
                            <button
                              key={outcome}
                              type="button"
                              onClick={() => setDraft(match.id, 'outcome', outcome)}
                              disabled={disableInputs}
                              className={`rounded-md px-3 py-1 text-xs font-semibold ${
                                draft.outcome === outcome
                                  ? 'bg-red-600 text-white'
                                  : 'bg-slate-800 text-blue-100 hover:bg-slate-700'
                              } disabled:opacity-50`}
                            >
                              {outcome}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={draft.home}
                            onChange={(event) => setDraft(match.id, 'home', event.target.value)}
                            disabled={disableInputs}
                            placeholder="0"
                            className="w-16 rounded-md border border-blue-900/70 bg-white px-2 py-1 text-slate-900 disabled:opacity-50"
                          />
                          <span>-</span>
                          <input
                            type="number"
                            min="0"
                            value={draft.away}
                            onChange={(event) => setDraft(match.id, 'away', event.target.value)}
                            disabled={disableInputs}
                            placeholder="0"
                            className="w-16 rounded-md border border-blue-900/70 bg-white px-2 py-1 text-slate-900 disabled:opacity-50"
                          />
                        </div>
                      )}
                      {matchFinished && (
                        <p className="text-xs text-emerald-300">
                          Points awarded: {Number(match.prediction?.pointsAwarded ?? 0)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      type="button"
                      disabled={savingMatchId === match.id || disableInputs}
                      onClick={() => handleSave(match.id, draft)}
                      className="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                    >
                      {savingMatchId === match.id ? 'Saving...' : 'Save'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default GuessingView
