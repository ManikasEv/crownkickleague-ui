import { useState } from 'react'
import { isGreekLanguage } from '../../../lib/localization.js'

function CreateTeamView({ teams, ownedTeamIds, selectedOwnedTeamId, onSelectOwnedTeam, onCreateTeam, onInviteUser }) {
  const isGreek = isGreekLanguage()
  const [teamName, setTeamName] = useState('')
  const [inviteUsername, setInviteUsername] = useState('')
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  const ownedTeams = teams.filter((team) => ownedTeamIds.includes(team.id))
  const canInvite = ownedTeams.length > 0 && selectedOwnedTeamId

  async function onCreateSubmit(event) {
    event.preventDefault()
    setMessage('')
    setPending(true)

    try {
      const trimmedTeamName = teamName.trim()
      if (!trimmedTeamName) {
        setMessage(isGreek ? 'Το όνομα ομάδας είναι υποχρεωτικό.' : 'Team name is required.')
        return
      }

      await onCreateTeam(trimmedTeamName)
      setTeamName('')
      setMessage(
        isGreek
          ? 'Η ομάδα δημιουργήθηκε. Τώρα μπορείς να προσκαλέσεις παίκτες με username.'
          : 'Team created. You can now invite players by username.',
      )
    } catch (error) {
      setMessage(error?.message || (isGreek ? 'Αποτυχία δημιουργίας ομάδας.' : 'Failed to create team.'))
    } finally {
      setPending(false)
    }
  }

  async function onInviteSubmit(event) {
    event.preventDefault()
    setMessage('')
    setPending(true)

    try {
      const username = inviteUsername.trim().toLowerCase()
      if (!username) {
        setMessage(isGreek ? 'Πληκτρολόγησε username για πρόσκληση.' : 'Enter a username to invite.')
        return
      }

      if (!selectedOwnedTeamId) {
        setMessage(isGreek ? 'Διάλεξε πρώτα μία από τις ομάδες σου.' : 'Select one of your teams first.')
        return
      }

      await onInviteUser({ username, teamId: selectedOwnedTeamId })
      setInviteUsername('')
      setMessage(isGreek ? `Η πρόσκληση στάλθηκε στον @${username}.` : `Invite sent to @${username}.`)
    } catch (error) {
      setMessage(error?.message || (isGreek ? 'Αποτυχία αποστολής πρόσκλησης.' : 'Failed to send invite.'))
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="rounded-2xl border border-blue-900/60 bg-slate-900/70 p-6">
      <h2 className="text-2xl font-semibold text-white">{isGreek ? 'Διαχείριση Ομάδων' : 'Manage Teams'}</h2>
      <p className="mt-1 text-sm text-blue-100/80">
        {isGreek
          ? 'Δημιούργησε μία ή περισσότερες ομάδες και κάλεσε φίλους με username σε όποια ομάδα έχεις.'
          : 'Create one or more teams, and invite friends by username to any team you own.'}
      </p>

      <form className="mt-6 space-y-4" onSubmit={onCreateSubmit}>
        <div>
          <label htmlFor="teamName" className="mb-1 block text-sm text-blue-100">
            {isGreek ? 'Νέο όνομα ομάδας' : 'New team name'}
          </label>
          <input
            id="teamName"
            value={teamName}
            onChange={(event) => setTeamName(event.target.value)}
            placeholder={isGreek ? 'Θρύλοι Ενωμένοι' : 'Legends United'}
            className="w-full rounded-lg border border-blue-900/80 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-600/30"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 px-5 py-2 font-semibold text-white hover:from-blue-600 hover:to-blue-400 disabled:opacity-60"
        >
          {pending ? (isGreek ? 'Δημιουργία...' : 'Creating...') : isGreek ? 'Δημιουργία Ομάδας' : 'Create Team'}
        </button>
      </form>

      <form className="mt-8 space-y-4" onSubmit={onInviteSubmit}>
        <div>
          <label htmlFor="ownedTeam" className="mb-1 block text-sm text-blue-100">
            {isGreek ? 'Πρόσκληση σε ομάδα' : 'Invite to team'}
          </label>
          <select
            id="ownedTeam"
            value={selectedOwnedTeamId || ''}
            onChange={(event) => onSelectOwnedTeam(Number(event.target.value))}
            className="w-full rounded-lg border border-blue-900/80 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-600/30"
          >
            {!ownedTeams.length && <option value="">{isGreek ? 'Δεν έχεις ομάδα ακόμη' : 'No owned teams yet'}</option>}
            {ownedTeams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="inviteUsername" className="mb-1 block text-sm text-blue-100">
            {isGreek ? 'Πρόσκληση με username' : 'Invite by username'}
          </label>
          <input
            id="inviteUsername"
            value={inviteUsername}
            onChange={(event) => setInviteUsername(event.target.value)}
            placeholder={isGreek ? 'username_φίλου' : 'friend_username'}
            className="w-full rounded-lg border border-blue-900/80 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-600/30"
          />
        </div>

        <button
          type="submit"
          disabled={pending || !canInvite}
          className="rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 px-5 py-2 font-semibold text-white hover:from-blue-600 hover:to-blue-400 disabled:opacity-60"
        >
          {pending ? (isGreek ? 'Αποστολή...' : 'Sending...') : isGreek ? 'Αποστολή Πρόσκλησης' : 'Send Invite'}
        </button>
      </form>

      {message && <p className="mt-4 text-sm text-blue-100">{message}</p>}
    </section>
  )
}

export default CreateTeamView
