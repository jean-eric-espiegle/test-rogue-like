import React from 'react';
import { Item } from '../game/types';

const RC: Record<string, string> = { common: '#aaa', uncommon: '#4caf50', rare: '#2196f3', epic: '#9c27b0', legendary: '#ff9800' };

interface Props {
  items: Item[];
  onCollect: (id: string) => void;
}

export default function TreasureModal({ items, onCollect }: Props) {
  return (
    <div style={{ fontFamily: 'monospace', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 6 }}>★</div>
        <div style={{ color: '#ffd700', fontSize: 18, fontWeight: 'bold' }}>Treasure Cache</div>
        <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>Take what you need.</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map(item => (
          <div key={item.id} style={{ background: '#111', border: `1px solid ${RC[item.rarity]}`, borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ color: RC[item.rarity], fontWeight: 'bold', fontSize: 14 }}>{item.name}</span>
              <span style={{ color: '#555', fontSize: 10 }}>Lv{item.level} {item.rarity}</span>
            </div>
            <div style={{ color: '#777', fontSize: 11, marginBottom: 8 }}>{item.description}</div>
            <button onTouchStart={() => onCollect(item.id)} onClick={() => onCollect(item.id)}
              style={{ background: '#4a2800', color: '#ffd700', border: '1px solid #ffd700', borderRadius: 6, padding: '6px 16px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold', WebkitTapHighlightColor: 'transparent' }}>
              ★ Take
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
