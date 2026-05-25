export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
export type BetType = 'dragon' | 'tiger' | 'tie' | 'suited-tie' | 'dragon-odd' | 'dragon-even' | 'tiger-odd' | 'tiger-even' | 'dragon-red' | 'dragon-black' | 'tiger-red' | 'tiger-black';
export type GamePhase = 'betting' | 'dealing' | 'result' | 'idle';
export type GameResult = 'dragon' | 'tiger' | 'tie' | 'suited-tie' | null;

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
}

export interface Bet {
  type: BetType;
  amount: number;
  payout: number;
}

export interface GameState {
  phase: GamePhase;
  dragonCard: Card | null;
  tigerCard: Card | null;
  result: GameResult;
  bets: Partial<Record<BetType, number>>;
  balance: number;
  selectedChip: number;
  lastWin: number;
  totalBet: number;
  history: RoundResult[];
  timer: number;
  roundNumber: number;
  dealerMessage: string;
}

export interface RoundResult {
  id: number;
  dragonCard: Card;
  tigerCard: Card;
  result: GameResult;
  win: number;
}

export interface ChipValue {
  value: number;
  label: string;
  color: string;
  borderColor: string;
  textColor: string;
}

export const CHIP_VALUES: ChipValue[] = [
  { value: 10, label: '10', color: '#1a4a8e', borderColor: '#3498db', textColor: '#ffffff' },
  { value: 25, label: '25', color: '#1a6b2e', borderColor: '#27ae60', textColor: '#ffffff' },
  { value: 50, label: '50', color: '#7a3b8e', borderColor: '#9b59b6', textColor: '#ffffff' },
  { value: 100, label: '100', color: '#8e6b1a', borderColor: '#f39c12', textColor: '#ffffff' },
  { value: 500, label: '500', color: '#1a7a7a', borderColor: '#1abc9c', textColor: '#ffffff' },
  { value: 1000, label: '1K', color: '#1a1a1a', borderColor: '#d4a017', textColor: '#d4a017' },
];

export const BET_PAYOUTS: Record<BetType, number> = {
  'dragon': 1,
  'tiger': 1,
  'tie': 8,
  'suited-tie': 50,
  'dragon-odd': 0.75,
  'dragon-even': 0.75,
  'tiger-odd': 0.75,
  'tiger-even': 0.75,
  'dragon-red': 0.9,
  'dragon-black': 0.9,
  'tiger-red': 0.9,
  'tiger-black': 0.9,
};

export const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
export const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export function getCardValue(rank: Rank): number {
  if (rank === 'A') return 1;
  if (rank === 'J') return 11;
  if (rank === 'Q') return 12;
  if (rank === 'K') return 13;
  return parseInt(rank);
}

export function isRed(suit: Suit): boolean {
  return suit === '♥' || suit === '♦';
}

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, value: getCardValue(rank) });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function drawCard(): Card {
  const deck = shuffleDeck(createDeck());
  return deck[0];
}

export function determineResult(dragon: Card, tiger: Card): GameResult {
  if (dragon.value === tiger.value) {
    if (dragon.suit === tiger.suit) return 'suited-tie';
    return 'tie';
  }
  return dragon.value > tiger.value ? 'dragon' : 'tiger';
}

export function calculateWinnings(
  bets: Partial<Record<BetType, number>>,
  result: GameResult,
  dragonCard: Card,
  tigerCard: Card
): number {
  let total = 0;
  for (const [betType, amount] of Object.entries(bets) as [BetType, number][]) {
    if (!amount || amount <= 0) continue;
    const payout = BET_PAYOUTS[betType];
    let won = false;

    if (betType === 'dragon') won = result === 'dragon';
    else if (betType === 'tiger') won = result === 'tiger';
    else if (betType === 'tie') won = result === 'tie' || result === 'suited-tie';
    else if (betType === 'suited-tie') won = result === 'suited-tie';
    else if (betType === 'dragon-odd') won = result === 'dragon' && dragonCard.value % 2 !== 0;
    else if (betType === 'dragon-even') won = result === 'dragon' && dragonCard.value % 2 === 0;
    else if (betType === 'tiger-odd') won = result === 'tiger' && tigerCard.value % 2 !== 0;
    else if (betType === 'tiger-even') won = result === 'tiger' && tigerCard.value % 2 === 0;
    else if (betType === 'dragon-red') won = result === 'dragon' && isRed(dragonCard.suit);
    else if (betType === 'dragon-black') won = result === 'dragon' && !isRed(dragonCard.suit);
    else if (betType === 'tiger-red') won = result === 'tiger' && isRed(tigerCard.suit);
    else if (betType === 'tiger-black') won = result === 'tiger' && !isRed(tigerCard.suit);

    if (won) {
      total += amount + amount * payout;
    }
    // Dragon/Tiger bets return half on tie
    if ((betType === 'dragon' || betType === 'tiger') && (result === 'tie' || result === 'suited-tie')) {
      total += amount * 0.5;
    }
  }
  return total;
}
