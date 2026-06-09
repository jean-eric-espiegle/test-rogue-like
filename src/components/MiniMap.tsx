import React from 'react';
import { GameState } from '../game/types';
import { MAP_W, MAP_H } from '../game/dungeon';

const ROOM_COLORS: Record<string, string> = {
  normal: '#2d3a2d',
  start: '#1a3a1a',
  treasure: '#3a3a00',
  shop: '#003a3a',
  boss: '#3a0000',
};

const ROOM_BORDER_COLORS: Record<string, string> = {
  normal: '#4caf50',
  start: '#81c784',
  treasure: '#ffd700',
  shop: '#00bcd4',
  boss: '#f44336',
};

interface Props {
  state: GameState;
}

const SCALE = 3;

export default function MiniMap({ state }: Props) {
  const { map, rooms, player } = state;

  return (
    <div style={{ position: 'relative', width: MAP_W * SCALE, height: MAP_H * SCALE, background: '#050508', border: '1px solid #333' }}>
      {/* Tiles */}
      {Array.from({ length: MAP_H }, (_, y) =>
        Array.from({ length: MAP_W }, (_, x) => {
          const tile = map[y]?.[x];
          if (!tile?.revealed) return null;
          const color = tile.type === 'wall' ? '#111' : tile.type === 'stairs' ? '#ffd700' : '#2d3a2d';
          return (
            <div
              key={`${x}-${y}`}
              style={{
                position: 'absolute',
                left: x * SCALE,
                top: y * SCALE,
                width: SCALE,
                height: SCALE,
                background: color,
                opacity: tile.visible ? 1 : 0.5,
              }}
            />
          );
        })
      )}

      {/* Room labels */}
      {rooms.filter(r => r.visited && r.type !== 'normal').map(room => {
        const cx = (room.x + room.w / 2) * SCALE;
        const cy = (room.y + room.h / 2) * SCALE;
        const symbols: Record<string, string> = { treasure: '★', shop: '$', boss: '☠', start: '⬇' };
        return (
          <div key={room.id} style={{
            position: 'absolute', left: cx - 3, top: cy - 3,
            color: ROOM_BORDER_COLORS[room.type], fontSize: 6, lineHeight: 1,
          }}>
            {symbols[room.type]}
          </div>
        );
      })}

      {/* Player dot */}
      <div style={{
        position: 'absolute',
        left: player.pos.x * SCALE - 2,
        top: player.pos.y * SCALE - 2,
        width: 5,
        height: 5,
        background: '#fff',
        borderRadius: '50%',
      }} />
    </div>
  );
}
