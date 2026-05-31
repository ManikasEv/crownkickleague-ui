function GlobalRankingView({ entries }) {
  if (!entries.length) {
    return (
      <section className="rounded-2xl border border-blue-900/60 bg-slate-900/70 p-6">
        <h2 className="text-2xl font-semibold text-white">Global Ranking</h2>
        <p className="mt-1 text-sm text-blue-100/80">No players yet. Invite friends to join CrownKick League.</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-blue-900/60 bg-slate-900/70 p-6">
      <h2 className="text-2xl font-semibold text-white">Global Ranking</h2>
      <p className="mt-1 text-sm text-blue-100/80">All players compete here.</p>

      <div className="mt-5 overflow-hidden rounded-xl border border-blue-900/60">
        <table className="w-full text-sm">
          <thead className="bg-blue-950/80 text-blue-100">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Player</th>
              <th className="px-4 py-3 text-right">Points</th>
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

export default GlobalRankingView
