import { useState } from 'react'

import { getTeamFlagCode, getTeamFlagUrl } from '../../../lib/flags.js'
import { isGreekLanguage, tCountry, tStage } from '../../../lib/localization.js'

function GuessingView({ matchdayData, onChangeMatchday, onSaveMatchday, onSyncLive, onOpenBonus, syncingLive }) {
  const isGreek = isGreekLanguage()
  const [savingAll, setSavingAll] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')
  const matches = matchdayData?.matches || []
  const [drafts, setDrafts] = useState(() => {
    const initial = {}
    matches.forEach((match) => {
      initial[match.id] = {
        mode: match.prediction?.predictionType ?? 'outcome',
        outcome: match.prediction?.predictedOutcome ?? '',
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
    const normalized = String(status).toLowerCase()
    if (!isGreek) return String(status).replaceAll('_', ' ')
    if (normalized === 'live') return 'ζωντανά'
    if (normalized === 'finished') return 'ολοκληρώθηκε'
    return 'προγραμματισμένο'
  }

  function isFinished(match) {
    return String(match?.status || '').toLowerCase() === 'finished'
  }

  function Flag({ teamName }) {
    const url = getTeamFlagUrl(teamName)
    const code = getTeamFlagCode(teamName)
    if (!url) {
      return <span className="mr-1 inline-block min-w-6 text-[10px] uppercase text-blue-200/70">{code || ''}</span>
    }
    return (
      <img
        src={url}
        alt={`${teamName} flag`}
        className="mr-1 inline-block h-3 w-5 rounded-[2px] object-cover align-middle"
        loading="lazy"
      />
    )
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

  function isValidScoreValue(value) {
    if (value === '' || value === null || value === undefined) return false
    const numeric = Number(value)
    return Number.isFinite(numeric) && numeric >= 0
  }

  function buildPayload(match, draft) {
    if (draft.mode === 'score') {
      if (!isValidScoreValue(draft.home) || !isValidScoreValue(draft.away)) return null
      return {
        matchId: match.id,
        predictionType: 'score',
        predictedHomeScore: Number(draft.home),
        predictedAwayScore: Number(draft.away),
      }
    }
    if (!['1', 'X', '2'].includes(draft.outcome)) return null
    return {
      matchId: match.id,
      predictionType: 'outcome',
      predictedOutcome: draft.outcome,
    }
  }

  function isDraftDifferentFromPrediction(match, draft) {
    const existing = match.prediction
    if (!existing) {
      return Boolean(buildPayload(match, draft))
    }
    if (draft.mode !== existing.predictionType) return true
    if (draft.mode === 'outcome') return draft.outcome !== (existing.predictedOutcome ?? '')
    return (
      Number(draft.home) !== Number(existing.predictedHomeScore ?? NaN) ||
      Number(draft.away) !== Number(existing.predictedAwayScore ?? NaN)
    )
  }

  function getPendingChangesCount() {
    return matches.filter((match) => {
      const matchFinished = isFinished(match)
      const disabled = Boolean(matchdayData?.locked || matchFinished)
      if (disabled) return false
      const draft = drafts[match.id] ?? { mode: 'outcome', outcome: '', home: '', away: '' }
      return isDraftDifferentFromPrediction(match, draft) && Boolean(buildPayload(match, draft))
    }).length
  }

  async function handleSaveAll() {
    setMessage('')
    setMessageType('info')
    setSavingAll(true)
    try {
      const payloads = matches
        .filter((match) => {
          const matchFinished = isFinished(match)
          const disabled = Boolean(matchdayData?.locked || matchFinished)
          if (disabled) return false
          const draft = drafts[match.id] ?? { mode: 'outcome', outcome: '', home: '', away: '' }
          return isDraftDifferentFromPrediction(match, draft)
        })
        .map((match) => {
          const draft = drafts[match.id] ?? { mode: 'outcome', outcome: '', home: '', away: '' }
          return buildPayload(match, draft)
        })
        .filter(Boolean)

      if (payloads.length === 0) {
        setMessageType('info')
        setMessage(isGreek ? 'Δεν υπάρχουν νέες αλλαγές για αποθήκευση σε αυτή την αγωνιστική.' : 'No new changes to save for this matchday.')
        return
      }

      const result = await onSaveMatchday(payloads)
      setMessageType('success')
      setMessage(
        isGreek
          ? `Αποθηκεύτηκαν ${result?.savedCount ?? payloads.length} προβλέψεις για αυτή την αγωνιστική.`
          : `Saved ${result?.savedCount ?? payloads.length} prediction(s) for this matchday.`,
      )
    } catch (error) {
      setMessageType('error')
      setMessage(error?.message || (isGreek ? 'Αποτυχία αποθήκευσης προβλέψεων αγωνιστικής.' : 'Failed to save matchday predictions.'))
    } finally {
      setSavingAll(false)
    }
  }

  const pendingChangesCount = getPendingChangesCount()

  return (
    <section className="rounded-2xl border border-blue-900/60 bg-slate-900/70 p-4 sm:p-6">
      <h2 className="text-xl font-semibold text-white sm:text-2xl">{isGreek ? 'Πίνακας Προβλέψεων' : 'Guessing Bracket'}</h2>
      <p className="mt-1 text-sm text-blue-100/80">
        {isGreek ? (
          <>
            Διάλεξε έναν τρόπο ανά ματς: <strong>1 / X / 2 για 1 πόντο</strong> ή <strong>Ακριβές σκορ για 3 πόντους</strong>.
          </>
        ) : (
          <>
            Choose one mode per match: <strong>1 / X / 2 for 1 point</strong> or <strong>Exact score for 3 points</strong>.
          </>
        )}
      </p>
      {matchdayData?.locked ? (
        <p className="mt-2 text-sm text-red-300">
          {isGreek
            ? 'Η αγωνιστική κλείδωσε: οι προβλέψεις κλείνουν 3 ώρες πριν την πρώτη σέντρα.'
            : 'Matchday locked: predictions closed 3 hours before first kickoff.'}
        </p>
      ) : (
        <p className="mt-2 text-xs text-blue-100/70">
          {isGreek ? 'Η επεξεργασία κλείνει:' : 'Editing closes at:'}{' '}
          {matchdayData?.lockAt ? new Date(matchdayData.lockAt).toLocaleString() : isGreek ? 'N/A' : 'N/A'}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onChangeMatchday((matchdayData?.matchday || 1) - 1)}
          disabled={(matchdayData?.matchday || 1) <= 1}
          className="rounded-full border border-blue-400/70 bg-blue-600/20 px-3 py-1 text-xs font-semibold text-blue-100 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-500/30 active:scale-95 disabled:opacity-40 sm:text-sm"
        >
          {isGreek ? '← Προηγούμενη' : '← Previous day'}
        </button>
        <p className="rounded-full border border-blue-500/40 bg-slate-900/80 px-3 py-1 text-xs text-blue-100 sm:text-sm">
          {isGreek ? 'Αγωνιστική' : 'Matchday'} {matchdayData?.matchday || 1} / {matchdayData?.maxMatchday || 1}
        </p>
        <button
          type="button"
          onClick={() => onChangeMatchday((matchdayData?.matchday || 1) + 1)}
          disabled={(matchdayData?.matchday || 1) >= (matchdayData?.maxMatchday || 1)}
          className="rounded-full border border-blue-400/70 bg-blue-600/20 px-3 py-1 text-xs font-semibold text-blue-100 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-500/30 active:scale-95 disabled:opacity-40 sm:text-sm"
        >
          {isGreek ? 'Επόμενη →' : 'Next day →'}
        </button>
        <button
          type="button"
          onClick={onOpenBonus}
          className="rounded-full border border-violet-400/70 bg-violet-600/20 px-3 py-1 text-xs font-semibold text-violet-100 transition duration-200 hover:-translate-y-0.5 hover:bg-violet-500/30 active:scale-95 sm:text-sm"
        >
          {isGreek ? 'Bonus νικητή' : 'Winner bonus'}
        </button>
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={Boolean(matchdayData?.locked || savingAll)}
          className={`rounded-full border px-3 py-1 text-xs font-semibold text-blue-100 transition duration-200 active:scale-95 disabled:opacity-40 sm:text-sm ${
            savingAll
              ? 'animate-pulse border-cyan-300/80 bg-cyan-500/40 shadow-[0_0_0_2px_rgba(34,211,238,0.25)]'
              : 'border-blue-300/80 bg-blue-600/30 hover:-translate-y-0.5 hover:bg-blue-500/40 hover:shadow-[0_0_0_2px_rgba(96,165,250,0.3)]'
          }`}
        >
          {savingAll
            ? isGreek
              ? 'Αποθήκευση...'
              : 'Saving matchday...'
            : `${isGreek ? 'Αποθήκευση αγωνιστικής' : 'Save matchday predictions'}${
                pendingChangesCount > 0 ? ` (${pendingChangesCount})` : ''
              }`}
        </button>
        <button
          type="button"
          onClick={onSyncLive}
          disabled={Boolean(syncingLive)}
          className="w-full rounded-full border border-emerald-400/70 bg-emerald-600/20 px-3 py-1 text-xs font-semibold text-emerald-100 transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-500/30 active:scale-95 disabled:opacity-40 sm:ml-auto sm:w-auto sm:text-sm"
        >
          {syncingLive ? (isGreek ? 'Συγχρονισμός...' : 'Syncing...') : isGreek ? 'Συγχρονισμός Live Αγώνων' : 'Sync Live Matches'}
        </button>
      </div>

      {message && (
        <p
          className={`mt-3 rounded-lg border px-3 py-2 text-sm transition-all duration-300 ${
            messageType === 'success'
              ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200'
              : messageType === 'error'
              ? 'border-red-400/60 bg-red-500/15 text-red-200'
              : 'border-blue-400/60 bg-blue-500/15 text-blue-100'
          }`}
        >
          {messageType === 'success' ? '✓ ' : messageType === 'error' ? '⚠ ' : '• '}
          {message}
        </p>
      )}

      <div className="mt-5 md:hidden space-y-3">
        {matches.map((match) => {
          const draft = drafts[match.id] ?? { mode: 'outcome', outcome: '1', home: '', away: '' }
          const matchFinished = isFinished(match)
          const disableInputs = Boolean(matchdayData?.locked || matchFinished)
          return (
            <article
              key={match.id}
              className={`rounded-xl border border-blue-900/60 p-3 ${matchFinished ? 'bg-slate-800/70 text-slate-300' : 'bg-slate-900/60 text-blue-100'}`}
            >
              <div className="flex items-center justify-between text-xs">
                <span>#{match.matchOrder}</span>
                <span className="capitalize">{tStage(match.stage, isGreek)}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1 text-sm font-semibold">
                <Flag teamName={match.homeTeam} />
                <span>{tCountry(match.homeTeam, isGreek)}</span>
                <span className="text-blue-200/90">vs</span>
                <Flag teamName={match.awayTeam} />
                <span>{tCountry(match.awayTeam, isGreek)}</span>
              </div>
              <p className="mt-1 text-xs text-blue-100/80">{formatKickoff(match.kickoffAt)}</p>
              <p className="text-xs capitalize">{formatStatus(match.status)}</p>
              {match.homeScore !== null && match.awayScore !== null && (
                <p className="mt-1 text-xs text-emerald-300">
                  {matchFinished ? (isGreek ? 'Τελικό' : 'Final') : isGreek ? 'Ζωντανά' : 'Live'}: {match.homeScore} - {match.awayScore}
                </p>
              )}

              <div className="mt-3 space-y-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDraft(match.id, 'mode', 'outcome')}
                    disabled={disableInputs}
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      draft.mode === 'outcome' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-100'
                    } disabled:opacity-50`}
                  >
                    1/X/2
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraft(match.id, 'mode', 'score')}
                    disabled={disableInputs}
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      draft.mode === 'score' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-100'
                    } disabled:opacity-50`}
                  >
                    Score
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
                    {isGreek ? 'Πόντοι που δόθηκαν' : 'Points awarded'}: {Number(match.prediction?.pointsAwarded ?? 0)}
                  </p>
                )}
              </div>
            </article>
          )
        })}
      </div>

      <div className="mt-5 hidden md:block overflow-hidden rounded-xl border border-blue-900/60">
        <table className="w-full text-sm">
          <thead className="bg-blue-950/80 text-blue-100">
            <tr>
              <th className="px-3 py-3 text-left">#</th>
                <th className="px-3 py-3 text-left">{isGreek ? 'Φάση' : 'Stage'}</th>
                <th className="px-3 py-3 text-left">{isGreek ? 'Ομάδες' : 'Teams'}</th>
                <th className="px-3 py-3 text-left">{isGreek ? 'Ημερομηνία & Ώρα' : 'Date & Time'}</th>
                <th className="px-3 py-3 text-left">{isGreek ? 'Κατάσταση' : 'Status'}</th>
                <th className="px-3 py-3 text-left">{isGreek ? 'Αποδόσεις 1 / X / 2' : '1 / X / 2 Odds'}</th>
                <th className="px-3 py-3 text-left">{isGreek ? 'Η Πρόβλεψή Σου' : 'Your Guess'}</th>
                <th className="px-3 py-3 text-right">{isGreek ? 'Ενέργεια' : 'Action'}</th>
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
                  <td className="px-3 py-3 capitalize">{tStage(match.stage, isGreek)}</td>
                  <td className="px-3 py-3">
                    <div className="font-medium">
                      <Flag teamName={match.homeTeam} />
                      {tCountry(match.homeTeam, isGreek)} vs
                      <Flag teamName={match.awayTeam} />
                      {tCountry(match.awayTeam, isGreek)}
                    </div>
                    {match.homeScore !== null && match.awayScore !== null && (
                      <div className="mt-1 text-xs text-emerald-300">
                        {matchFinished ? (isGreek ? 'Τελικό σκορ' : 'Final score') : isGreek ? 'Live σκορ' : 'Live score'}: {match.homeScore} - {match.awayScore}
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
                      <span className="text-blue-200/60">{isGreek ? 'Μ/Δ' : 'N/A'}</span>
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
                          {isGreek ? '1/X/2 (1 π.)' : '1/X/2 (1 pt)'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDraft(match.id, 'mode', 'score')}
                          disabled={disableInputs}
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            draft.mode === 'score' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-100'
                          } disabled:opacity-50`}
                        >
                          {isGreek ? 'Ακριβές σκορ (3 π.)' : 'Exact score (3 pts)'}
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
                          {isGreek ? 'Πόντοι που δόθηκαν' : 'Points awarded'}: {Number(match.prediction?.pointsAwarded ?? 0)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right text-xs text-blue-200/80">
                    {isGreek ? 'Αποθήκευση αγωνιστικής' : 'Matchday save'}
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
