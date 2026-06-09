import { GameState, Player, Stats, Equipment, Item, LevelUpOption, GamePhase, MapNode, Mob } from './types';
import { generateMap, getNode, unlockNextNodes } from './mapgen';
import { simulateCombatRound, getEquippedStats, xpForLevel } from './combat';
import { generateItem, generatePotion } from './items';
import { generateLevelUpOptions } from './levelup';
import { spawnMob } from './mobs';
import { uid, clamp, rng } from './utils';

function initialPlayer(): Player {
  const base: Stats = { maxHp: 80, hp: 80, attack: 10, defense: 3, speed: 8, critChance: 5, critDamage: 150 };
  return {
    stats: { ...base }, baseStats: { ...base },
    equipment: { weapon: null, armor: null, ring: null, amulet: null },
    inventory: [], level: 1, xp: 0, xpToNext: xpForLevel(1), gold: 30, floor: 1,
  };
}

export function createGame(): GameState {
  const player = initialPlayer();
  const map = generateMap();
  // Mark first column available
  const firstNode = map.nodes.find(n => n.col === 0);
  const startMap = firstNode ? { ...map, nodes: map.nodes.map(n => n.col === 0 ? { ...n, available: true } : n) } : map;
  return {
    phase: 'map', player, map: startMap, floor: 1,
    combatLog: [{ id: uid(), text: 'The dungeon awaits. Choose your path wisely.', type: 'system' }],
    activeMob: null, levelUpOptions: [], shopItems: [], pendingItems: [], turn: 0,
  };
}

export function enterRoom(state: GameState, nodeId: string): GameState {
  const node = getNode(state.map, nodeId);
  if (!node || !node.available) return state;

  const newMap = {
    ...state.map,
    currentNodeId: nodeId,
    nodes: state.map.nodes.map(n => n.id === nodeId ? { ...n, visited: true } : n),
  };

  let s: GameState = { ...state, map: newMap };

  switch (node.type) {
    case 'combat':
      return startCombat(s, spawnMob(state.floor, 'normal'));
    case 'elite':
      return startCombat(s, spawnMob(state.floor, 'elite'));
    case 'boss':
      return startCombat(s, spawnMob(state.floor, 'boss'));
    case 'shop': {
      const shopItems = Array.from({ length: 4 }, () =>
        Math.random() < 0.25 ? generatePotion(state.floor) : generateItem(state.floor)
      );
      return { ...s, phase: 'shop', shopItems,
        combatLog: [{ id: uid(), text: 'A merchant greets you. Browse wares with your gold!', type: 'system' }, ...s.combatLog.slice(0, 49)] };
    }
    case 'treasure': {
      const items = Array.from({ length: rng(1, 3) }, () => generateItem(state.floor));
      if (Math.random() < 0.4) items.push(generatePotion(state.floor));
      return { ...s, phase: 'treasure', pendingItems: items,
        combatLog: [{ id: uid(), text: `You found a treasure cache! ${items.length} item(s) inside.`, type: 'loot' }, ...s.combatLog.slice(0, 49)] };
    }
    case 'rest':
      return { ...s, phase: 'rest',
        combatLog: [{ id: uid(), text: 'You find a campfire. Rest and recover.', type: 'system' }, ...s.combatLog.slice(0, 49)] };
    default:
      return s;
  }
}

function startCombat(state: GameState, mob: Mob): GameState {
  return {
    ...state, phase: 'combat', activeMob: mob,
    combatLog: [{ id: uid(), text: `A ${mob.name} blocks your path! (${mob.stats.hp} HP)`, type: 'system' }, ...state.combatLog.slice(0, 49)],
  };
}

export function doCombatRound(state: GameState): GameState {
  if (state.phase !== 'combat' || !state.activeMob) return state;
  const mob = state.activeMob;
  const result = simulateCombatRound(state.player.stats, mob.stats, mob.name);
  const newPlayerHp = clamp(state.player.stats.hp + result.playerHpDelta, 0, state.player.stats.maxHp);
  const newMobHp = clamp(mob.stats.hp + result.mobHpDelta, 0, mob.stats.maxHp);
  let s: GameState = {
    ...state,
    player: { ...state.player, stats: { ...state.player.stats, hp: newPlayerHp } },
    activeMob: { ...mob, stats: { ...mob.stats, hp: newMobHp } },
    combatLog: [...result.log, ...state.combatLog.slice(0, 49)],
  };
  if (result.playerDead) return { ...s, phase: 'gameover' };
  if (result.mobDead) s = handleMobDeath(s, mob);
  return s;
}

