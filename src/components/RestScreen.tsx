import React from 'react';
import { Player } from '../game/types';

interface Props {
  player: Player;
  onRest: (action: 'heal' | 'upgrade') => void;
}

export default function RestScreen({ player, onRest }: Props) {
  const healAmt = Math.round(player.stats.maxHp * 0.3);
  const healed = Math.min(healAmt, player.stats.maxHp - player.stats.hp);
  const atFullHp = player.stats.hp >= player.stats.maxHp;

  return (
    <div style={{ fontFamily: 'monospace', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🔥</div>
        <div style={{ color: '#ff7043', fontSize: 18, fontWeight: 'bold' }}>Campfire</div>
        <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>Rest and recover, or train your skills.</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={() => !atFullHp && onRest('heal')}
          disabled={atFullHp}
          style={{
            background: atFullHp ? '#111' : '#1b3a1b',
            color: atFullHp ? '#444' : '#81c784',
            border: `2px solid ${atFullHp ? '#333' : '#4caf50'}`,
            borderRadius: 10, padding: '16px', cursor: atFullHp ? 'not-allowed' : 'pointer',
            fontFamily: 'monospace', fontSize: 14, textAlign: 'left',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>❤️ Rest & Heal</div>
          <div style={{ fontSize: 12, color: atFullHp ? '#555' : '#aaa' }}>
            {atFullHp ? 'Already at full HP' : `Recover ${healed} HP (30% of max)`}
          </div>
        </button>

        <button
          onClick={() => onRest('upgrade')}
          style={{
            background: '#1a1a2e', color: '#ce93d8',
            border: '2px solid #9c27b0',
            borderRadius: 10, padding: '16px', cursor: 'pointer',
            fontFamily: 'monospace', fontSize: 14, textAlign: 'left',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>✨ Train & Upgrade</div>
          <div style={{ fontSize: 12, color: '#aaa' }}>Choose a permanent stat improvement</div>
        </button>
      </div>
    </div>
  );
}
