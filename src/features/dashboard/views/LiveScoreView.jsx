function LiveScoreView({ matches, updatedAt, loading, onRefresh }) {
  return (
    <section className="rounded-2xl border border-blue-900/60 bg-slate-900/70 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">LiveScore</h2>
          <p className="mt-1 text-sm text-blue-100/80">
            Ongoing matches with live score updates.
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

      {matches.length === 0 ? (
        <p className="mt-4 rounded-lg border border-blue-900/60 bg-slate-950/40 px-4 py-3 text-sm text-blue-100/80">
          No live matches right now.
        </p>
      ) : (
        <div className="mt-5 overflow-hidden rounded-xl border border-blue-900/60">
          <table className="w-full text-sm">
            <thead className="bg-blue-950/80 text-blue-100">
              <tr>
                <th className="px-3 py-3 text-left">Match</th>
                <th className="px-3 py-3 text-left">Score</th>
                <th className="px-3 py-3 text-left">Stage</th>
                <th className="px-3 py-3 text-left">Kickoff</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match) => (
                <tr key={match.id} className="border-t border-blue-900/50 text-blue-100/95">
                  <td className="px-3 py-3 font-medium">
                    {match.homeTeam} vs {match.awayTeam}
                  </td>
                  <td className="px-3 py-3 font-semibold text-emerald-300">
                    {match.homeScore ?? 0} - {match.awayScore ?? 0}
                  </td>
                  <td className="px-3 py-3 capitalize">{String(match.stage || '').replaceAll('_', ' ')}</td>
                  <td className="px-3 py-3 text-xs text-blue-100/90">
                    {match.kickoffAt ? new Date(match.kickoffAt).toLocaleString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default LiveScoreView
