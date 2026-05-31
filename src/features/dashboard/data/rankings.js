export function buildTeamRanking(team, globalEntries) {
  if (!team) return []

  const pointsMap = new Map(globalEntries.map((entry) => [entry.username, entry.points]))

  return team.members
    .map((member) => ({
      username: member,
      points: pointsMap.get(member) ?? 0,
    }))
    .sort((a, b) => b.points - a.points)
}
