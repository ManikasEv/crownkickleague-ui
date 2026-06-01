import { isGreekLanguage } from '../../../lib/localization.js'

function RulesView() {
  const isGreek = isGreekLanguage()
  return (
    <section className="rounded-2xl border border-blue-900/60 bg-slate-900/70 p-6">
      <h2 className="text-2xl font-semibold text-white">{isGreek ? 'Κανόνες Παιχνιδιού' : 'Game Rules'}</h2>
      <p className="mt-1 text-sm text-blue-100/80">
        {isGreek
          ? 'Πώς λειτουργεί το CrownKick League, πώς βαθμολογούνται οι προβλέψεις και πότε κλειδώνουν.'
          : 'How CrownKick League works, how points are scored, and when predictions are locked.'}
      </p>

      <div className="mt-6 space-y-5">
        <section className="rounded-xl border border-blue-900/60 bg-slate-950/40 p-4">
          <h3 className="text-base font-semibold text-blue-100">{isGreek ? '1) Τρόποι πρόβλεψης' : '1) Prediction modes'}</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-blue-100/90">
            <li>{isGreek ? 'Για κάθε αγώνα επιλέγεις μόνο έναν τρόπο: αποτέλεσμα ή ακριβές σκορ.' : 'For each match, choose only one mode: outcome or exact score.'}</li>
            <li>
              <strong>{isGreek ? 'Τρόπος αποτελέσματος (1 / X / 2):' : 'Outcome mode (1 / X / 2):'}</strong>{' '}
              {isGreek ? '1 πόντος αν το τελικό αποτέλεσμα είναι σωστό.' : '1 point if the final outcome is correct.'}
            </li>
            <li>
              <strong>{isGreek ? 'Τρόπος ακριβούς σκορ:' : 'Exact score mode:'}</strong>{' '}
              {isGreek ? '3 πόντοι αν και τα δύο τελικά σκορ είναι ακριβώς σωστά.' : '3 points if both final scores are exactly correct.'}
            </li>
            <li>{isGreek ? 'Δεν μπορείς να χρησιμοποιήσεις και τους δύο τρόπους στο ίδιο ματς.' : 'You cannot use both modes for the same match.'}</li>
          </ul>
        </section>

        <section className="rounded-xl border border-blue-900/60 bg-slate-950/40 p-4">
          <h3 className="text-base font-semibold text-blue-100">{isGreek ? '2) Κλείδωμα αγωνιστικής (anti-cheat)' : '2) Matchday lock (anti-cheat)'}</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-blue-100/90">
            <li>{isGreek ? 'Κάθε αγωνιστική κλειδώνει 3 ώρες πριν από την πρώτη σέντρα.' : 'Each matchday is locked 3 hours before its first kickoff.'}</li>
            <li>{isGreek ? 'Μετά το κλείδωμα δεν επιτρέπονται αλλαγές προβλέψεων για όλη την αγωνιστική.' : 'After lock, no prediction edits are allowed for that entire matchday.'}</li>
            <li>{isGreek ? 'Οι ολοκληρωμένοι αγώνες κλειδώνουν και εμφανίζονται με τελικό σκορ + πόντους που δόθηκαν.' : 'Finished matches are also locked and shown with final score + awarded points.'}</li>
          </ul>
        </section>

        <section className="rounded-xl border border-blue-900/60 bg-slate-950/40 p-4">
          <h3 className="text-base font-semibold text-blue-100">{isGreek ? '3) Κατατάξεις και πόντοι' : '3) Rankings and points'}</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-blue-100/90">
            <li>{isGreek ? 'Η παγκόσμια κατάταξη περιλαμβάνει όλους τους παίκτες.' : 'Global ranking includes all players.'}</li>
            <li>{isGreek ? 'Η κατάταξη ομάδας περιλαμβάνει μόνο τα μέλη της επιλεγμένης ομάδας.' : 'Team ranking includes only members of the selected team.'}</li>
            <li>
              {isGreek
                ? 'Οι πόντοι των παικτών ενημερώνονται αυτόματα όταν συγχρονίζονται τα τελικά αποτελέσματα από το API.'
                : 'Player points update automatically as finished match results are synced from the API.'}
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-blue-900/60 bg-slate-950/40 p-4">
          <h3 className="text-base font-semibold text-blue-100">{isGreek ? '4) Ομάδες και προσκλήσεις' : '4) Teams and invites'}</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-blue-100/90">
            <li>{isGreek ? 'Ένας χρήστης μπορεί να έχει πολλές ομάδες και να συμμετέχει σε πολλές ομάδες.' : 'A user can own multiple teams and can also join multiple teams.'}</li>
            <li>{isGreek ? 'Οι ιδιοκτήτες ομάδων προσκαλούν με username.' : 'Team owners invite by username.'}</li>
            <li>{isGreek ? 'Οι προσκεκλημένοι παίκτες αποδέχονται από την καρτέλα Προσκλήσεις για να μπουν στην ομάδα.' : 'Invited players accept from the Invites tab to join that team.'}</li>
          </ul>
        </section>

        <section className="rounded-xl border border-blue-900/60 bg-slate-950/40 p-4">
          <h3 className="text-base font-semibold text-blue-100">{isGreek ? '5) Ζωντανά δεδομένα' : '5) Live data'}</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-blue-100/90">
            <li>{isGreek ? 'Αγώνες, live κατάσταση και σκορ έρχονται από τον ρυθμισμένο football API provider.' : 'Fixtures, live status, and scores come from the configured football API provider.'}</li>
            <li>{isGreek ? 'Οι καρτέλες Όμιλοι και LiveScore ανανεώνονται αυτόματα όταν είναι ανοιχτές.' : 'Groups and LiveScore tabs refresh automatically while open.'}</li>
            <li>{isGreek ? 'Χρησιμοποίησε το Sync Live Matches για χειροκίνητη ανανέωση οποιαδήποτε στιγμή.' : 'Use Sync Live Matches to force a manual refresh at any time.'}</li>
          </ul>
        </section>
      </div>
    </section>
  )
}

export default RulesView
