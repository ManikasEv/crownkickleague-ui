import { isGreekLanguage } from '../../../lib/localization.js'

function InvitesView({ invites, onAcceptInvite }) {
  const isGreek = isGreekLanguage()
  return (
    <section className="rounded-2xl border border-blue-900/60 bg-slate-900/70 p-6">
      <h2 className="text-2xl font-semibold text-white">{isGreek ? 'Προσκλήσεις Ομάδας' : 'Team Invites'}</h2>
      <p className="mt-1 text-sm text-blue-100/80">
        {isGreek ? 'Αποδέξου μια πρόσκληση για να μπεις σε κατάταξη ομάδας.' : 'Accept an invite to join a team ranking.'}
      </p>

      {!invites.length ? (
        <p className="mt-4 text-sm text-blue-100/80">{isGreek ? 'Δεν υπάρχουν εκκρεμείς προσκλήσεις.' : 'No pending invites.'}</p>
      ) : (
        <div className="mt-5 space-y-3">
          {invites.map((invite) => (
            <div
              key={invite.id}
              className="flex flex-col gap-3 rounded-lg border border-blue-900/60 bg-slate-950/70 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-white">
                  <span className="font-semibold">{invite.teamName}</span>{' '}
                  {isGreek ? 'σε προσκάλεσε ο/η' : 'invited by'} @{invite.inviterUsername}
                </p>
                <p className="text-xs text-blue-100/70">{isGreek ? 'Εκκρεμεί πρόσκληση' : 'Pending invite'}</p>
              </div>
              <button
                type="button"
                onClick={() => onAcceptInvite(invite.id)}
                className="rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 px-4 py-2 text-sm font-semibold text-white hover:from-blue-600 hover:to-blue-400"
              >
                {isGreek ? 'Αποδοχή Πρόσκλησης' : 'Accept Invite'}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default InvitesView
