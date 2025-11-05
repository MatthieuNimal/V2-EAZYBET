import { useMatchStatusStore, useUserBetsStore, useUserStore, useBadgeStore, BetType } from './store';

export function simulateMatchResults() {
  const matchStatusStore = useMatchStatusStore.getState();
  const userBetsStore = useUserBetsStore.getState();
  const userStore = useUserStore.getState();
  const badgeStore = useBadgeStore.getState();

  const pendingBets = userBetsStore.bets.filter(bet => bet.status === 'pending');

  if (pendingBets.length === 0) return;

  const randomBet = pendingBets[Math.floor(Math.random() * pendingBets.length)];

  const winningSelectionIndex = Math.floor(Math.random() * randomBet.selections.length);
  const winningSelection = randomBet.selections[winningSelectionIndex];
  const winningBetType: BetType = ['home', 'draw', 'away'][Math.floor(Math.random() * 3)] as BetType;

  randomBet.selections.forEach(selection => {
    matchStatusStore.setMatchStatus(selection.match.id, 'finished');
  });

  const won = randomBet.type === 'simple'
    ? randomBet.selections[0].betType === winningBetType
    : randomBet.selections.every((_, index) => {
        const randomResult: BetType = ['home', 'draw', 'away'][Math.floor(Math.random() * 3)] as BetType;
        return randomBet.selections[index].betType === randomResult;
      });

  userBetsStore.updateBetStatus(randomBet.id, won ? 'won' : 'lost');

  if (won) {
    if (randomBet.currency === 'coins') {
      userStore.addCoins(randomBet.potentialWin);
      if (randomBet.potentialDiamonds > 0) {
        userStore.addDiamonds(randomBet.potentialDiamonds);
      }
    } else {
      userStore.addDiamonds(randomBet.potentialWin);
    }
  }

  badgeStore.setHasNewResult(true);

  console.log(`Bet ${randomBet.id} finished. Status: ${won ? 'WON' : 'LOST'}. Type: ${randomBet.type}.`);
}

let simulationInterval: NodeJS.Timeout | null = null;

export function startMatchSimulation(intervalMs: number = 30000) {
  if (simulationInterval) {
    clearInterval(simulationInterval);
  }

  simulationInterval = setInterval(() => {
    simulateMatchResults();
  }, intervalMs);

  console.log(`Match simulation started. Will simulate every ${intervalMs / 1000} seconds.`);
}

export function stopMatchSimulation() {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
    console.log('Match simulation stopped.');
  }
}
