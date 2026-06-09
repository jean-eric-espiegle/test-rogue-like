import React, { useMemo } from 'react';
import { MapGraph, MapNode, RoomType } from '../game/types';

const ROOM_META: Record<RoomType, { icon: string; color: string; label: string }> = {
  combat:   { icon: '⚔️', color: '#ef5350', label: 'Combat' },
  elite:    { icon: '💀', color: '#ab47bc', label: 'Elite' },
  boss:     { icon: '☠️', color: '#b71c1c', label: 'Boss' },
  shop:     { icon: '🛒', color: '#29b6f6', label: 'Shop' },
  treasure: { icon: '★', color: '#ffd700', label: 'Treasure' },
  rest:     { icon: '🔥', color: '#ff7043', label: 'Rest' },
};

interface Props {
  map: MapGraph;
  floor: number;
  onEnterRoom: (id: string) => void;
}

export default function MapView({ map, floor, onEnterRoom }: Props) {
  const { nodes, currentNodeId } = map;

  // Group nodes by column
  const cols = useMemo(() => {
    const maxCol = Math.max(...nodes.map(n => n.col));
    const grouped: MapNode[][] = [];
    for (let c = 0; c <= maxCol; c++) {
      grouped.push(nodes.filter(n => n.col === c).sort((a, b) => a.row - b.row));
    }
    return grouped;
  }, [nodes]);

  // Build connection map: nodeId -> nextIds
  const NODE_W = 64;
  const NODE_H = 64;
  const COL_GAP = 20;
  const ROW_GAP = 16;

  // Layout positions
  const positions = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    const maxRows = Math.max(...cols.map(c => c.length));
    cols.forEach((col, ci) => {
      const totalH = col.length * NODE_H + (col.length - 1) * ROW_GAP;
      const startY = (maxRows * (NODE_H + ROW_GAP) - totalH) / 2;
      col.forEach((node, ri) => {
        pos[node.id] = {
          x: ci * (NODE_W + COL_GAP) + NODE_W / 2,
          y: startY + ri * (NODE_H + ROW_GAP) + NODE_H / 2,
        };
      });
    });
    return pos;
  }, [cols]);

  const svgW = cols.length * (NODE_W + COL_GAP);
  const maxRows = Math.max(...cols.map(c => c.length));
  const svgH = maxRows * (NODE_H + ROW_GAP) + 20;

  return (
    <div style={{ width: '100%', overflowX: 'auto', padding: '8px 0' }}>
      <div style={{ textAlign: 'center', color: '#aaa', fontSize: 12, marginBottom: 8, fontFamily: 'monospace' }}>
        Floor {floor} / 5 — Tap an available room to enter
      </div>
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <svg width={svgW + 16} height={svgH + 16} style={{ display: 'block', margin: '0 auto' }}>
          <g transform="translate(8,8)">
            {/* Draw connections */}
            {nodes.map(node =>
              node.nextIds.map(nextId => {
                const from = positions[node.id];
                const to = positions[nextId];
                if (!from || !to) return null;
                const visited = node.cleared;
                return (
                  <line
                    key={`${node.id}-${nextId}`}
                    x1={from.x} y1={from.y}
                    x2={to.x} y2={to.y}
                    stroke={visited ? '#4caf5066' : '#333'}
                    strokeWidth={visited ? 2 : 1.5}
                    strokeDasharray={visited ? undefined : '4 3'}
                  />
                );
              })
            )}
            {/* Draw nodes */}
            {nodes.map(node => {
              const pos = positions[node.id];
              if (!pos) return null;
              const meta = ROOM_META[node.type];
              const isCurrent = node.id === currentNodeId;
              const isAvailable = node.available && !node.cleared;
              const isCleared = node.cleared;

              let borderColor = '#333';
              let bgColor = '#1a1a2e';
              let opacity = 0.4;

              if (isCleared) { borderColor = '#555'; bgColor = '#111'; opacity = 0.6; }
              if (isAvailable) { borderColor = meta.color; bgColor = '#1a1a2e'; opacity = 1; }
              if (isCurrent && !isCleared) { borderColor = '#fff'; bgColor = '#1e1e3a'; opacity = 1; }

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x - NODE_W / 2}, ${pos.y - NODE_H / 2})`}
                  onClick={() => isAvailable && onEnterRoom(node.id)}
                  style={{ cursor: isAvailable ? 'pointer' : 'default', opacity }}
                >
                  <rect
                    width={NODE_W} height={NODE_H} rx={10}
                    fill={bgColor}
                    stroke={borderColor}
                    strokeWidth={isAvailable ? 2.5 : 1.5}
                  />
                  {isAvailable && (
                    <rect width={NODE_W} height={NODE_H} rx={10} fill={meta.color} opacity={0.08} />
                  )}
                  {isCurrent && !isCleared && (
                    <rect width={NODE_W} height={NODE_H} rx={10} fill="none" stroke={meta.color} strokeWidth={3} opacity={0.5}>
                      <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
                    </rect>
                  )}
                  <text x={NODE_W / 2} y={NODE_H * 0.42} textAnchor="middle" dominantBaseline="middle" fontSize={22}>{meta.icon}</text>
                  <text x={NODE_W / 2} y={NODE_H * 0.78} textAnchor="middle" fontSize={9} fill={isCleared ? '#555' : isAvailable ? meta.color : '#888'} fontFamily="monospace">
                    {isCleared ? '✓ done' : meta.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
