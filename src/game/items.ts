import { Item, ItemRarity, ItemSlot, StatName } from './types';
import { rng, rngFloat, uid, pick } from './utils';

const RARITY_COLORS: Record<ItemRarity, string> = {
  common: '#aaa',
  uncommon: '#4caf50',
  rare: '#2196f3',
  epic: '#9c27b0',
  legendary: '#ff9800',
};

const RARITY_MULTIPLIER: Record<ItemRarity, number> = {
  common: 1,
  uncommon: 1.4,
  rare: 2,
  epic: 3,
  legendary: 5,
};

const RARITY_WEIGHTS: [ItemRarity, number][] = [
  ['common', 60],
  ['uncommon', 25],
  ['rare', 10],
  ['epic', 4],
  ['legendary', 1],
];

export function rollRarity(boost = 0): ItemRarity {
  const total = RARITY_WEIGHTS.reduce((s, [, w]) => s + w, 0);
  let r = rngFloat(0, total - boost);
  for (const [rarity, weight] of RARITY_WEIGHTS) {
    r -= weight;
    if (r <= 0) return rarity;
  }
  return 'common';
}

export { RARITY_COLORS };

const WEAPON_NAMES = ['Sword', 'Axe', 'Dagger', 'Mace', 'Spear', 'Bow', 'Staff', 'Scythe'];
const ARMOR_NAMES = ['Plate', 'Chainmail', 'Leather', 'Robe', 'Cloak', 'Shield'];
const RING_NAMES = ['Ring of Power', 'Signet', 'Band', 'Loop', 'Circlet'];
const AMULET_NAMES = ['Amulet', 'Pendant', 'Necklace', 'Charm', 'Talisman'];
const PREFIXES = ['', 'Ancient ', 'Cursed ', 'Divine ', 'Shadow ', 'Storm ', 'Flame ', 'Frost '];

const SLOT_STATS: Record<ItemSlot, StatName[]> = {
  weapon: ['attack', 'critChance', 'critDamage', 'speed'],
  armor: ['maxHp', 'defense', 'speed'],
  ring: ['attack', 'defense', 'critChance', 'maxHp'],
  amulet: ['critDamage', 'attack', 'maxHp', 'defense'],
  potion: ['maxHp'],
};

function statLabel(stat: StatName, val: number): string {
  const map: Record<StatName, string> = {
    maxHp: `+${val} Max HP`,
    attack: `+${val} Attack`,
    defense: `+${val} Defense`,
    speed: `+${val} Speed`,
    critChance: `+${val}% Crit Chance`,
    critDamage: `+${val}% Crit Damage`,
  };
  return map[stat];
}

export function generateItem(floor: number, forcedRarity?: ItemRarity, forceSlot?: ItemSlot): Item {
  const slot: ItemSlot = forceSlot ?? pick(['weapon', 'armor', 'ring', 'amulet'] as ItemSlot[]);
  const rarity = forcedRarity ?? rollRarity();
  const level = Math.max(1, floor + rng(-1, 1));
  const mult = RARITY_MULTIPLIER[rarity];

  const nameList =
    slot === 'weapon' ? WEAPON_NAMES :
    slot === 'armor' ? ARMOR_NAMES :
    slot === 'ring' ? RING_NAMES : AMULET_NAMES;

  const name = pick(PREFIXES) + pick(nameList);

  const possibleStats = SLOT_STATS[slot];
  const numStats = slot === 'weapon' || slot === 'armor' ? rng(1, 3) : rng(1, 2);
  const chosenStats = [...possibleStats].sort(() => Math.random() - 0.5).slice(0, numStats);

  const stats: Partial<Record<StatName, number>> = {};
  for (const stat of chosenStats) {
    const base = stat === 'maxHp' ? rng(5, 15) :
                 stat === 'critChance' || stat === 'critDamage' ? rng(2, 8) :
                 rng(1, 5);
    stats[stat] = Math.round(base * mult * (1 + level * 0.1));
  }

  const description = Object.entries(stats)
    .map(([k, v]) => statLabel(k as StatName, v as number))
    .join(', ');

  const value = Math.round(10 * mult * level);

  return { id: uid(), name, slot, rarity, level, stats, description, value };
}

export function generatePotion(floor: number): Item {
  const healAmt = Math.round((10 + floor * 3) * rngFloat(0.8, 1.2));
  return {
    id: uid(),
    name: 'Health Potion',
    slot: 'potion',
    rarity: 'common',
    level: floor,
    stats: { maxHp: healAmt },
    description: `Restores ${healAmt} HP`,
    value: 5 + floor * 2,
  };
}
