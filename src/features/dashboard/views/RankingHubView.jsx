import { isGreekLanguage } from '../../../lib/localization.js'

function RankingHubView({ teams, onOpenGlobal, onOpenTeam }) {
  const isGreek = isGreekLanguage()
  const hasTeams = teams.length > 0
  return (
    <section className="rounded-2xl border border-blue-900/60 bg-slate-900/70 p-6">
      <h2 className="text-2xl font-semibold text-white">{isGreek ? 'Επίλεξε Προβολή Κατάταξης' : 'Choose Ranking View'}</h2>
      <p className="mt-1 text-sm text-blue-100/80">
        {isGreek ? 'Διάλεξε ποια κατάταξη θέλεις να ανοίξεις.' : 'Pick which ranking you want to open.'}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onOpenGlobal}
          className="rounded-full border border-blue-400/70 bg-blue-600/20 px-5 py-2 text-sm font-semibold text-blue-100 hover:bg-blue-500/30"
        >
          {isGreek ? 'Γενική Κατάταξη' : 'Global Ranking'}
        </button>

        <button
          type="button"
          onClick={onOpenTeam}
          disabled={!hasTeams}
          className="rounded-full border border-red-400/70 bg-red-600/20 px-5 py-2 text-sm font-semibold text-red-100 hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {hasTeams
            ? isGreek
              ? `Κατάταξη Ομάδων (${teams.length} ομάδες)`
              : `Team Ranking (${teams.length} teams)`
            : isGreek
            ? 'Κατάταξη Ομάδων (καμία ομάδα ακόμη)'
            : 'Team Ranking (no teams yet)'}
        </button>
      </div>
    </section>
  )
}

export default RankingHubView
