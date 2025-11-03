import { Match } from './mock-data';
import { useMatchStatusStore } from './store';

export function getMatchWithStatus(match: Match): Match {
  const matchStatusStore = useMatchStatusStore.getState();
  const customStatus = matchStatusStore.getMatchStatus(match.id);

  if (customStatus) {
    return { ...match, status: customStatus };
  }

  return match;
}

export function getFilteredMatches(matches: Match[], status: Match['status']): Match[] {
  const matchStatusStore = useMatchStatusStore.getState();

  return matches
    .map(match => {
      const customStatus = matchStatusStore.getMatchStatus(match.id);
      return customStatus ? { ...match, status: customStatus } : match;
    })
    .filter(match => match.status === status);
}
