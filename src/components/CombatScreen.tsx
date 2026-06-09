import React from 'react';
import { GameState } from '../game/types';
import { CombatLog as LogEntry } from '../game/types';

const LOG_COLORS: Record<string, string> = {
  player: '#81c784', enemy: '#ef9a9a', system: '#90caf9', loot: '#ffd700', levelup: '#ce93d8',
};

interface Props {
  state: GameState;
  onAttack: () => void;
  onFlee: () => void;
}

export default function CombatScreen({ state, onAttack, onFlee }: Props) {
  const { activeMob, player, combatLog } = state;
  if (!activeMob) return null;

  const ph = (player.stats.hp / player.stats.maxHp) * 100;
  const mh = (activeMob.stats.hp / activeMob.stats.maxHp) * 100;

  const bar = (pct: number, color?: string) => (
    <div style={{ background: '#222', height: 10, borderRadius: 5, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color ?? (pct > 50 ? '#4caf50' : pct > 25 ? '#ff9800' : '#f44336'), transition: 'width 0.3s' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontFamily: 'monospace' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', color: '#f44336', fontSize: 15, fontWeight: 'bold', letterSpacing: 2 }}>
        ⚔ COMBAT {activeMob.isBoss ? '— BOSS FIGHT' : ''}
      </div>

      {/* Combatants */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
        {/* Player */}
        <div style={{ flex: 1, background: '#0d1a0d', border: '1px solid #2e7d32', borderRadius: 8, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 4 }}>@</div>
          <div style={{ color: '#81c784', fontSize: 12, marginBottom: 4 }}>You · Lv {player.level}</div>
          <div style={{ color: '#aaa', fontSize: 11, marginBottom: 6 }}>{player.stats.hp}/{player.stats.maxHp}</div>
          {bar(ph)}
          <div style={{ marginTop: 8, fontSize: 10, color: '#555' }}>
            ATK {player.stats.attack} · DEF {player.stats.defense}
          </div>
        </div>

        {/* VS */}
        <div style={{ display: 'flex', alignItems: 'center', color: '#555', fontSize: 13, fontWeight: 'bold' }}>VS</div>

        {/* Mob */}
        <div style={{ flex: 1, background: '#1a0d0d', border: `1px solid ${activeMob.color}55`, borderRadius: 8, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 36, color: activeMob.color, marginBottom: 4 }}>{activeMob.symbol}</div>
          <div style={{ color: activeMob.color, fontSize: 12, marginBottom: 4 }}>{activeMob.name}</div>
          <div style={{ color: '#aaa', fontSize: 11, marginBottom: 6 }}>{activeMob.stats.hp}/{activeMob.stats.maxHp}</div>
          {bar(mh, activeMob.color + 'cc')}
          {activeMob.isBoss && <div style={{ marginTop: 6, fontSize: 10, color: '#ff9800' }}>★ BOSS ★</div>}
          <div style={{ marginTop: 4, fontSize: 10, color: '#555' }}>
            ATK {activeMob.stats.attack} · DEF {activeMob.stats.defense}
          </div>
        </div>
      </div>

      {/* Combat log */}
      <div style={{ background: '#080810', border: '1px solid #222', borderRadius: 6, padding: '8px 10px', height: 100, overflowY: 'auto', fontSize: 12 }}>
        {combatLog.slice(0, 8).map(e => (
          <div key={e.id} style={{ color: LOG_COLORS[e.type] ?? '#ccc', marginBottom: 3 }}>{e.text}</div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onTouchStart={onAttack} onClick={onAttack}
          style={{ flex: 2, background: '#7f0000', color: '#fff', border: '2px solid #f44336', borderRadius: 10, padding: '16px 0', fontSize: 16, fontWeight: 'bold', fontFamily: 'monospace', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
        >
          ⚔ ATTACK
        </button>
        {!activeMob.isBoss && (
          <button
            onTouchStart={onFlee} onClick={onFlee}
            style={{ flex: 1, background: '#1a1a2e', color: '#90caf9', border: '1px solid #2196f3', borderRadius: 10, padding: '16px 0', fontSize: 14, fontFamily: 'monospace', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
          >
            🏃 Flee
          </button>
        )}
      </div>
    </div>
  );
}
