import { Card, createDeck, determineResult, GameResult } from './types/game';

// Seeded RNG: Mulberry32
function seededRandom(a: number) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

// Draw a specific card deterministically based on seed
export function getDeterministicCards(roundId: number, seed?: number): { dragonCard: Card, tigerCard: Card } {
  const rng = seededRandom(seed || roundId);
  const deck = createDeck();
  
  const dIndex = Math.floor(rng() * deck.length);
  let dragonCard = deck.splice(dIndex, 1)[0];
  
  const tIndex = Math.floor(rng() * deck.length);
  let tigerCard = deck.splice(tIndex, 1)[0];

  // Apply Admin Forced Outcome
  try {
    const settingsStr = localStorage.getItem('dragonTigerAdminSettings') || '{}';
    const settings = JSON.parse(settingsStr);
    let forcedOutcome = 'none';

    // To prevent race conditions across tabs consuming the same queue, we just peek it?
    // No, we must consume it so next round uses the next one.
    // We'll record which round consumed it to prevent double consumption.
    if (settings.lastConsumedRound !== roundId && Array.isArray(settings.forcedOutcomes) && settings.forcedOutcomes.length > 0) {
      forcedOutcome = settings.forcedOutcomes.shift();
      settings.lastConsumedRound = roundId;
      localStorage.setItem('dragonTigerAdminSettings', JSON.stringify(settings));
    }

    if (forcedOutcome === 'dragon') {
      while (dragonCard.value <= tigerCard.value) {
        dragonCard = deck[Math.floor(rng() * deck.length)];
        tigerCard = deck[Math.floor(rng() * deck.length)];
      }
    } else if (forcedOutcome === 'tiger') {
      while (tigerCard.value <= dragonCard.value) {
        dragonCard = deck[Math.floor(rng() * deck.length)];
        tigerCard = deck[Math.floor(rng() * deck.length)];
      }
    } else if (forcedOutcome === 'tie') {
      while (dragonCard.value !== tigerCard.value || (tigerCard.rank === dragonCard.rank && tigerCard.suit === dragonCard.suit)) {
        dragonCard = deck[Math.floor(rng() * deck.length)];
        tigerCard = deck[Math.floor(rng() * deck.length)];
      }
    }
  } catch (e) {
    // Ignore settings error
  }

  return { dragonCard, tigerCard };
}

export function getForcedDeterministicCards(roundId: number, seed: number | undefined, forcedOutcome: string): { dragonCard: Card, tigerCard: Card } {
  let { dragonCard, tigerCard } = getDeterministicCards(roundId, seed);
  
  if (forcedOutcome === 'dragon' || forcedOutcome === 'tiger' || forcedOutcome === 'tie') {
    const rng = seededRandom((seed || roundId) + 1000); // Offset seed for consistent override
    const deck = createDeck();
    
    if (forcedOutcome === 'dragon') {
      while (dragonCard.value <= tigerCard.value) {
        dragonCard = deck[Math.floor(rng() * deck.length)];
        tigerCard = deck[Math.floor(rng() * deck.length)];
      }
    } else if (forcedOutcome === 'tiger') {
      while (tigerCard.value <= dragonCard.value) {
        dragonCard = deck[Math.floor(rng() * deck.length)];
        tigerCard = deck[Math.floor(rng() * deck.length)];
      }
    } else if (forcedOutcome === 'tie') {
      while (dragonCard.value !== tigerCard.value || (tigerCard.rank === dragonCard.rank && tigerCard.suit === dragonCard.suit)) {
        dragonCard = deck[Math.floor(rng() * deck.length)];
        tigerCard = deck[Math.floor(rng() * deck.length)];
      }
    }
  }
  
  return { dragonCard, tigerCard };
}

let timeOffset = 0;

export function setTimeOffset(offset: number) {
  timeOffset = offset;
}

export function getGlobalGameState() {
  const ROUND_DURATION_MS = 20000;
  const BETTING_DURATION_MS = 15000;
  
  const now = Date.now() + timeOffset;
  const rawRoundId = Math.floor(now / ROUND_DURATION_MS);
  const roundId = (rawRoundId % 2000) + 1;
  const timeInRound = now % ROUND_DURATION_MS;
  
  const timer = Math.max(0, Math.ceil((BETTING_DURATION_MS - timeInRound) / 1000));
  const phase = timeInRound < BETTING_DURATION_MS ? 'betting' : (timeInRound < BETTING_DURATION_MS + 2000 ? 'dealing' : 'result');
  
  return {
    roundId,
    rawRoundId,
    timer,
    phase
  };
}
