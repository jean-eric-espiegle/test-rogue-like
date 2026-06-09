import { GameState, Player, Stats, Equipment, Vec2, Room, Mob, Item, LevelUpOption, GamePhase } from './types';
import { generateDungeon, updateVisibility } from './dungeon';
import { simulateCombatRound, getEquippedStats, xpForLevel } from './combat';
import { generateItem, generatePotion } from './items';
import { generateLevelUpOptions } from './levelup';
import { uid, clamp } from './utils';

function initialPlayer(): Player {
  const base: Stats = {
    maxHp: 80,
    hp: 80,
    attack: 10,
    defense: 3,
    speed: 8,
    critChance: 5,
    critDamage: 150,
  };
  return {
    pos: { x: 0, y: 0 },
    stats: { ...base },
    baseStats: { ...base },
    equipment: { weapon: null, armor: null, ring: null, amulet: null },
    inventory: [],
    level: 1,
    xp: 0,
    xpToNext: xpForLevel(1),
    gold: 20,
    floor: 1,
  };
}

export function createGame(): GameState {
  const player = initialPlayer();
  const { grid, rooms, playerStart } = generateDungeon(1);
  player.pos = playerStart;

  const updatedGrid = updateVisibility(grid, playerStart);
  rooms[0].visited = true;

  return {
    phase: 'playing',
    player,
    map: updatedGrid,
    rooms,
    floor: 1,
    combatLog: [{ id: uid(), text: 'Welcome, adventurer! Explore the dungeon.', type: 'system' }],
    activeMob: null,
    levelUpOptions: [],
    shopItems: [],
    pendingItems: [],
    turn: 0,
  };
}

function getCurrentRoom(state: GameState): Room | undefined {
  const tile = state.map[state.player.pos.y]?.[state.player.pos.x];
  return state.rooms.find(r => r.id === tile?.roomId);
}

function recalcStats(state: GameState): GameState {
  const { baseStats, equipment } = state.player;
  const newStats = getEquippedStats({ ...baseStats, hp: state.player.stats.hp }, equipment as unknown as { [key: string]: import('./types').Item | null | undefined });
  return {
    ...state,
    player: { ...state.player, stats: newStats },
  };
}

export function movePlayer(state: GameState, dx: number, dy: number): GameState {
  if (state.phase !== 'playing') return state;

  const newX = state.player.pos.x + dx;
  const newY = state.player.pos.y + dy;
  const tile = state.map[newY]?.[newX];

  if (!tile || tile.type === 'wall') return state;

  let newState = {
    ...state,
    player: { ...state.player, pos: { x: newX, y: newY } },
    map: updateVisibility(state.map, { x: newX, y: newY }),
    turn: state.turn + 1,
  };

  // Check for room entry
  const room = getCurrentRoom(newState);
  if (room && !room.visited) {
    const updatedRooms = newState.rooms.map(r => r.id === room.id ? { ...r, visited: true } : r);
    newState = { ...newState, rooms: updatedRooms };

    if (room.type === 'shop') {
      newState = {
        ...newState,
        phase: 'shop',
        shopItems: room.shopItems ?? [],
        combatLog: [{ id: uid(), text: 'You enter a shop. Buy items with gold!', type: 'system' }, ...newState.combatLog.slice(0, 49)],
      };
      return newState;
    }

    if (room.type === 'treasure') {
      const pendingItems = [...room.items];
      if (pendingItems.length > 0) {
        newState = {
          ...newState,
          phase: 'treasure',
          pendingItems,
          combatLog: [{ id: uid(), text: `You found a treasure room with ${pendingItems.length} item(s)!`, type: 'loot' }, ...newState.combatLog.slice(0, 49)],
        };
        return newState;
      }
    }
  }

  // Check if there are mobs in current room
  if (room && !room.cleared && room.mobs.length > 0) {
    const mob = room.mobs[0];
    newState = startCombat(newState, mob);
    return newState;
  }

  // Check stairs
  if (tile.type === 'stairs') {
    return descendFloor(newState);
  }

  // Pick up items on floor (from non-treasure rooms)
  if (room && room.items.length > 0) {
    const items = room.items;
    const logs = items.map(it => ({ id: uid(), text: `You found: ${it.name}!`, type: 'loot' as const }));
    const updatedRooms = newState.rooms.map(r =>
      r.id === room.id ? { ...r, items: [] } : r
    );
    newState = {
      ...newState,
      rooms: updatedRooms,
      player: { ...newState.player, inventory: [...newState.player.inventory, ...items] },
      combatLog: [...logs, ...newState.combatLog.slice(0, 49)],
    };
  }

  return newState;
}

