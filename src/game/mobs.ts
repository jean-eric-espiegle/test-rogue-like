import { Mob, Stats } from './types';
import { rng, uid } from './utils';
import { Vec2 } from './types';
import { ItemRarity } from './types';

interface MobTemplate {
  name: string;
  symbol: string;
  color: string;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  baseSpd: number;
  xpBase: number;
  goldBase: number;
  lootTable: ItemRarity[];
  isBoss?: boolean;
}

const NORMAL_MOBS: MobTemplate[] = [
  { name: 'Goblin',    symbol: 'g', color: '#4caf50', baseHp: 12, baseAtk: 4,  baseDef: 1, baseSpd: 8,  xpBase: 10, goldBase: 3, lootTable: ['common', 'uncommon'] },
  { name: 'Rat',       symbol: 'r', color: '#795548', baseHp: 8,  baseAtk: 3,  baseDef: 0, baseSpd: 12, xpBase: 6,  goldBase: 1, lootTable: ['common'] },
  { name: 'Skeleton',  symbol: 's', color: '#e0e0e0', baseHp: 15, baseAtk: 5,  baseDef: 2, baseSpd: 6,  xpBase: 12, goldBase: 4, lootTable: ['common', 'uncommon'] },
  { name: 'Orc',       symbol: 'o', color: '#66bb6a', baseHp: 22, baseAtk: 7,  baseDef: 3, baseSpd: 5,  xpBase: 18, goldBase: 6, lootTable: ['uncommon', 'rare'] },
  { name: 'Zombie',    symbol: 'z', color: '#a5d6a7', baseHp: 18, baseAtk: 4,  baseDef: 2, baseSpd: 3,  xpBase: 14, goldBase: 3, lootTable: ['common', 'uncommon'] },
  { name: 'Bat',       symbol: 'b', color: '#9575cd', baseHp: 7,  baseAtk: 3,  baseDef: 0, baseSpd: 15, xpBase: 8,  goldBase: 2, lootTable: ['common'] },
  { name: 'Troll',     symbol: 'T', color: '#8bc34a', baseHp: 35, baseAtk: 9,  baseDef: 4, baseSpd: 4,  xpBase: 28, goldBase: 10, lootTable: ['uncommon', 'rare'] },
  { name: 'Mage',      symbol: 'M', color: '#42a5f5', baseHp: 16, baseAtk: 10, baseDef: 1, baseSpd: 7,  xpBase: 22, goldBase: 8, lootTable: ['uncommon', 'rare', 'epic'] },
  { name: 'Mimic',     symbol: '?', color: '#ffa726', baseHp: 25, baseAtk: 8,  baseDef: 5, baseSpd: 6,  xpBase: 30, goldBase: 15, lootTable: ['rare', 'epic'] },
];

const BOSS_MOBS: MobTemplate[] = [
  { name: 'Dungeon Warden',  symbol: 'W', color: '#ef5350', baseHp: 80,  baseAtk: 18, baseDef: 8,  baseSpd: 6,  xpBase: 120, goldBase: 50,  lootTable: ['rare', 'epic', 'legendary'], isBoss: true },
  { name: 'Shadow Dragon',   symbol: 'D', color: '#7e57c2', baseHp: 120, baseAtk: 24, baseDef: 10, baseSpd: 8,  xpBase: 200, goldBase: 80,  lootTable: ['epic', 'legendary'], isBoss: true },
  { name: 'Lich King',       symbol: 'L', color: '#b39ddb', baseHp: 100, baseAtk: 22, baseDef: 6,  baseSpd: 10, xpBase: 180, goldBase: 70,  lootTable: ['epic', 'legendary'], isBoss: true },
  { name: 'Demon Overlord',  symbol: 'Ω', color: '#ff5722', baseHp: 150, baseAtk: 30, baseDef: 12, baseSpd: 9,  xpBase: 300, goldBase: 120, lootTable: ['legendary'], isBoss: true },
];

function scaleMob(t: MobTemplate, floor: number): Stats {
  const scale = 1 + (floor - 1) * 0.15;
  const hp = Math.round(t.baseHp * scale * rng(90, 110) / 100);
  return {
    maxHp: hp,
    hp,
    attack: Math.round(t.baseAtk * scale),
    defense: Math.round(t.baseDef * scale),
    speed: t.baseSpd,
    critChance: 5,
    critDamage: 150,
  };
}

export function spawnMob(pos: Vec2, floor: number, isBoss = false): Mob {
  const pool = isBoss ? BOSS_MOBS : NORMAL_MOBS;
  const bossIndex = (floor - 1) % BOSS_MOBS.length;
  const template = isBoss ? BOSS_MOBS[bossIndex] : pool[rng(0, pool.length - 1)];
  const stats = scaleMob(template, floor);
  return {
    id: uid(),
    name: template.name,
    pos: { ...pos },
    stats,
    xpReward: Math.round(template.xpBase * (1 + (floor - 1) * 0.2)),
    goldReward: rng(1, 3) * template.goldBase,
    symbol: template.symbol,
    color: template.color,
    isBoss: template.isBoss ?? false,
    lootTable: template.lootTable,
  };
}