function handleMobDeath(state: GameState, mob: Mob): GameState {
  const nodeId = state.map.currentNodeId!;
  // Mark node cleared and unlock next nodes
  let newMap = {
    ...state.map,
    nodes: state.map.nodes.map(n => n.id === nodeId ? { ...n, cleared: true } : n),
  };
  newMap = unlockNextNodes(newMap, nodeId);

  let newXp = state.player.xp + mob.xpReward;
  let newLevel = state.player.level;
  let newXpToNext = state.player.xpToNext;
  let levelUpOptions: LevelUpOption[] = [];
  let phase: GamePhase = 'map';

  const logEntries = [
    { id: uid(), text: `${mob.name} defeated! +${mob.xpReward} XP, +${mob.goldReward} gold.`, type: 'system' as const },
    ...state.combatLog.slice(0, 49)
  ];

  const lootItems: Item[] = [];
  if (Math.random() < 0.45) {
    const rarity = mob.lootTable[Math.floor(Math.random() * mob.lootTable.length)];
    const drop = generateItem(state.floor, rarity);
    lootItems.push(drop);
    logEntries.unshift({ id: uid(), text: `${mob.name} dropped: ${drop.name}!`, type: 'loot' });
  }

  if (newXp >= newXpToNext) {
    newXp -= newXpToNext; newLevel++; newXpToNext = xpForLevel(newLevel);
    levelUpOptions = generateLevelUpOptions(3); phase = 'levelup';
    logEntries.unshift({ id: uid(), text: `Level up! You are now level ${newLevel}!`, type: 'levelup' });
  }

  // Check if this was the boss — if so, next floor
  const clearedNode = state.map.nodes.find(n => n.id === nodeId);
  if (clearedNode?.type === 'boss' && phase !== 'levelup') {
    return handleFloorClear({ ...state, map: newMap, player: { ...state.player, xp: newXp, xpToNext: newXpToNext, level: newLevel, gold: state.player.gold + mob.goldReward, inventory: [...state.player.inventory, ...lootItems] }, combatLog: logEntries }, mob);
  }

  return {
    ...state, phase, map: newMap, activeMob: null, levelUpOptions,
    player: { ...state.player, xp: newXp, xpToNext: newXpToNext, level: newLevel, gold: state.player.gold + mob.goldReward, inventory: [...state.player.inventory, ...lootItems] },
    combatLog: logEntries,
    // Store boss-cleared flag for after levelup if needed
  };
}

function handleFloorClear(state: GameState, mob: Mob): GameState {
  const newFloor = state.floor + 1;
  if (newFloor > 5) return { ...state, phase: 'victory' };
  const newMap = generateMap();
  const player = { ...state.player, floor: newFloor, stats: { ...state.player.stats, hp: Math.min(state.player.stats.hp + 15, state.player.stats.maxHp) } };
  return {
    ...state, phase: 'map', floor: newFloor, player, map: newMap, activeMob: null,
    combatLog: [{ id: uid(), text: `Floor ${newFloor} — deeper into the dungeon. (+15 HP recovered)`, type: 'system' }, ...state.combatLog.slice(0, 49)],
  };
}

export function chooseLevelUp(state: GameState, option: LevelUpOption): GameState {
  const base = { ...state.player.baseStats };
  if (option.stat === 'maxHp') { base.maxHp += option.amount; base.hp = Math.min(base.hp + option.amount, base.maxHp); }
  else (base as any)[option.stat] += option.amount;
  let s: GameState = { ...state, phase: 'map', levelUpOptions: [], player: { ...state.player, baseStats: base } };
  return recalcStats(s);
}

export function equipItem(state: GameState, itemId: string): GameState {
  const item = state.player.inventory.find(i => i.id === itemId);
  if (!item || item.slot === 'potion') return state;
  const slot = item.slot as keyof Equipment;
  const oldItem = state.player.equipment[slot];
  let s = { ...state, player: {
    ...state.player,
    equipment: { ...state.player.equipment, [slot]: item },
    inventory: state.player.inventory.filter(i => i.id !== itemId).concat(oldItem ? [oldItem] : []),
  }};
  return recalcStats(s);
}

export function usePotion(state: GameState, itemId: string): GameState {
  const item = state.player.inventory.find(i => i.id === itemId);
  if (!item || item.slot !== 'potion') return state;
  const healAmt = item.stats.maxHp ?? 20;
  const newHp = clamp(state.player.stats.hp + healAmt, 0, state.player.stats.maxHp);
  return { ...state,
    player: { ...state.player, stats: { ...state.player.stats, hp: newHp }, inventory: state.player.inventory.filter(i => i.id !== itemId) },
    combatLog: [{ id: uid(), text: `You drink a potion and restore ${healAmt} HP.`, type: 'system' }, ...state.combatLog.slice(0, 49)],
  };
}