function startCombat(state: GameState, mob: Mob): GameState {
  return {
    ...state,
    phase: 'combat',
    activeMob: mob,
    combatLog: [
      { id: uid(), text: `A wild ${mob.name} appears! (HP: ${mob.stats.hp})`, type: 'system' },
      ...state.combatLog.slice(0, 49),
    ],
  };
}

export function doCombatRound(state: GameState): GameState {
  if (state.phase !== 'combat' || !state.activeMob) return state;

  const mob = state.activeMob;
  const result = simulateCombatRound(state.player.stats, mob.stats, mob.name);

  const newPlayerHp = clamp(state.player.stats.hp + result.playerHpDelta, 0, state.player.stats.maxHp);
  const newMobHp = clamp(mob.stats.hp + result.mobHpDelta, 0, mob.stats.maxHp);

  let newState: GameState = {
    ...state,
    player: {
      ...state.player,
      stats: { ...state.player.stats, hp: newPlayerHp },
    },
    activeMob: { ...mob, stats: { ...mob.stats, hp: newMobHp } },
    combatLog: [...result.log, ...state.combatLog.slice(0, 49)],
  };

  if (result.playerDead) {
    return { ...newState, phase: 'gameover' };
  }

  if (result.mobDead) {
    newState = handleMobDeath(newState, mob);
  }

  return newState;
}

function handleMobDeath(state: GameState, mob: Mob): GameState {
  const xpGain = mob.xpReward;
  const goldGain = mob.goldReward;

  const deathLog = { id: uid(), text: `${mob.name} defeated! +${xpGain} XP, +${goldGain} gold.`, type: 'system' as const };

  // Remove mob from room
  const updatedRooms = state.rooms.map(room => ({
    ...room,
    mobs: room.mobs.filter(m => m.id !== mob.id),
    cleared: room.mobs.filter(m => m.id !== mob.id).length === 0,
  }));

  let newXp = state.player.xp + xpGain;
  let newLevel = state.player.level;
  let newXpToNext = state.player.xpToNext;
  let levelUpOptions: LevelUpOption[] = [];
  let phase: GamePhase = 'playing';
  const logEntries = [deathLog, ...state.combatLog.slice(0, 49)];

  // Check for loot drop
  const lootItems: Item[] = [];
  if (Math.random() < 0.4) {
    const rarityPool = mob.lootTable;
    const rarity = rarityPool[Math.floor(Math.random() * rarityPool.length)];
    const drop = generateItem(state.floor, rarity);
    lootItems.push(drop);
    logEntries.unshift({ id: uid(), text: `${mob.name} dropped: ${drop.name}!`, type: 'loot' });
  }

  if (newXp >= newXpToNext) {
    newXp -= newXpToNext;
    newLevel += 1;
    newXpToNext = xpForLevel(newLevel);
    levelUpOptions = generateLevelUpOptions(3);
    phase = 'levelup';
    logEntries.unshift({ id: uid(), text: `Level up! You are now level ${newLevel}!`, type: 'levelup' });
  }

  // Check if room still has mobs
  const currentRoom = updatedRooms.find(r => r.mobs.some(m => true) || r.id === state.rooms.find(r => r.mobs.some(m => m.id === mob.id))?.id);
  const roomWithMob = state.rooms.find(r => r.mobs.some(m => m.id === mob.id));
  const updatedRoom = updatedRooms.find(r => r.id === roomWithMob?.id);
  const nextMob = updatedRoom?.mobs[0] ?? null;

  if (nextMob && phase === 'playing') {
    phase = 'combat';
  }

  return {
    ...state,
    phase,
    activeMob: nextMob,
    rooms: updatedRooms,
    levelUpOptions,
    player: {
      ...state.player,
      xp: newXp,
      xpToNext: newXpToNext,
      level: newLevel,
      gold: state.player.gold + goldGain,
      inventory: [...state.player.inventory, ...lootItems],
    },
    combatLog: logEntries,
  };
}

