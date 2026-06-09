import React from 'react';
import { GameState } from '../game/types';

interface Props {
  state: GameState;
  onAttack: () => void;
  onFlee: () => void;
}

export default function CombatView({ state, onAttack, onFlee }: Props) {
  const { activeMob, player } = state;
  if (!activeMob) return null;

  const playerHpPct = (player.stats.hp / player.stats.maxHp) * 100;
  const mobHpPct = (activeMob.stats.hp / activeMob.stats.maxHp) * 100;

  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'monospace',
    }}>
      <div style={{ background: '#0d0d1a', border: '2px solid #7c4dff', borderRadius: 8, padding: 24, width: 460, color: '#e0e0e0' }}>
        <div style={{ textAlign: 'center', fontSize: 18, color: '#f44336', marginBottom: 16 }}>
          ⚔ COMBAT ⚔
        </div>

        {/* Combatants */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          {/* Player */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 36 }}>@</div>
            <div style={{ color: '#fff', marginBottom: 4 }}>You (Lv {player.level})</div>
            <div style={{ color: '#aaa', fontSize: 12, marginBottom: 6 }}>{player.stats.hp}/{player.stats.maxHp} HP</div>
            <div style={{ background: '#333', height: 8, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${playerHpPct}%`, height: '100%', background: playerHpPct > 50 ? '#4caf50' : playerHpPct > 25 ? '#ff9800' : '#f44336' }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', fontSize: 24, color: '#ff5722', padding: '0 16px' }}>VS</div>

          {/* Mob */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 36, color: activeMob.color }}>{activeMob.symbol}</div>
            <div style={{ color: activeMob.color, marginBottom: 4 }}>{activeMob.name}</div>
            <div style={{ color: '#aaa', fontSize: 12, marginBottom: 6 }}>{activeMob.stats.hp}/{activeMob.stats.maxHp} HP</div>
            <div style={{ background: '#333', height: 8, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${mobHpPct}%`, height: '100%', background: mobHpPct > 50 ? '#4caf50' : mobHpPct > 25 ? '#ff9800' : '#f44336' }} />
            </div>
            {activeMob.isBoss && <div style={{ color: '#ff9800', fontSize: 11, marginTop: 4 }}>★ BOSS ★</div>}
          </div>
        </div>

        {/* Mob stats */}
        <div style={{ background: '#1a1a2e', borderRadius: 4, padding: '6px 10px', marginBottom: 12, fontSize: 11, color: '#888' }}>
          ATK {activeMob.stats.attack} | DEF {activeMob.stats.defense} | SPD {activeMob.stats.speed}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onAttack} style={{
            flex: 2, background: '#b71c1c', color: '#fff', border: '1px solid #f44336',
            borderRadius: 4, padding: '10px 0', cursor: 'pointer', fontFamily: 'monospace',
            fontSize: 14, fontWeight: 'bold',
          }}>
            ⚔ Attack [Space]
          </button>
          <button onClick={onFlee} style={{
            flex: 1, background: '#1a237e', color: '#90caf9', border: '1px solid #2196f3',
            borderRadius: 4, padding: '10px 0', cursor: 'pointer', fontFamily: 'monospace',
            fontSize: 14,
          }}>
            🏃 Flee [F]
          </button>
        </div>

        <div style={{ marginTop: 8, fontSize: 11, color: '#555', textAlign: 'center' }}>
          Press Space to attack, F to flee
        </div>
      </div>
    </div>
  );
}
