function RulesView() {
  return (
    <section className="rounded-2xl border border-blue-900/60 bg-slate-900/70 p-6">
      <h2 className="text-2xl font-semibold text-white">Game Rules</h2>
      <p className="mt-1 text-sm text-blue-100/80">
        How CrownKick League works, how points are scored, and when predictions are locked.
      </p>

      <div className="mt-6 space-y-5">
        <section className="rounded-xl border border-blue-900/60 bg-slate-950/40 p-4">
          <h3 className="text-base font-semibold text-blue-100">1) Prediction modes</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-blue-100/90">
            <li>For each match, choose only one mode: outcome or exact score.</li>
            <li>
              <strong>Outcome mode (1 / X / 2):</strong> 1 point if the final outcome is correct.
            </li>
            <li>
              <strong>Exact score mode:</strong> 3 points if both final scores are exactly correct.
            </li>
            <li>You cannot use both modes for the same match.</li>
          </ul>
        </section>

        <section className="rounded-xl border border-blue-900/60 bg-slate-950/40 p-4">
          <h3 className="text-base font-semibold text-blue-100">2) Matchday lock (anti-cheat)</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-blue-100/90">
            <li>Each matchday is locked 3 hours before its first kickoff.</li>
            <li>After lock, no prediction edits are allowed for that entire matchday.</li>
            <li>Finished matches are also locked and shown with final score + awarded points.</li>
          </ul>
        </section>

        <section className="rounded-xl border border-blue-900/60 bg-slate-950/40 p-4">
          <h3 className="text-base font-semibold text-blue-100">3) Rankings and points</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-blue-100/90">
            <li>Global ranking includes all players.</li>
            <li>Team ranking includes only members of the selected team.</li>
            <li>
              Player points update automatically as finished match results are synced from the API.
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-blue-900/60 bg-slate-950/40 p-4">
          <h3 className="text-base font-semibold text-blue-100">4) Teams and invites</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-blue-100/90">
            <li>A user can own multiple teams and can also join multiple teams.</li>
            <li>Team owners invite by username.</li>
            <li>Invited players accept from the Invites tab to join that team.</li>
          </ul>
        </section>

        <section className="rounded-xl border border-blue-900/60 bg-slate-950/40 p-4">
          <h3 className="text-base font-semibold text-blue-100">5) Live data</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-blue-100/90">
            <li>Fixtures, live status, and scores come from the configured football API provider.</li>
            <li>Groups and LiveScore tabs refresh automatically while open.</li>
            <li>Use Sync Live Matches to force a manual refresh at any time.</li>
          </ul>
        </section>
      </div>
    </section>
  )
}

export default RulesView