export function chooseLevelUp(state: GameState, option: LevelUpOption): GameState {
  const base = { ...state.player.baseStats };
  if (option.stat === 'maxHp') {
    base.maxHp += option.amount;
    base.hp = Math.min(base.hp + option.amount, base.maxHp);
  } else {
    (base as any)[option.stat] += option.amount;
  }

  let newState: GameState = {
    ...state,
    phase: 'playing' as GamePhase,
    levelUpOptions: [],
    player: { ...state.player, baseStats: base },
  };
  newState = recalcStats(newState);
  return newState;
}

export function equipItem(state: GameState, itemId: string): GameState {
  const item = state.player.inventory.find(i => i.id === itemId);
  if (!item || item.slot === 'potion') return state;

  const slot = item.slot as keyof Equipment;
  const oldItem = state.player.equipment[slot];
  const newInventory = state.player.inventory
    .filter(i => i.id !== itemId)
    .concat(oldItem ? [oldItem] : []);

  let newState = {
    ...state,
    player: {
      ...state.player,
      equipment: { ...state.player.equipment, [slot]: item },
      inventory: newInventory,
    },
  };
  newState = recalcStats(newState);
  return newState;
}

export function usePotion(state: GameState, itemId: string): GameState {
  const item = state.player.inventory.find(i => i.id === itemId);
  if (!item || item.slot !== 'potion') return state;

  const healAmt = item.stats.maxHp ?? 20;
  const newHp = clamp(state.player.stats.hp + healAmt, 0, state.player.stats.maxHp);
  const newInventory = state.player.inventory.filter(i => i.id !== itemId);

  return {
    ...state,
    player: {
      ...state.player,
      stats: { ...state.player.stats, hp: newHp },
      inventory: newInventory,
    },
    combatLog: [{ id: uid(), text: `You drink a Health Potion and restore ${healAmt} HP.`, type: 'system' }, ...state.combatLog.slice(0, 49)],
  };
}

export function buyShopItem(state: GameState, itemId: string): GameState {
  const item = state.shopItems.find(i => i.id === itemId);
  if (!item || state.player.gold < item.value) return state;

  const newShopItems = state.shopItems.filter(i => i.id !== itemId);
  return {
    ...state,
    shopItems: newShopItems,
    player: {
      ...state.player,
      gold: state.player.gold - item.value,
      inventory: [...state.player.inventory, item],
    },
    combatLog: [{ id: uid(), text: `Bought: ${item.name} for ${item.value} gold.`, type: 'system' }, ...state.combatLog.slice(0, 49)],
  };
}

export function closeShop(state: GameState): GameState {
  return { ...state, phase: 'playing', shopItems: [] };
}

export function collectTreasureItem(state: GameState, itemId: string): GameState {
  const item = state.pendingItems.find(i => i.id === itemId);
  if (!item) return state;

  const newPending = state.pendingItems.filter(i => i.id !== itemId);
  const phase: GamePhase = newPending.length === 0 ? 'playing' : 'treasure';

  return {
    ...state,
    phase,
    pendingItems: newPending,
    player: {
      ...state.player,
      inventory: [...state.player.inventory, item],
    },
    combatLog: [{ id: uid(), text: `Collected: ${item.name}!`, type: 'loot' }, ...state.combatLog.slice(0, 49)],
  };
}

function descendFloor(state: GameState): GameState {
  const newFloor = state.floor + 1;
  if (newFloor > 10) {
    return { ...state, phase: 'victory' };
  }

  const player = { ...state.player, floor: newFloor };
  player.stats = { ...player.stats, hp: Math.min(player.stats.hp + 20, player.stats.maxHp) };

  const { grid, rooms, playerStart } = generateDungeon(newFloor);
  player.pos = playerStart;

  return {
    ...state,
    phase: 'playing',
    player,
    map: updateVisibility(grid, playerStart),
    rooms,
    floor: newFloor,
    combatLog: [
      { id: uid(), text: `You descend to floor ${newFloor}. (+20 HP restored)`, type: 'system' },
      ...state.combatLog.slice(0, 49),
    ],
    activeMob: null,
    turn: 0,
  };
}

export function fleeCombat(state: GameState): GameState {
  if (state.phase !== 'combat') return state;
  const fleeSuccess = Math.random() < 0.5;
  if (!fleeSuccess) {
    return doCombatRound(state);
  }
  return {
    ...state,
    phase: 'playing',
    activeMob: null,
    combatLog: [{ id: uid(), text: 'You flee from combat!', type: 'system' }, ...state.combatLog.slice(0, 49)],
  };
}
