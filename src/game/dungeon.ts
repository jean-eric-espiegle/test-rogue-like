import { MapGrid, Room, RoomType, Tile, Vec2 } from './types';
import { rng, uid, shuffle } from './utils';
import { spawnMob } from './mobs';
import { generateItem, generatePotion } from './items';

const MAP_W = 60;
const MAP_H = 40;
const MIN_ROOM_SIZE = 4;
const MAX_ROOM_SIZE = 10;
const MAX_ROOMS = 18;

function emptyGrid(): MapGrid {
  return Array.from({ length: MAP_H }, () =>
    Array.from({ length: MAP_W }, (): Tile => ({ type: 'wall', revealed: false, visible: false }))
  );
}

function carveRect(grid: MapGrid, x: number, y: number, w: number, h: number, roomId: string) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const row = grid[y + dy];
      if (row) {
        const cell = row[x + dx];
        if (cell) {
          cell.type = 'floor';
          cell.roomId = roomId;
        }
      }
    }
  }
}

function carveCorridor(grid: MapGrid, a: Vec2, b: Vec2) {
  let { x, y } = a;
  while (x !== b.x) {
    if (grid[y]?.[x]) { grid[y][x].type = 'floor'; }
    x += x < b.x ? 1 : -1;
  }
  while (y !== b.y) {
    if (grid[y]?.[x]) { grid[y][x].type = 'floor'; }
    y += y < b.y ? 1 : -1;
  }
}

function roomCenter(room: Room): Vec2 {
  return { x: Math.floor(room.x + room.w / 2), y: Math.floor(room.y + room.h / 2) };
}

function roomsOverlap(a: Room, b: Room, padding = 1): boolean {
  return (
    a.x - padding < b.x + b.w &&
    a.x + a.w + padding > b.x &&
    a.y - padding < b.y + b.h &&
    a.y + a.h + padding > b.y
  );
}

function assignRoomTypes(rooms: Room[], floor: number): void {
  // first room = start, last room (or near) = boss
  rooms[0].type = 'start';
  rooms[rooms.length - 1].type = 'boss';

  const mid = rooms.slice(1, rooms.length - 1);
  const shuffled = shuffle(mid);
  const numTreasure = Math.max(1, Math.floor(shuffled.length * 0.15));
  const numShop = Math.max(1, Math.floor(shuffled.length * 0.1));

  for (let i = 0; i < numTreasure; i++) shuffled[i].type = 'treasure';
  for (let i = numTreasure; i < numTreasure + numShop; i++) shuffled[i].type = 'shop';
}

function populateRoom(room: Room, floor: number): void {
  const center = roomCenter(room);

  if (room.type === 'start') return;

  if (room.type === 'boss') {
    room.mobs.push(spawnMob(center, floor, true));
    return;
  }

  if (room.type === 'treasure') {
    const numItems = rng(1, 3);
    for (let i = 0; i < numItems; i++) {
      room.items.push(generateItem(floor, undefined, undefined));
    }
    if (Math.random() < 0.5) room.items.push(generatePotion(floor));
    return;
  }

  if (room.type === 'shop') {
    const shopSize = 4;
    const shopItems = [];
    for (let i = 0; i < shopSize; i++) {
      if (Math.random() < 0.2) shopItems.push(generatePotion(floor));
      else shopItems.push(generateItem(floor));
    }
    room.shopItems = shopItems;
    return;
  }

  // normal room
  const area = room.w * room.h;
  const numMobs = rng(1, Math.max(1, Math.floor(area / 15)));
  for (let i = 0; i < numMobs; i++) {
    const mx = rng(room.x + 1, room.x + room.w - 2);
    const my = rng(room.y + 1, room.y + room.h - 2);
    room.mobs.push(spawnMob({ x: mx, y: my }, floor));
  }
  if (Math.random() < 0.3) {
    room.items.push(generateItem(floor));
  }
}

export function generateDungeon(floor: number): { grid: MapGrid; rooms: Room[]; playerStart: Vec2 } {
  const grid = emptyGrid();
  const rooms: Room[] = [];

  for (let attempts = 0; attempts < 200 && rooms.length < MAX_ROOMS; attempts++) {
    const w = rng(MIN_ROOM_SIZE, MAX_ROOM_SIZE);
    const h = rng(MIN_ROOM_SIZE, MAX_ROOM_SIZE);
    const x = rng(1, MAP_W - w - 2);
    const y = rng(1, MAP_H - h - 2);

    const newRoom: Room = {
      id: uid(), x, y, w, h,
      type: 'normal', cleared: false, visited: false,
      items: [], mobs: [],
    };

    if (rooms.some(r => roomsOverlap(r, newRoom))) continue;

    if (rooms.length > 0) {
      const prev = rooms[rooms.length - 1];
      carveCorridor(grid, roomCenter(prev), roomCenter(newRoom));
    }

    carveRect(grid, x, y, w, h, newRoom.id);
    rooms.push(newRoom);
  }

  assignRoomTypes(rooms, floor);

  for (const room of rooms) {
    populateRoom(room, floor);
  }

  // Place stairs in the boss room (center)
  const bossRoom = rooms[rooms.length - 1];
  const bc = roomCenter(bossRoom);
  if (grid[bc.y]?.[bc.x]) grid[bc.y][bc.x].type = 'stairs';

  const startCenter = roomCenter(rooms[0]);

  return { grid, rooms, playerStart: startCenter };
}

export function updateVisibility(grid: MapGrid, pos: Vec2, radius = 6): MapGrid {
  const newGrid = grid.map(row => row.map(cell => ({ ...cell, visible: false })));
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx * dx + dy * dy > radius * radius) continue;
      const ny = pos.y + dy;
      const nx = pos.x + dx;
      if (ny < 0 || ny >= newGrid.length || nx < 0 || nx >= newGrid[0].length) continue;
      // Simple ray cast
      let blocked = false;
      const steps = Math.max(Math.abs(dx), Math.abs(dy));
      for (let s = 1; s < steps; s++) {
        const rx = Math.round(pos.x + (dx * s) / steps);
        const ry = Math.round(pos.y + (dy * s) / steps);
        if (newGrid[ry]?.[rx]?.type === 'wall') { blocked = true; break; }
      }
      if (!blocked) {
        newGrid[ny][nx].visible = true;
        newGrid[ny][nx].revealed = true;
      }
    }
  }
  return newGrid;
}

export { MAP_W, MAP_H };
