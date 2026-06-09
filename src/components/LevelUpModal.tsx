import React from 'react';
import { LevelUpOption } from '../game/types';

interface Props {
  options: LevelUpOption[];
  playerLevel: number;
  onChoose: (option: LevelUpOption) => void;
}

const STAT_ICONS: Record<string, string> = {
  maxHp: '❤️',
  attack: '⚔️',
  defense: '🛡️',
  speed: '💨',
  critChance: '🎯',
  critDamage: '💥',
};

export default function LevelUpModal({ options, playerLevel, onChoose }: Props) {
  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'monospace',
    }}>
      <div style={{ background: '#0d0d1a', border: '2px solid #ffd700', borderRadius: 8, padding: 28, width: 460, color: '#e0e0e0' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 24, color: '#ffd700' }}>✨ LEVEL UP! ✨</div>
          <div style={{ color: '#aaa', marginTop: 4 }}>You reached level {playerLevel}!</div>
          <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>Choose a stat to improve:</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => onChoose(opt)}
              style={{
                background: '#1a1a2e',
                border: '1px solid #7c4dff',
                borderRadius: 6,
                padding: '12px 16px',
                cursor: 'pointer',
                color: '#e0e0e0',
                fontFamily: 'monospace',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.background = '#2a1a4e'; (e.target as HTMLElement).style.borderColor = '#b39ddb'; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.background = '#1a1a2e'; (e.target as HTMLElement).style.borderColor = '#7c4dff'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>{STAT_ICONS[opt.stat]}</span>
                <div>
                  <div style={{ color: '#ffd700', fontWeight: 'bold', marginBottom: 2 }}>{opt.label}</div>
                  <div style={{ color: '#aaa', fontSize: 12 }}>{opt.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
