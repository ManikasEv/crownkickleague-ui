import { isGreekLanguage } from '../../../lib/localization.js'

function TeamRankingView({ teams, selectedTeamId, onSelectTeam }) {
  const isGreek = isGreekLanguage()
  const selectedTeam = teams.find((team) => team.id === selectedTeamId) || teams[0]
  const entries = selectedTeam?.members || []

  return (
    <section className="rounded-2xl border border-blue-900/60 bg-slate-900/70 p-6">
      <h2 className="text-2xl font-semibold text-white">{isGreek ? 'Κατάταξη Ομάδας' : 'Team Ranking'}</h2>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label htmlFor="teamSelect" className="text-sm text-blue-100/80">
          {isGreek ? 'Ομάδα:' : 'Team:'}
        </label>
        <select
          id="teamSelect"
          value={selectedTeam?.id || ''}
          onChange={(event) => onSelectTeam(Number(event.target.value))}
          className="rounded-md border border-blue-900/70 bg-white px-3 py-1 text-sm text-slate-900"
        >
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-blue-900/60">
        <table className="w-full text-sm">
          <thead className="bg-blue-950/80 text-blue-100">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">{isGreek ? 'Μέλος Ομάδας' : 'Team Member'}</th>
              <th className="px-4 py-3 text-right">{isGreek ? 'Πόντοι' : 'Points'}</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={entry.username} className="border-t border-blue-900/50 text-blue-100/95">
                <td className="px-4 py-3">{index + 1}</td>
                <td className="px-4 py-3">@{entry.username}</td>
                <td className="px-4 py-3 text-right font-semibold">{entry.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default TeamRankingView
