import { MapGraph, MapNode, RoomType } from './types';
import { uid, shuffle, rng } from './utils';

const COLS = 7;       // columns of rooms (not counting boss)
const MAX_ROWS = 3;   // max rooms per column

// Probability weights per column (0=first, 6=last before boss)
const TYPE_WEIGHTS: Record<RoomType, number[]> = {
  combat:   [50, 45, 40, 35, 30, 25, 20],
  elite:    [0,  5,  10, 15, 15, 20, 25],
  shop:     [10, 10, 10, 10, 15, 15, 10],
  treasure: [15, 15, 15, 10, 10, 10, 10],
  rest:     [25, 25, 25, 30, 30, 30, 35],
  boss:     [0,  0,  0,  0,  0,  0,  0],
};

function pickType(col: number): RoomType {
  const types: RoomType[] = ['combat', 'elite', 'shop', 'treasure', 'rest'];
  const weights = types.map(t => TYPE_WEIGHTS[t][col]);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < types.length; i++) {
    r -= weights[i];
    if (r <= 0) return types[i];
  }
  return 'combat';
}

export function generateMap(): MapGraph {
  const nodes: MapNode[] = [];

  // Generate grid: COLS columns, 1-MAX_ROWS nodes each
  const grid: MapNode[][] = [];
  for (let col = 0; col < COLS; col++) {
    const count = col === 0 || col === COLS - 1 ? 1 : rng(2, MAX_ROWS);
    const col_nodes: MapNode[] = [];
    for (let row = 0; row < count; row++) {
      const node: MapNode = {
        id: uid(), col, row,
        type: pickType(col),
        nextIds: [],
        cleared: false,
        available: col === 0,
        visited: false,
      };
      col_nodes.push(node);
      nodes.push(node);
    }
    grid.push(col_nodes);
  }

  // Connect columns: each node connects to 1-2 nodes in next column
  for (let col = 0; col < COLS - 1; col++) {
    const current = grid[col];
    const next = grid[col + 1];
    // Ensure every next node is reachable
    const shuffledNext = shuffle([...next]);
    // First pass: guarantee each next node has at least one incoming
    current.forEach((node, i) => {
      const target = shuffledNext[i % shuffledNext.length];
      if (!node.nextIds.includes(target.id)) node.nextIds.push(target.id);
    });
    // Second pass: add some branching
    current.forEach(node => {
      if (Math.random() < 0.35 && next.length > 1) {
        const extra = next.find(n => !node.nextIds.includes(n.id));
        if (extra) node.nextIds.push(extra.id);
      }
    });
  }

  // Boss node at the end
  const bossNode: MapNode = {
    id: uid(), col: COLS, row: 0,
    type: 'boss',
    nextIds: [],
    cleared: false,
    available: false,
    visited: false,
  };
  // Last column all connect to boss
  grid[COLS - 1].forEach(n => { n.nextIds.push(bossNode.id); });
  nodes.push(bossNode);

  return { nodes, currentNodeId: null };
}

export function getNode(map: MapGraph, id: string): MapNode | undefined {
  return map.nodes.find(n => n.id === id);
}

export function unlockNextNodes(map: MapGraph, fromId: string): MapGraph {
  const node = getNode(map, fromId);
  if (!node) return map;
  const newNodes = map.nodes.map(n => {
    if (node.nextIds.includes(n.id)) return { ...n, available: true };
    return n;
  });
  return { ...map, nodes: newNodes };
}
