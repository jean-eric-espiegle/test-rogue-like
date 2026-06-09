import React from 'react';
import { Item } from '../game/types';

const RC: Record<string, string> = { common: '#aaa', uncommon: '#4caf50', rare: '#2196f3', epic: '#9c27b0', legendary: '#ff9800' };

interface Props {
  items: Item[];
  playerGold: number;
  onBuy: (id: string) => void;
  onClose: () => void;
}

export default function ShopModal({ items, playerGold, onBuy, onClose }: Props) {
  return (
    <div style={{ fontFamily: 'monospace', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#29b6f6', fontSize: 18, fontWeight: 'bold' }}>🛒 Shop</div>
        <div style={{ color: '#ffd700', fontSize: 14 }}>💰 {playerGold}g</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 340, overflowY: 'auto' }}>
        {items.length === 0 && <div style={{ color: '#555', textAlign: 'center', padding: 20 }}>Sold out!</div>}
        {items.map(item => (
          <div key={item.id} style={{ background: '#111', border: `1px solid ${RC[item.rarity]}44`, borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div>
                <span style={{ color: RC[item.rarity], fontWeight: 'bold', fontSize: 13 }}>{item.name}</span>
                <span style={{ color: '#555', fontSize: 10, marginLeft: 8 }}>Lv{item.level} {item.rarity}</span>
              </div>
              <span style={{ color: '#ffd700', fontSize: 13, fontWeight: 'bold' }}>{item.value}g</span>
            </div>
            <div style={{ color: '#777', fontSize: 11, marginBottom: 8 }}>{item.description}</div>
            <button
              onTouchStart={() => playerGold >= item.value && onBuy(item.id)}
              onClick={() => onBuy(item.id)}
              disabled={playerGold < item.value}
              style={{ background: playerGold >= item.value ? '#1565c0' : '#1a1a1a', color: playerGold >= item.value ? '#90caf9' : '#444', border: `1px solid ${playerGold >= item.value ? '#2196f3' : '#333'}`, borderRadius: 6, padding: '6px 14px', cursor: playerGold >= item.value ? 'pointer' : 'not-allowed', fontFamily: 'monospace', fontSize: 12, WebkitTapHighlightColor: 'transparent' }}
            >
              Buy {item.value}g
            </button>
          </div>
        ))}
      </div>

      <button onTouchStart={onClose} onClick={onClose} style={{ background: '#1a2a1a', color: '#81c784', border: '2px solid #4caf50', borderRadius: 10, padding: '14px 0', cursor: 'pointer', fontFamily: 'monospace', fontSize: 15, fontWeight: 'bold', WebkitTapHighlightColor: 'transparent' }}>
        Leave Shop
      </button>
    </div>
  );
}
