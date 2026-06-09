import { Stats, CombatLog, Item } from './types';
import { rng, uid } from './utils';

export interface CombatResult {
  log: CombatLog[];
  playerHpDelta: number;
  mobHpDelta: number;
  mobDead: boolean;
  playerDead: boolean;
}

function calcDamage(atk: number, def: number, critChance: number, critDmg: number): { dmg: number; crit: boolean } {
  const base = Math.max(1, atk - def + rng(-2, 3));
  const crit = Math.random() * 100 < critChance;
  const dmg = crit ? Math.round(base * critDmg / 100) : base;
  return { dmg, crit };
}

export function simulateCombatRound(
  playerStats: Stats,
  mobStats: Stats,
  mobName: string
): CombatResult {
  const log: CombatLog[] = [];
  let playerHpDelta = 0;
  let mobHpDelta = 0;

  // Determine who goes first based on speed
  const playerFirst = playerStats.speed >= mobStats.speed;

  const doPlayerAttack = () => {
    const { dmg, crit } = calcDamage(playerStats.attack, mobStats.defense, playerStats.critChance, playerStats.critDamage);
    mobHpDelta -= dmg;
    const critText = crit ? ' CRITICAL HIT!' : '';
    log.push({ id: uid(), text: `You strike ${mobName} for ${dmg} damage.${critText}`, type: 'player' });
  };

  const doMobAttack = () => {
    const { dmg, crit } = calcDamage(mobStats.attack, playerStats.defense, mobStats.critChance, mobStats.critDamage);
    playerHpDelta -= dmg;
    const critText = crit ? ' CRITICAL HIT!' : '';
    log.push({ id: uid(), text: `${mobName} strikes you for ${dmg} damage.${critText}`, type: 'enemy' });
  };

  if (playerFirst) {
    doPlayerAttack();
    const mobCurrentHp = mobStats.hp + mobHpDelta;
    if (mobCurrentHp > 0) doMobAttack();
  } else {
    doMobAttack();
    const playerCurrentHp = playerStats.hp + playerHpDelta;
    if (playerCurrentHp > 0) doPlayerAttack();
  }

  const mobDead = mobStats.hp + mobHpDelta <= 0;
  const playerDead = playerStats.hp + playerHpDelta <= 0;

  return { log, playerHpDelta, mobHpDelta, mobDead, playerDead };
}

export function getEquippedStats(baseStats: Stats, equipment: { [key: string]: Item | null | undefined }): Stats {
  const stats = { ...baseStats };
  for (const item of Object.values(equipment)) {
    if (!item) continue;
    for (const [k, v] of Object.entries(item.stats)) {
      if (k === 'maxHp') { stats.maxHp += v as number; stats.hp = Math.min(stats.hp + (v as number), stats.maxHp); }
      else (stats as any)[k] += v as number;
    }
  }
  return stats;
}

export function xpForLevel(level: number): number {
  return Math.round(20 * Math.pow(1.5, level - 1));
}
