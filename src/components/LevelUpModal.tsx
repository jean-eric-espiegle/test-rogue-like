import React from 'react';
import { LevelUpOption } from '../game/types';

const ICONS: Record<string, string> = { maxHp: '❤️', attack: '⚔️', defense: '🛡️', speed: '💨', critChance: '🎯', critDamage: '💥' };

interface Props {
  options: LevelUpOption[];
  playerLevel: number;
  onChoose: (o: LevelUpOption) => void;
}

export default function LevelUpModal({ options, playerLevel, onChoose }: Props) {
  return (
    <div style={{ fontFamily: 'monospace', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 6 }}>✨</div>
        <div style={{ color: '#ffd700', fontSize: 20, fontWeight: 'bold' }}>LEVEL UP!</div>
        <div style={{ color: '#aaa', fontSize: 13, marginTop: 4 }}>Level {playerLevel} reached! Choose a stat to improve:</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {options.map((opt, i) => (
          <button key={i} onClick={() => onChoose(opt)}
            style={{ background: '#1a1a2e', border: '2px solid #7c4dff', borderRadius: 10, padding: '14px 16px', cursor: 'pointer', color: '#e0e0e0', fontFamily: 'monospace', textAlign: 'left', WebkitTapHighlightColor: 'transparent' }}
            onTouchStart={() => onChoose(opt)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 26 }}>{ICONS[opt.stat]}</span>
              <div>
                <div style={{ color: '#ffd700', fontWeight: 'bold', fontSize: 15, marginBottom: 3 }}>{opt.label}</div>
                <div style={{ color: '#aaa', fontSize: 12 }}>{opt.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
