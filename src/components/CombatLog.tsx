import React, { useRef, useEffect } from 'react';
import { CombatLog as LogEntry } from '../game/types';

const LOG_COLORS: Record<string, string> = {
  player: '#81c784',
  enemy: '#ef9a9a',
  system: '#90caf9',
  loot: '#ffd700',
  levelup: '#ce93d8',
};

interface Props {
  logs: LogEntry[];
}

export default function CombatLog({ logs }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = 0;
  }, [logs.length]);

  return (
    <div style={{
      width: '100%',
      background: '#0a0a18',
      border: '1px solid #333',
      borderRadius: 4,
      padding: '6px 8px',
      height: 140,
      overflowY: 'auto',
      fontFamily: 'monospace',
      fontSize: 12,
    }} ref={ref}>
      {logs.map(entry => (
        <div key={entry.id} style={{ color: LOG_COLORS[entry.type] ?? '#ccc', marginBottom: 2 }}>
          {entry.text}
        </div>
      ))}
    </div>
  );
}
