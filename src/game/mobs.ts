import { Mob, Stats, ItemRarity } from './types';
import { rng, uid, pick } from './utils';

interface MobTemplate {
  name: string; symbol: string; color: string;
  baseHp: number; baseAtk: number; baseDef: number; baseSpd: number;
  xpBase: number; goldBase: number; lootTable: ItemRarity[];
  isBoss?: boolean; isElite?: boolean;
}

const NORMAL: MobTemplate[] = [
  { name: 'Goblin',    symbol: 'g', color: '#4caf50', baseHp: 12, baseAtk: 4,  baseDef: 1, baseSpd: 8,  xpBase: 10, goldBase: 3,  lootTable: ['common', 'uncommon'] },
  { name: 'Rat',       symbol: 'r', color: '#a1887f', baseHp: 8,  baseAtk: 3,  baseDef: 0, baseSpd: 12, xpBase: 6,  goldBase: 1,  lootTable: ['common'] },
  { name: 'Skeleton',  symbol: 's', color: '#e0e0e0', baseHp: 15, baseAtk: 5,  baseDef: 2, baseSpd: 6,  xpBase: 12, goldBase: 4,  lootTable: ['common', 'uncommon'] },
  { name: 'Orc',       symbol: 'o', color: '#66bb6a', baseHp: 22, baseAtk: 7,  baseDef: 3, baseSpd: 5,  xpBase: 18, goldBase: 6,  lootTable: ['uncommon', 'rare'] },
  { name: 'Zombie',    symbol: 'z', color: '#a5d6a7', baseHp: 18, baseAtk: 4,  baseDef: 2, baseSpd: 3,  xpBase: 14, goldBase: 3,  lootTable: ['common', 'uncommon'] },
  { name: 'Bat',       symbol: 'b', color: '#9575cd', baseHp: 7,  baseAtk: 3,  baseDef: 0, baseSpd: 15, xpBase: 8,  goldBase: 2,  lootTable: ['common'] },
  { name: 'Slime',     symbol: 'S', color: '#aed581', baseHp: 20, baseAtk: 4,  baseDef: 3, baseSpd: 3,  xpBase: 10, goldBase: 2,  lootTable: ['common'] },
  { name: 'Bandit',    symbol: 'B', color: '#ffb74d', baseHp: 14, baseAtk: 6,  baseDef: 1, baseSpd: 9,  xpBase: 14, goldBase: 7,  lootTable: ['common', 'uncommon'] },
];

const ELITES: MobTemplate[] = [
  { name: 'Troll',     symbol: 'T', color: '#8bc34a', baseHp: 45, baseAtk: 10, baseDef: 5, baseSpd: 4,  xpBase: 40, goldBase: 14, lootTable: ['uncommon', 'rare'], isElite: true },
  { name: 'Mage',      symbol: 'M', color: '#42a5f5', baseHp: 30, baseAtk: 14, baseDef: 1, baseSpd: 8,  xpBase: 45, goldBase: 16, lootTable: ['uncommon', 'rare', 'epic'], isElite: true },
  { name: 'Mimic',     symbol: '?', color: '#ffa726', baseHp: 35, baseAtk: 11, baseDef: 6, baseSpd: 6,  xpBase: 50, goldBase: 20, lootTable: ['rare', 'epic'], isElite: true },
  { name: 'Wraith',    symbol: 'W', color: '#b39ddb', baseHp: 28, baseAtk: 13, baseDef: 2, baseSpd: 11, xpBase: 42, goldBase: 15, lootTable: ['uncommon', 'rare'], isElite: true },
];

const BOSSES: MobTemplate[] = [
  { name: 'Dungeon Warden', symbol: 'W', color: '#ef5350', baseHp: 80,  baseAtk: 18, baseDef: 8,  baseSpd: 6,  xpBase: 120, goldBase: 50,  lootTable: ['rare', 'epic', 'legendary'], isBoss: true },
  { name: 'Shadow Dragon',  symbol: 'D', color: '#7e57c2', baseHp: 120, baseAtk: 24, baseDef: 10, baseSpd: 8,  xpBase: 200, goldBase: 80,  lootTable: ['epic', 'legendary'], isBoss: true },
  { name: 'Lich King',      symbol: 'L', color: '#b39ddb', baseHp: 100, baseAtk: 22, baseDef: 6,  baseSpd: 10, xpBase: 180, goldBase: 70,  lootTable: ['epic', 'legendary'], isBoss: true },
  { name: 'Demon Overlord', symbol: 'X', color: '#ff5722', baseHp: 150, baseAtk: 30, baseDef: 12, baseSpd: 9,  xpBase: 300, goldBase: 120, lootTable: ['legendary'], isBoss: true },
];

function scaleStats(t: MobTemplate, floor: number): Stats {
  const scale = 1 + (floor - 1) * 0.18;
  const hp = Math.round(t.baseHp * scale * rng(90, 110) / 100);
  return { maxHp: hp, hp, attack: Math.round(t.baseAtk * scale), defense: Math.round(t.baseDef * scale), speed: t.baseSpd, critChance: 5, critDamage: 150 };
}

export function spawnMob(floor: number, type: 'normal' | 'elite' | 'boss'): Mob {
  const pool = type === 'boss' ? BOSSES : type === 'elite' ? ELITES : NORMAL;
  const template = type === 'boss' ? BOSSES[(floor - 1) % BOSSES.length] : pick(pool);
  const stats = scaleStats(template, floor);
  return {
    id: uid(), name: template.name, stats,
    xpReward: Math.round(template.xpBase * (1 + (floor - 1) * 0.2)),
    goldReward: rng(1, 3) * template.goldBase,
    symbol: template.symbol, color: template.color,
    isBoss: template.isBoss ?? false,
    lootTable: template.lootTable,
    intent: 'attack',
  };
}
