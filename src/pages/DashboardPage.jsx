import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-react'

import { API_BASE_URL } from '../lib/api.js'
import SideMenu from '../features/dashboard/components/SideMenu.jsx'
import CreateTeamView from '../features/dashboard/views/CreateTeamView.jsx'
import GlobalRankingView from '../features/dashboard/views/GlobalRankingView.jsx'
import GroupsView from '../features/dashboard/views/GroupsView.jsx'
import GuessingView from '../features/dashboard/views/GuessingView.jsx'
import InvitesView from '../features/dashboard/views/InvitesView.jsx'
import LiveScoreView from '../features/dashboard/views/LiveScoreView.jsx'
import RankingHubView from '../features/dashboard/views/RankingHubView.jsx'
import RulesView from '../features/dashboard/views/RulesView.jsx'
import TeamRankingView from '../features/dashboard/views/TeamRankingView.jsx'

const AUTO_LIVE_SYNC_MS = 30000
const AUTO_GROUPS_REFRESH_MS = 45000
const AUTO_LIVESCORE_REFRESH_MS = 20000

function toSafeErrorMessage(body, response) {
  if (response.status >= 500) {
    return 'Server error. Please try again.'
  }
  const message = typeof body?.message === 'string' ? body.message.trim() : ''
  if (!message) {
    return 'Request failed'
  }
  if (message.length > 140 || /failed \(\d{3}\)|<html|stack|syntaxerror/i.test(message)) {
    return 'Request failed. Please try again.'
  }
  return message
}

