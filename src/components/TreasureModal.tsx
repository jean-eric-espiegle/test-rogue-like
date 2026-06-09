import React from 'react';
import { Item } from '../game/types';

const RARITY_COLORS: Record<string, string> = {
  common: '#aaa',
  uncommon: '#4caf50',
  rare: '#2196f3',
  epic: '#9c27b0',
  legendary: '#ff9800',
};

interface Props {
  items: Item[];
  onCollect: (id: string) => void;
}

export default function TreasureModal({ items, onCollect }: Props) {
  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'monospace',
    }}>
      <div style={{ background: '#0d0d1a', border: '2px solid #ffd700', borderRadius: 8, padding: 24, width: 440, color: '#e0e0e0' }}>
        <div style={{ textAlign: 'center', fontSize: 20, color: '#ffd700', marginBottom: 16 }}>
          ★ Treasure Room ★
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(item => (
            <div key={item.id} style={{ background: '#1a1a2e', border: `1px solid ${RARITY_COLORS[item.rarity]}`, borderRadius: 6, padding: '10px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ color: RARITY_COLORS[item.rarity], fontWeight: 'bold', fontSize: 14 }}>{item.name}</span>
                <span style={{ color: '#aaa', fontSize: 11 }}>Lv{item.level} {item.rarity}</span>
              </div>
              <div style={{ color: '#888', fontSize: 11, marginBottom: 8 }}>{item.description}</div>
              <button
                onClick={() => onCollect(item.id)}
                style={{
                  background: '#4a2800', color: '#ffd700', border: '1px solid #ffd700',
                  borderRadius: 3, padding: '3px 12px', cursor: 'pointer',
                  fontFamily: 'monospace', fontSize: 12,
                }}
              >
                ★ Take
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