export function buyShopItem(state: GameState, itemId: string): GameState {
  const item = state.shopItems.find(i => i.id === itemId);
  if (!item || state.player.gold < item.value) return state;
  return { ...state, shopItems: state.shopItems.filter(i => i.id !== itemId),
    player: { ...state.player, gold: state.player.gold - item.value, inventory: [...state.player.inventory, item] },
    combatLog: [{ id: uid(), text: `Bought: ${item.name} for ${item.value} gold.`, type: 'system' }, ...state.combatLog.slice(0, 49)],
  };
}

export function leaveShop(state: GameState): GameState {
  const nodeId = state.map.currentNodeId!;
  const newMap = { ...unlockNextNodes(state.map, nodeId), nodes: state.map.nodes.map(n => n.id === nodeId ? { ...n, cleared: true } : n) };
  return { ...state, phase: 'map', shopItems: [], map: newMap };
}

export function collectTreasureItem(state: GameState, itemId: string): GameState {
  const item = state.pendingItems.find(i => i.id === itemId);
  if (!item) return state;
  const newPending = state.pendingItems.filter(i => i.id !== itemId);
  let s: GameState = { ...state, pendingItems: newPending,
    player: { ...state.player, inventory: [...state.player.inventory, item] },
    combatLog: [{ id: uid(), text: `Collected: ${item.name}!`, type: 'loot' }, ...state.combatLog.slice(0, 49)],
  };
  if (newPending.length === 0) {
    const nodeId = state.map.currentNodeId!;
    const newMap = { ...unlockNextNodes(s.map, nodeId), nodes: s.map.nodes.map(n => n.id === nodeId ? { ...n, cleared: true } : n) };
    s = { ...s, phase: 'map', map: newMap };
  }
  return s;
}

export function doRest(state: GameState, action: 'heal' | 'upgrade'): GameState {
  const nodeId = state.map.currentNodeId!;
  const newMap = { ...unlockNextNodes(state.map, nodeId), nodes: state.map.nodes.map(n => n.id === nodeId ? { ...n, cleared: true } : n) };

  if (action === 'heal') {
    const healAmt = Math.round(state.player.stats.maxHp * 0.3);
    const newHp = clamp(state.player.stats.hp + healAmt, 0, state.player.stats.maxHp);
    return { ...state, phase: 'map', map: newMap,
      player: { ...state.player, stats: { ...state.player.stats, hp: newHp } },
      combatLog: [{ id: uid(), text: `You rest and recover ${healAmt} HP.`, type: 'system' }, ...state.combatLog.slice(0, 49)],
    };
  } else {
    const opts = generateLevelUpOptions(3);
    return { ...state, phase: 'levelup', map: newMap, levelUpOptions: opts,
      combatLog: [{ id: uid(), text: 'You meditate and grow stronger...', type: 'system' }, ...state.combatLog.slice(0, 49)],
    };
  }
}

export function fleeCombat(state: GameState): GameState {
  if (state.phase !== 'combat') return state;
  const mob = state.activeMob!;
  if (mob.isBoss) return { ...state, combatLog: [{ id: uid(), text: "You can't flee from a boss!", type: 'system' }, ...state.combatLog.slice(0, 49)] };
  if (Math.random() < 0.5) {
    // flee costs HP
    const dmg = Math.round(mob.stats.attack * 0.5);
    const newHp = clamp(state.player.stats.hp - dmg, 0, state.player.stats.maxHp);
    if (newHp <= 0) return { ...state, phase: 'gameover', combatLog: [{ id: uid(), text: 'You died while fleeing!', type: 'enemy' }, ...state.combatLog.slice(0, 49)] };
    return { ...state, phase: 'map', activeMob: null,
      player: { ...state.player, stats: { ...state.player.stats, hp: newHp } },
      combatLog: [{ id: uid(), text: `You flee, taking ${dmg} damage!`, type: 'system' }, ...state.combatLog.slice(0, 49)],
    };
  }
  return { ...state, combatLog: [{ id: uid(), text: 'Failed to flee! You must fight!', type: 'enemy' }, ...state.combatLog.slice(0, 49)] };
}

function recalcStats(state: GameState): GameState {
  const { baseStats, equipment } = state.player;
  const newStats = getEquippedStats({ ...baseStats, hp: state.player.stats.hp }, equipment as unknown as { [k: string]: Item | null | undefined });
  return { ...state, player: { ...state.player, stats: newStats } };
}
