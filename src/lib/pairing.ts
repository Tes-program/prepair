import type { Participant, Pair } from '@/types';

export function generatePairs(
  participants: Participant[],
  weekNumber: number,
): Omit<Pair, 'id' | 'created_at'>[] {
  const pool = [...participants];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const pairs: Omit<Pair, 'id' | 'created_at'>[] = [];

  for (let i = 0; i < pool.length - 1; i += 2) {
    pairs.push({
      week_number: weekNumber,
      member1: pool[i].name,
      member2: pool[i + 1].name,
    });
  }

  if (pool.length % 2 !== 0) {
    pairs.push({
      week_number: weekNumber,
      member1: pool[pool.length - 1].name,
      member2: 'TBD',
    });
  }

  return pairs;
}
