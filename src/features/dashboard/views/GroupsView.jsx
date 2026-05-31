import { getTeamFlag } from '../../../lib/flags.js'

function GroupsView({ groups, updatedAt, loading, onRefresh }) {
  return (
    <section className="rounded-2xl border border-blue-900/60 bg-slate-900/70 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Group Standings (A-L)</h2>
          <p className="mt-1 text-sm text-blue-100/80">
            Live table positions by group, including points and goal difference.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="rounded-full border border-emerald-400/70 bg-emerald-600/20 px-4 py-1.5 text-sm font-semibold text-emerald-100 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <p className="mt-3 text-xs text-blue-100/60">
        Updated: {updatedAt ? new Date(updatedAt).toLocaleString() : 'N/A'}
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => (
          <section key={group.group} className="overflow-hidden rounded-xl border border-blue-900/60">
            <header className="bg-blue-950/80 px-3 py-2 text-sm font-semibold text-blue-100">
              Group {group.group}
            </header>
            <table className="w-full text-xs">
              <thead className="bg-slate-900 text-blue-100/90">
                <tr>
                  <th className="px-2 py-2 text-left">#</th>
                  <th className="px-2 py-2 text-left">Team</th>
                  <th className="px-2 py-2 text-right">Pts</th>
                  <th className="px-2 py-2 text-right">GD</th>
                </tr>
              </thead>
              <tbody>
                {group.table.map((row) => (
                  <tr key={`${group.group}-${row.position}-${row.teamName}`} className="border-t border-blue-900/50 text-blue-100/95">
                    <td className={`px-2 py-2 font-semibold ${row.position <= 2 ? 'text-emerald-300' : 'text-blue-100/90'}`}>
                      {row.position}
                    </td>
                    <td className="px-2 py-2">
                      <span className="mr-1">{getTeamFlag(row.teamName)}</span>
                      {row.teamName}
                    </td>
                    <td className="px-2 py-2 text-right font-semibold">{row.points}</td>
                    <td className="px-2 py-2 text-right">{row.goalDifference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
      </div>
    </section>
  )
}

export default GroupsView
