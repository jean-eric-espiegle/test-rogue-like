export type TileType = 'wall' | 'floor' | 'stairs' | 'door';

export type RoomType = 'normal' | 'treasure' | 'shop' | 'boss' | 'start';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type ItemSlot = 'weapon' | 'armor' | 'ring' | 'amulet' | 'potion';

export type StatName = 'maxHp' | 'attack' | 'defense' | 'speed' | 'critChance' | 'critDamage';

export interface Vec2 {
  x: number;
  y: number;
}

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
  pos: Vec2;
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
  pos: Vec2;
  stats: Stats;
  xpReward: number;
  goldReward: number;
  symbol: string;
  color: string;
  isBoss: boolean;
  lootTable: ItemRarity[];
}

export interface Room {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: RoomType;
  cleared: boolean;
  visited: boolean;
  items: Item[];
  mobs: Mob[];
  shopItems?: Item[];
}

export interface Tile {
  type: TileType;
  roomId?: string;
  revealed: boolean;
  visible: boolean;
}

export type MapGrid = Tile[][];

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
  | 'playing'
  | 'combat'
  | 'levelup'
  | 'shop'
  | 'treasure'
  | 'gameover'
  | 'victory';

export interface GameState {
  phase: GamePhase;
  player: Player;
  map: MapGrid;
  rooms: Room[];
  floor: number;
  combatLog: CombatLog[];
  activeMob: Mob | null;
  levelUpOptions: LevelUpOption[];
  shopItems: Item[];
  pendingItems: Item[];
  turn: number;
}