function DashboardContent() {
  const { getToken, signOut } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [data, setData] = useState(null)
  const [globalRanking, setGlobalRanking] = useState([])
  const [guessingData, setGuessingData] = useState({ matchday: 1, maxMatchday: 1, matches: [] })
  const [guessingViewKey, setGuessingViewKey] = useState('1:0')
  const [teams, setTeams] = useState([])
  const [ownedTeamIds, setOwnedTeamIds] = useState([])
  const [selectedTeamId, setSelectedTeamId] = useState(null)
  const [selectedOwnedTeamId, setSelectedOwnedTeamId] = useState(null)
  const [invites, setInvites] = useState([])
  const [groupsData, setGroupsData] = useState([])
  const [groupsUpdatedAt, setGroupsUpdatedAt] = useState(null)
  const [groupsLoading, setGroupsLoading] = useState(false)
  const [liveMatches, setLiveMatches] = useState([])
  const [liveMatchesUpdatedAt, setLiveMatchesUpdatedAt] = useState(null)
  const [liveMatchesLoading, setLiveMatchesLoading] = useState(false)
  const [syncingLive, setSyncingLive] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('ranking')
  const [rankingView, setRankingView] = useState('chooser')
  const liveSyncInFlightRef = useRef(false)

  const applyGuessingBody = useCallback((guessingBody) => {
    const nextMatchday = guessingBody.matchday || 1
    const nextMatches = guessingBody.matches || []
    setGuessingData({
      matchday: nextMatchday,
      maxMatchday: guessingBody.maxMatchday || 1,
      matches: nextMatches,
    })
    setGuessingViewKey(`${nextMatchday}:${Date.now()}`)
  }, [])

  const fetchWithAuth = useCallback(async (path, init = {}) => {
    const token = await getToken()
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init.headers || {}),
      },
    })
    const body = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(toSafeErrorMessage(body, response))
    }
    return body
  }, [getToken])

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true)
      setError('')
      try {
        const [dashboardBody, guessingBody] = await Promise.all([
          fetchWithAuth('/api/dashboard'),
          fetchWithAuth('/api/guessing/matches?matchday=1'),
        ])

        setData(dashboardBody)
        applyGuessingBody(guessingBody)
        setLoading(false)

        try {
          const [rankingBody, teamBody, invitesBody] = await Promise.all([
            fetchWithAuth('/api/rankings/global'),
            fetchWithAuth('/api/teams/me'),
            fetchWithAuth('/api/teams/invites'),
          ])

          setGlobalRanking(rankingBody.entries || [])
          setTeams(teamBody.teams || [])
          setOwnedTeamIds(teamBody.ownedTeamIds || [])
          setSelectedTeamId((prev) => prev ?? teamBody.teams?.[0]?.id ?? null)
          setSelectedOwnedTeamId((prev) => prev ?? teamBody.ownedTeamIds?.[0] ?? null)
          setInvites(invitesBody.invites || [])
        } catch {
          setActionError('Some sections could not refresh. Please retry.')
        }
      } catch (err) {
        setError(err?.message || 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [applyGuessingBody, fetchWithAuth])

  useEffect(() => {
    document.title = 'Dashboard | CrownKick League'
  }, [])

  function handleChangeTab(tabId) {
    setActiveTab(tabId)
    if (tabId === 'ranking') {
      setRankingView('chooser')
    }
    if (tabId === 'groups' && groupsData.length === 0) {
      void loadGroupsStandings()
    }
    if (tabId === 'livescore' && liveMatches.length === 0) {
      void loadLiveMatches()
    }
  }

  const loadGroupsStandings = useCallback(async () => {
    setGroupsLoading(true)
    try {
      const body = await fetchWithAuth('/api/guessing/groups')
      setGroupsData(body.groups || [])
      setGroupsUpdatedAt(body.updatedAt || new Date().toISOString())
    } catch (err) {
      setActionError(err?.message || 'Failed to load group standings.')
    } finally {
      setGroupsLoading(false)
    }
  }, [fetchWithAuth])

  const loadLiveMatches = useCallback(async () => {
    setLiveMatchesLoading(true)
    try {
      const body = await fetchWithAuth('/api/guessing/live')
      setLiveMatches(body.matches || [])
      setLiveMatchesUpdatedAt(body.updatedAt || new Date().toISOString())
    } catch (err) {
      setActionError(err?.message || 'Failed to load live matches.')
    } finally {
      setLiveMatchesLoading(false)
    }
  }, [fetchWithAuth])

  const syncLiveSilently = useCallback(async () => {
    if (liveSyncInFlightRef.current) return
    liveSyncInFlightRef.current = true
    try {
      await fetchWithAuth('/api/guessing/sync/live', { method: 'POST' })
      const guessingBody = await fetchWithAuth(`/api/guessing/matches?matchday=${guessingData.matchday}`)
      applyGuessingBody(guessingBody)
    } catch {
      // Keep silent for background refresh.
    } finally {
      liveSyncInFlightRef.current = false
    }
  }, [applyGuessingBody, fetchWithAuth, guessingData.matchday])

  useEffect(() => {
    if (activeTab !== 'guessing') return
    void syncLiveSilently()
    const intervalId = setInterval(() => {
      void syncLiveSilently()
    }, AUTO_LIVE_SYNC_MS)
    return () => clearInterval(intervalId)
  }, [activeTab, syncLiveSilently])

  useEffect(() => {
    if (activeTab !== 'livescore') return

    const syncAndLoad = async () => {
      await syncLiveSilently()
      await loadLiveMatches()
    }

    void syncAndLoad()
    const intervalId = setInterval(() => {
      void syncAndLoad()
    }, AUTO_LIVESCORE_REFRESH_MS)
    return () => clearInterval(intervalId)
  }, [activeTab, loadLiveMatches, syncLiveSilently])

  useEffect(() => {
    if (activeTab !== 'groups') return
    void loadGroupsStandings()
    const intervalId = setInterval(() => {
      void loadGroupsStandings()
    }, AUTO_GROUPS_REFRESH_MS)
    return () => clearInterval(intervalId)
  }, [activeTab, loadGroupsStandings])

  async function handleSavePrediction(payload) {
    setActionError('')
    await fetchWithAuth('/api/guessing/predictions', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    const guessingBody = await fetchWithAuth(`/api/guessing/matches?matchday=${guessingData.matchday}`)
    applyGuessingBody(guessingBody)
  }

  async function handleChangeGuessingMatchday(nextDay) {
    const day = Math.max(1, Math.min(nextDay, guessingData.maxMatchday))
    const guessingBody = await fetchWithAuth(`/api/guessing/matches?matchday=${day}`)
    applyGuessingBody(guessingBody)
  }

  async function handleSyncLiveMatches() {
    if (liveSyncInFlightRef.current) return
    setActionError('')
    setSyncingLive(true)
    liveSyncInFlightRef.current = true
    try {
      await fetchWithAuth('/api/guessing/sync/live', {
        method: 'POST',
      })
      const guessingBody = await fetchWithAuth(`/api/guessing/matches?matchday=${guessingData.matchday}`)
      applyGuessingBody(guessingBody)
    } catch (err) {
      setActionError(err?.message || 'Failed to sync live matches.')
    } finally {
      liveSyncInFlightRef.current = false
      setSyncingLive(false)
    }
  }

  async function handleCreateTeam(teamName) {
    setActionError('')
    const body = await fetchWithAuth('/api/teams', {
      method: 'POST',
      body: JSON.stringify({ name: teamName }),
    })
    const teamBody = await fetchWithAuth('/api/teams/me')
    setTeams(teamBody.teams || [])
    setOwnedTeamIds(teamBody.ownedTeamIds || [])
    if (body.team?.id) {
      setSelectedTeamId(body.team.id)
      setSelectedOwnedTeamId(body.team.id)
    }
    setActiveTab('create-team')
  }

  async function handleInviteUser({ username, teamId }) {
    setActionError('')
    await fetchWithAuth('/api/teams/invite', {
      method: 'POST',
      body: JSON.stringify({ username, teamId }),
    })
  }

  async function handleAcceptInvite(inviteId) {
    setActionError('')
    try {
      await fetchWithAuth(`/api/teams/invites/${inviteId}/accept`, {
        method: 'POST',
      })

      const [teamBody, invitesBody] = await Promise.all([fetchWithAuth('/api/teams/me'), fetchWithAuth('/api/teams/invites')])
      setTeams(teamBody.teams || [])
      setOwnedTeamIds(teamBody.ownedTeamIds || [])
      setInvites(invitesBody.invites || [])
      if (teamBody.teams?.length) {
        setSelectedTeamId(teamBody.teams[0].id)
      }
      setActiveTab('ranking')
      setRankingView('team')
    } catch (err) {
      setActionError(err?.message || 'Failed to accept invite.')
    }
  }

  function handleLogout() {
    signOut(() => window.location.assign('/'))
  }

  const menuItems = [
    { id: 'ranking', label: 'Ranking' },
    { id: 'guessing', label: 'Guessing' },
    { id: 'livescore', label: 'LiveScore' },
    { id: 'groups', label: 'Groups' },
    { id: 'rules', label: 'Rules' },
    { id: 'create-team', label: 'Manage Teams' },
    ...(invites.length ? [{ id: 'invites', label: `Invites (${invites.length})` }] : []),
  ]

  const currentTitle =
    activeTab === 'ranking'
      ? 'Ranking'
      : activeTab === 'guessing'
      ? 'Guessing'
      : activeTab === 'groups'
      ? 'Groups'
      : activeTab === 'livescore'
      ? 'LiveScore'
      : activeTab === 'rules'
      ? 'Rules'
      : activeTab === 'invites'
      ? 'Invites'
      : 'Manage Teams'

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900 text-slate-100">
      <div className="flex min-h-screen w-full">
        <SideMenu items={menuItems} activeTab={activeTab} onChangeTab={handleChangeTab} onLogout={handleLogout} className="hidden w-72 md:flex" />

        <section className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-blue-900/60 bg-slate-950/90 px-4 py-3 backdrop-blur md:px-8">
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="rounded-md border border-blue-700/70 px-3 py-2 text-sm text-blue-100 md:hidden"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
              >
                {mobileMenuOpen ? 'Close' : 'Menu'}
              </button>
              <h1 className="text-lg font-semibold text-white md:text-2xl">{currentTitle}</h1>
              <p className="text-xs text-blue-100/80 md:text-sm">@{data?.user?.username || 'player'}</p>
            </div>
          </header>

          {mobileMenuOpen && (
            <div className="md:hidden">
              <div className="fixed inset-0 z-20 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
              <div className="fixed inset-y-0 left-0 z-30 w-72">
                <SideMenu
                  items={menuItems}
                  activeTab={activeTab}
                  onChangeTab={(tabId) => {
                    handleChangeTab(tabId)
                    setMobileMenuOpen(false)
                  }}
                  onLogout={handleLogout}
                />
              </div>
            </div>
          )}

          <div className="flex-1 p-4 md:p-8">
            {loading && <p className="text-blue-100/90">Loading dashboard...</p>}
            {error && <p className="text-red-400">{error}</p>}
            {!error && actionError && <p className="mb-4 text-red-400">{actionError}</p>}

            {!loading && !error && (
              <>
                {activeTab === 'ranking' && rankingView === 'chooser' && (
                  <RankingHubView
                    teams={teams}
                    onOpenGlobal={() => setRankingView('global')}
                    onOpenTeam={() => setRankingView('team')}
                  />
                )}
                {activeTab === 'ranking' && rankingView !== 'chooser' && (
                  <div className="mb-3">
                    <button
                      type="button"
                      onClick={() => setRankingView('chooser')}
                      className="rounded-full border border-blue-400/70 bg-blue-600/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-100 hover:bg-blue-500/30"
                    >
                      Back to ranking options
                    </button>
                  </div>
                )}
                {activeTab === 'ranking' && rankingView === 'global' && <GlobalRankingView entries={globalRanking} />}
                {activeTab === 'ranking' && rankingView === 'team' && teams.length > 0 && (
                  <TeamRankingView teams={teams} selectedTeamId={selectedTeamId} onSelectTeam={setSelectedTeamId} />
                )}
                {activeTab === 'ranking' && rankingView === 'team' && teams.length === 0 && (
                  <section className="rounded-2xl border border-blue-900/60 bg-slate-900/70 p-6">
                    <p className="text-blue-100/90">You are not in a team yet. Create one first.</p>
                  </section>
                )}
                {activeTab === 'guessing' && (
                  <GuessingView
                    key={guessingViewKey}
                    matchdayData={guessingData}
                    onChangeMatchday={handleChangeGuessingMatchday}
                    onSavePrediction={handleSavePrediction}
                    onSyncLive={handleSyncLiveMatches}
                    syncingLive={syncingLive}
                  />
                )}
                {activeTab === 'groups' && (
                  <GroupsView
                    groups={groupsData}
                    updatedAt={groupsUpdatedAt}
                    loading={groupsLoading}
                    onRefresh={loadGroupsStandings}
                  />
                )}
                {activeTab === 'livescore' && (
                  <LiveScoreView
                    matches={liveMatches}
                    updatedAt={liveMatchesUpdatedAt}
                    loading={liveMatchesLoading}
                    onRefresh={loadLiveMatches}
                  />
                )}
                {activeTab === 'rules' && <RulesView />}
                {activeTab === 'create-team' && (
                  <CreateTeamView
                    teams={teams}
                    ownedTeamIds={ownedTeamIds}
                    selectedOwnedTeamId={selectedOwnedTeamId}
                    onSelectOwnedTeam={setSelectedOwnedTeamId}
                    onCreateTeam={handleCreateTeam}
                    onInviteUser={handleInviteUser}
                  />
                )}
                {activeTab === 'invites' && <InvitesView invites={invites} onAcceptInvite={handleAcceptInvite} />}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

function DashboardPage() {
  return (
    <>
      <SignedIn>
        <DashboardContent />
      </SignedIn>
      <SignedOut>
        <Navigate to="/" replace />
      </SignedOut>
    </>
  )
}

export default DashboardPage
