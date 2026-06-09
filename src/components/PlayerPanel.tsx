import React from 'react';
import { Player } from '../game/types';

interface Props {
  player: Player;
  onUsePotion: (id: string) => void;
  onEquipItem: (id: string) => void;
}

const RARITY_COLORS: Record<string, string> = {
  common: '#aaa',
  uncommon: '#4caf50',
  rare: '#2196f3',
  epic: '#9c27b0',
  legendary: '#ff9800',
};

export default function PlayerPanel({ player, onUsePotion, onEquipItem }: Props) {
  const { stats, baseStats, equipment, inventory, level, xp, xpToNext, gold, floor } = player;
  const hpPct = (stats.hp / stats.maxHp) * 100;
  const xpPct = (xp / xpToNext) * 100;

  return (
    <div style={{ color: '#e0e0e0', fontFamily: 'monospace', fontSize: 13, padding: '0 8px', width: 220, overflowY: 'auto', maxHeight: 600 }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <span style={{ color: '#ffd700', fontSize: 16 }}>⚔ Hero</span>
        <span style={{ color: '#aaa', marginLeft: 8 }}>Lv.{level}</span>
        <span style={{ color: '#aaa', marginLeft: 8 }}>Floor {floor}</span>
      </div>

      {/* HP Bar */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#f44336' }}>HP</span>
          <span>{stats.hp}/{stats.maxHp}</span>
        </div>
        <div style={{ background: '#333', height: 8, borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${hpPct}%`, height: '100%', background: hpPct > 50 ? '#4caf50' : hpPct > 25 ? '#ff9800' : '#f44336', transition: 'width 0.2s' }} />
        </div>
      </div>

      {/* XP Bar */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#7c4dff' }}>XP</span>
          <span>{xp}/{xpToNext}</span>
        </div>
        <div style={{ background: '#333', height: 6, borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${xpPct}%`, height: '100%', background: '#7c4dff' }} />
        </div>
      </div>

      {/* Gold */}
      <div style={{ marginBottom: 10, color: '#ffd700' }}>💰 {gold} gold</div>

      {/* Stats */}
      <div style={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 4, padding: 6, marginBottom: 10 }}>
        <div style={{ color: '#7c4dff', marginBottom: 4 }}>Stats</div>
        {[
          ['⚔', 'ATK', stats.attack],
          ['🛡', 'DEF', stats.defense],
          ['💨', 'SPD', stats.speed],
          ['🎯', 'CRIT', `${stats.critChance}%`],
          ['💥', 'CDMG', `${stats.critDamage}%`],
        ].map(([icon, label, val]) => (
          <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{icon} {label}</span>
            <span style={{ color: '#fff' }}>{val}</span>
          </div>
        ))}
      </div>

      {/* Equipment */}
      <div style={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 4, padding: 6, marginBottom: 10 }}>
        <div style={{ color: '#ff9800', marginBottom: 4 }}>Equipment</div>
        {(['weapon', 'armor', 'ring', 'amulet'] as const).map(slot => {
          const item = equipment[slot];
          return (
            <div key={slot} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ color: '#666', textTransform: 'capitalize' }}>{slot}:</span>
              {item ? (
                <span style={{ color: RARITY_COLORS[item.rarity], fontSize: 11 }}>{item.name}</span>
              ) : (
                <span style={{ color: '#444' }}>—</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Inventory */}
      <div style={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 4, padding: 6 }}>
        <div style={{ color: '#4caf50', marginBottom: 4 }}>Inventory ({inventory.length})</div>
        {inventory.length === 0 && <div style={{ color: '#555' }}>Empty</div>}
        {inventory.map(item => (
          <div key={item.id} style={{ marginBottom: 4, borderBottom: '1px solid #222', paddingBottom: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: RARITY_COLORS[item.rarity], fontSize: 12 }}>{item.name}</span>
              <span style={{ color: '#666', fontSize: 10 }}>Lv{item.level}</span>
            </div>
            <div style={{ color: '#888', fontSize: 10, marginBottom: 2 }}>{item.description}</div>
            {item.slot === 'potion' ? (
              <button onClick={() => onUsePotion(item.id)} style={btnStyle('#1b5e20', '#4caf50')}>Use</button>
            ) : (
              <button onClick={() => onEquipItem(item.id)} style={btnStyle('#1a237e', '#2196f3')}>Equip</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function btnStyle(bg: string, color: string) {
  return {
    background: bg,
    color,
    border: `1px solid ${color}`,
    borderRadius: 3,
    padding: '1px 6px',
    cursor: 'pointer',
    fontSize: 11,
    fontFamily: 'monospace',
  };
}
