import React, { useState } from 'react';
import { Player } from '../game/types';

const RC: Record<string, string> = { common: '#aaa', uncommon: '#4caf50', rare: '#2196f3', epic: '#9c27b0', legendary: '#ff9800' };

interface Props {
  player: Player;
  onUsePotion: (id: string) => void;
  onEquipItem: (id: string) => void;
}

export default function HeroPanel({ player, onUsePotion, onEquipItem }: Props) {
  const [tab, setTab] = useState<'stats' | 'inventory'>('stats');
  const { stats, equipment, inventory, level, xp, xpToNext, gold } = player;
  const hp = (stats.hp / stats.maxHp) * 100;
  const xpp = (xp / xpToNext) * 100;

  return (
    <div style={{ background: '#0d0d1a', border: '1px solid #222', borderRadius: 12, fontFamily: 'monospace', fontSize: 13, color: '#e0e0e0', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: '#111', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ color: '#ffd700', fontWeight: 'bold' }}>⚔ Hero</span>
          <span style={{ color: '#aaa', marginLeft: 8, fontSize: 12 }}>Lv.{level}</span>
        </div>
        <span style={{ color: '#ffd700', fontSize: 13 }}>💰 {gold}g</span>
      </div>

      {/* HP & XP */}
      <div style={{ padding: '10px 14px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
          <span style={{ color: '#f44336' }}>HP {stats.hp}/{stats.maxHp}</span>
          <span style={{ color: '#7c4dff' }}>XP {xp}/{xpToNext}</span>
        </div>
        <div style={{ background: '#222', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 4 }}>
          <div style={{ width: `${hp}%`, height: '100%', background: hp > 50 ? '#4caf50' : hp > 25 ? '#ff9800' : '#f44336', transition: 'width 0.3s' }} />
        </div>
        <div style={{ background: '#222', height: 5, borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${xpp}%`, height: '100%', background: '#7c4dff' }} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #222' }}>
        {(['stats', 'inventory'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '8px 0', background: tab === t ? '#1a1a2e' : 'transparent',
            color: tab === t ? '#fff' : '#555', border: 'none', cursor: 'pointer',
            fontFamily: 'monospace', fontSize: 12, textTransform: 'capitalize',
            borderBottom: tab === t ? '2px solid #7c4dff' : '2px solid transparent',
          }}>
            {t} {t === 'inventory' && inventory.length > 0 ? `(${inventory.length})` : ''}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: '10px 14px', maxHeight: 220, overflowY: 'auto' }}>
        {tab === 'stats' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', marginBottom: 10 }}>
              {[['⚔', 'ATK', stats.attack], ['🛡', 'DEF', stats.defense], ['💨', 'SPD', stats.speed], ['🎯', 'CRIT', `${stats.critChance}%`], ['💥', 'CDMG', `${stats.critDamage}%`]].map(([i, l, v]) => (
                <div key={l as string} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#666' }}>{i} {l}</span>
                  <span style={{ color: '#fff' }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid #222', paddingTop: 8 }}>
              <div style={{ color: '#ff9800', fontSize: 11, marginBottom: 6 }}>Equipment</div>
              {(['weapon', 'armor', 'ring', 'amulet'] as const).map(slot => {
                const item = equipment[slot];
                return (
                  <div key={slot} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 11 }}>
                    <span style={{ color: '#555', textTransform: 'capitalize' }}>{slot}</span>
                    {item ? <span style={{ color: RC[item.rarity] }}>{item.name}</span> : <span style={{ color: '#333' }}>—</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'inventory' && (
          <div>
            {inventory.length === 0 && <div style={{ color: '#444', textAlign: 'center', padding: '20px 0' }}>Empty</div>}
            {inventory.map(item => (
              <div key={item.id} style={{ background: '#111', border: `1px solid ${RC[item.rarity]}33`, borderRadius: 6, padding: '8px 10px', marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                  <span style={{ color: RC[item.rarity], fontSize: 12, fontWeight: 'bold' }}>{item.name}</span>
                  <span style={{ color: '#555', fontSize: 10 }}>Lv{item.level}</span>
                </div>
                <div style={{ color: '#777', fontSize: 10, marginBottom: 6 }}>{item.description}</div>
                {item.slot === 'potion'
                  ? <button onTouchStart={() => onUsePotion(item.id)} onClick={() => onUsePotion(item.id)} style={actionBtn('#1b5e20', '#4caf50')}>Use</button>
                  : <button onTouchStart={() => onEquipItem(item.id)} onClick={() => onEquipItem(item.id)} style={actionBtn('#1a237e', '#2196f3')}>Equip</button>
                }
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function actionBtn(bg: string, color: string): React.CSSProperties {
  return { background: bg, color, border: `1px solid ${color}`, borderRadius: 5, padding: '4px 12px', cursor: 'pointer', fontSize: 11, fontFamily: 'monospace', WebkitTapHighlightColor: 'transparent' };
}
