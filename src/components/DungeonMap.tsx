import React, { useRef, useEffect } from 'react';
import { GameState } from '../game/types';
import { MAP_W, MAP_H } from '../game/dungeon';

const TILE_SIZE = 16;

const TILE_COLORS = {
  wall: '#1a1a2e',
  floor: '#2d2d44',
  stairs: '#ffd700',
  door: '#8B4513',
};

const ROOM_TYPE_TINTS: Record<string, string> = {
  treasure: 'rgba(255, 215, 0, 0.08)',
  shop: 'rgba(100, 200, 255, 0.08)',
  boss: 'rgba(255, 50, 50, 0.1)',
  start: 'rgba(100, 255, 100, 0.05)',
};

interface Props {
  state: GameState;
}

export default function DungeonMap({ state }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0d0d1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const { map, player, rooms } = state;

    // Camera: center on player
    const camX = player.pos.x * TILE_SIZE - canvas.width / 2;
    const camY = player.pos.y * TILE_SIZE - canvas.height / 2;

    ctx.save();
    ctx.translate(-camX, -camY);

    // Draw tiles
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const tile = map[y]?.[x];
        if (!tile || !tile.revealed) continue;

        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;
        const alpha = tile.visible ? 1 : 0.35;

        ctx.globalAlpha = alpha;

        if (tile.type === 'wall') {
          ctx.fillStyle = TILE_COLORS.wall;
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          // wall border
          ctx.fillStyle = '#2a2a4a';
          ctx.fillRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2);
        } else {
          ctx.fillStyle = TILE_COLORS.floor;
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

          // Room tint
          if (tile.roomId) {
            const room = rooms.find(r => r.id === tile.roomId);
            if (room) {
              const tint = ROOM_TYPE_TINTS[room.type];
              if (tint) {
                ctx.fillStyle = tint;
                ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
              }
            }
          }

          if (tile.type === 'stairs') {
            ctx.fillStyle = TILE_COLORS.stairs;
            ctx.font = `${TILE_SIZE - 2}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('>', px + TILE_SIZE / 2, py + TILE_SIZE / 2);
          }
        }
      }
    }

    ctx.globalAlpha = 1;

    // Draw room labels
    for (const room of rooms) {
      if (!room.visited) continue;
      const cx = (room.x + room.w / 2) * TILE_SIZE;
      const cy = (room.y + room.h / 2) * TILE_SIZE;
      const tile = map[room.y + Math.floor(room.h / 2)]?.[room.x + Math.floor(room.w / 2)];
      if (!tile?.visible) continue;

      const labels: Record<string, string> = { treasure: '★', shop: '$', boss: '☠', start: '↓' };
      const label = labels[room.type];
      if (label && room.type !== 'normal') {
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = room.type === 'boss' ? '#ff4444' : room.type === 'treasure' ? '#ffd700' : '#00bcd4';
        ctx.font = `${TILE_SIZE - 4}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, cx, cy);
        ctx.globalAlpha = 1;
      }
    }

    // Draw mobs
    for (const room of rooms) {
      if (!room.visited) continue;
      for (const mob of room.mobs) {
        const tile = map[mob.pos.y]?.[mob.pos.x];
        if (!tile?.visible) continue;
        const px = mob.pos.x * TILE_SIZE;
        const py = mob.pos.y * TILE_SIZE;
        ctx.fillStyle = mob.color;
        ctx.font = `bold ${TILE_SIZE - 2}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(mob.symbol, px + TILE_SIZE / 2, py + TILE_SIZE / 2);

        // HP bar
        const hpFrac = mob.stats.hp / mob.stats.maxHp;
        ctx.fillStyle = '#333';
        ctx.fillRect(px, py - 4, TILE_SIZE, 3);
        ctx.fillStyle = hpFrac > 0.5 ? '#4caf50' : hpFrac > 0.25 ? '#ff9800' : '#f44336';
        ctx.fillRect(px, py - 4, TILE_SIZE * hpFrac, 3);
      }
    }

    // Draw items on floor
    for (const room of rooms) {
      if (!room.visited || room.items.length === 0) continue;
      for (const item of room.items) {
        // items don't have a position, draw in room center area
        const tile = map[room.y + Math.floor(room.h / 2)]?.[room.x + Math.floor(room.w / 2)];
        if (!tile?.visible) continue;
        const px = (room.x + Math.floor(room.w / 2)) * TILE_SIZE;
        const py = (room.y + Math.floor(room.h / 2)) * TILE_SIZE + 4;
        ctx.fillStyle = '#fff';
        ctx.font = `${TILE_SIZE - 4}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', px + TILE_SIZE / 2, py + TILE_SIZE / 2);
        break;
      }
    }

    // Draw player
    const ppx = player.pos.x * TILE_SIZE;
    const ppy = player.pos.y * TILE_SIZE;
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${TILE_SIZE - 2}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('@', ppx + TILE_SIZE / 2, ppy + TILE_SIZE / 2);

    ctx.restore();
  }, [state]);

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={400}
      style={{ border: '2px solid #333', display: 'block', imageRendering: 'pixelated' }}
    />
  );
}
