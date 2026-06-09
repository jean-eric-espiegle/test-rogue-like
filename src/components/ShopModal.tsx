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
  playerGold: number;
  onBuy: (id: string) => void;
  onClose: () => void;
}

export default function ShopModal({ items, playerGold, onBuy, onClose }: Props) {
  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'monospace',
    }}>
      <div style={{ background: '#0d0d1a', border: '2px solid #2196f3', borderRadius: 8, padding: 24, width: 480, color: '#e0e0e0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 18, color: '#2196f3' }}>🛒 Shop</div>
          <div style={{ color: '#ffd700' }}>💰 {playerGold} gold</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {items.length === 0 && <div style={{ color: '#555', textAlign: 'center' }}>Sold out!</div>}
          {items.map(item => (
            <div key={item.id} style={{ background: '#1a1a2e', border: `1px solid ${RARITY_COLORS[item.rarity]}44`, borderRadius: 6, padding: '10px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ color: RARITY_COLORS[item.rarity], fontWeight: 'bold' }}>{item.name}</span>
                  <span style={{ color: '#666', fontSize: 11, marginLeft: 8 }}>Lv{item.level} {item.rarity}</span>
                </div>
                <div style={{ color: '#ffd700' }}>{item.value}g</div>
              </div>
              <div style={{ color: '#888', fontSize: 11, margin: '4px 0 8px' }}>{item.description}</div>
              <button
                onClick={() => onBuy(item.id)}
                disabled={playerGold < item.value}
                style={{
                  background: playerGold >= item.value ? '#1565c0' : '#222',
                  color: playerGold >= item.value ? '#90caf9' : '#555',
                  border: `1px solid ${playerGold >= item.value ? '#2196f3' : '#444'}`,
                  borderRadius: 3, padding: '3px 10px', cursor: playerGold >= item.value ? 'pointer' : 'not-allowed',
                  fontFamily: 'monospace', fontSize: 12,
                }}
              >
                Buy {item.value}g
              </button>
            </div>
          ))}
        </div>

        <button onClick={onClose} style={{
          width: '100%', background: '#1a2a1a', color: '#81c784',
          border: '1px solid #4caf50', borderRadius: 4, padding: '8px 0',
          cursor: 'pointer', fontFamily: 'monospace', fontSize: 14,
        }}>
          Leave Shop
        </button>
      </div>
    </div>
  );
}
