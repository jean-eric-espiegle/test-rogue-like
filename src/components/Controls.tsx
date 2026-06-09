import React from 'react';

interface Props {
  onMove: (dx: number, dy: number) => void;
  disabled?: boolean;
}

const btnStyle = (disabled?: boolean) => ({
  background: disabled ? '#1a1a1a' : '#1a1a2e',
  color: disabled ? '#444' : '#90caf9',
  border: `1px solid ${disabled ? '#333' : '#2196f3'}`,
  borderRadius: 4,
  width: 40,
  height: 40,
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontFamily: 'monospace',
  fontSize: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export default function Controls({ onMove, disabled }: Props) {
  return (
    <div>
      <div style={{ color: '#555', fontSize: 11, marginBottom: 4, fontFamily: 'monospace', textAlign: 'center' }}>
        Arrow keys / WASD / HJKL
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 40px)', gridTemplateRows: 'repeat(3, 40px)', gap: 4 }}>
        <div />
        <button style={btnStyle(disabled)} onClick={() => !disabled && onMove(0, -1)}>↑</button>
        <div />
        <button style={btnStyle(disabled)} onClick={() => !disabled && onMove(-1, 0)}>←</button>
        <div style={{ ...btnStyle(disabled), background: '#111', borderColor: '#222', color: '#333' }}>·</div>
        <button style={btnStyle(disabled)} onClick={() => !disabled && onMove(1, 0)}>→</button>
        <div />
        <button style={btnStyle(disabled)} onClick={() => !disabled && onMove(0, 1)}>↓</button>
        <div />
      </div>
    </div>
  );
}
