export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type ItemSlot = 'weapon' | 'armor' | 'ring' | 'amulet' | 'potion';
export type StatName = 'maxHp' | 'attack' | 'defense' | 'speed' | 'critChance' | 'critDamage';

export type RoomType = 'combat' | 'elite' | 'boss' | 'shop' | 'treasure' | 'rest';

export interface Item {
  id: string;
  name: string;
  slot: ItemSlot;
  rarity: ItemRarity;
  level: number;
  stats: Partial<Record<StatName, number>>;
  description: string;
  value: number;
}

export interface Stats {
  maxHp: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  critChance: number;
  critDamage: number;
}

export interface Equipment {
  weapon: Item | null;
  armor: Item | null;
  ring: Item | null;
  amulet: Item | null;
}

export interface Player {
  stats: Stats;
  baseStats: Stats;
  equipment: Equipment;
  inventory: Item[];
  level: number;
  xp: number;
  xpToNext: number;
  gold: number;
  floor: number;
}

export interface Mob {
  id: string;
  name: string;
  stats: Stats;
  xpReward: number;
  goldReward: number;
  symbol: string;
  color: string;
  isBoss: boolean;
  lootTable: ItemRarity[];
  intent: 'attack' | 'defend' | 'buff'; // what mob will do next turn
}

export interface MapNode {
  id: string;
  col: number;   // column (0 = start row above boss)
  row: number;   // row within column
  type: RoomType;
  nextIds: string[]; // connections to next column
  cleared: boolean;
  available: boolean; // player can travel here
  visited: boolean;
}

export interface MapGraph {
  nodes: MapNode[];
  currentNodeId: string | null;
}

export interface CombatLog {
  id: string;
  text: string;
  type: 'player' | 'enemy' | 'system' | 'loot' | 'levelup';
}

export interface LevelUpOption {
  stat: StatName;
  label: string;
  amount: number;
  description: string;
}

export type GamePhase =
  | 'map'
  | 'combat'
  | 'levelup'
  | 'shop'
  | 'treasure'
  | 'rest'
  | 'gameover'
  | 'victory';

export interface GameState {
  phase: GamePhase;
  player: Player;
  map: MapGraph;
  floor: number;
  combatLog: CombatLog[];
  activeMob: Mob | null;
  levelUpOptions: LevelUpOption[];
  shopItems: Item[];
  pendingItems: Item[];
  turn: number;
  pendingFloorClear: boolean;
}
