import React from 'react';
import { useGame } from './hooks/useGame';
import DungeonMap from './components/DungeonMap';
import PlayerPanel from './components/PlayerPanel';
import CombatView from './components/CombatView';
import LevelUpModal from './components/LevelUpModal';
import ShopModal from './components/ShopModal';
import TreasureModal from './components/TreasureModal';
import CombatLog from './components/CombatLog';
import Controls from './components/Controls';
import MiniMap from './components/MiniMap';

function App() {
  const {
    state, move, combatRound, chooseLevelUp,
    equipItem, usePotion, buyItem, closeShop,
    collectTreasure, flee, newGame,
  } = useGame();

  const { phase, player, combatLog, activeMob, levelUpOptions, shopItems, pendingItems, floor } = state;

  if (phase === 'gameover') {
    return (
      <div style={overlayStyle}>
        <div style={cardStyle('#3a0000', '#f44336')}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>💀 GAME OVER 💀</div>
          <div style={{ color: '#aaa', marginBottom: 8 }}>You fell in the dungeon.</div>
          <div style={{ color: '#888', marginBottom: 24, fontSize: 13 }}>
            Level {player.level} · Floor {floor} · {player.gold} gold
          </div>
          <button onClick={newGame} style={bigBtnStyle('#7f0000', '#f44336')}>Play Again</button>
        </div>
      </div>
    );
  }

  if (phase === 'victory') {
    return (
      <div style={overlayStyle}>
        <div style={cardStyle('#1a3a00', '#ffd700')}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>🏆 VICTORY! 🏆</div>
          <div style={{ color: '#ccc', marginBottom: 8 }}>You conquered the dungeon!</div>
          <div style={{ color: '#aaa', marginBottom: 24, fontSize: 13 }}>
            Level {player.level} · {player.gold} gold collected
          </div>
          <button onClick={newGame} style={bigBtnStyle('#1b5e20', '#ffd700')}>Play Again</button>
        </div>
      </div>
    );
  }

  const currentRoom = state.rooms.find(r => {
    const tile = state.map[player.pos.y]?.[player.pos.x];
    return r.id === tile?.roomId;
  });

  const roomTypeLabel = currentRoom ? {
    normal: 'Normal Room',
    start: 'Starting Room',
    treasure: '★ Treasure Room',
    shop: '🛒 Shop',
    boss: '☠ Boss Room',
  }[currentRoom.type] : '';

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a14',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      fontFamily: 'monospace',
    }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* Left: player panel */}
        <PlayerPanel player={player} onUsePotion={usePotion} onEquipItem={equipItem} />

        {/* Center: map + log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Header bar */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: '#0d0d1a', border: '1px solid #333', borderRadius: 4,
            padding: '4px 12px', color: '#e0e0e0', fontSize: 13,
          }}>
            <span style={{ color: '#7c4dff' }}>⚔ DUNGEON CRAWLER</span>
            <span style={{ color: '#aaa' }}>Floor {floor}/10</span>
            <span style={{ color: '#ffd700' }}>
              {roomTypeLabel}
            </span>
            {phase === 'playing' && currentRoom?.type !== 'boss' && currentRoom?.mobs && currentRoom.mobs.length > 0 && (
              <span style={{ color: '#f44336' }}>⚠ {currentRoom.mobs.length} enemies!</span>
            )}
          </div>

          {/* Map */}
          <div style={{ position: 'relative' }}>
            <DungeonMap state={state} />

            {phase === 'combat' && activeMob && (
              <CombatView state={state} onAttack={combatRound} onFlee={flee} />
            )}
            {phase === 'levelup' && (
              <LevelUpModal options={levelUpOptions} playerLevel={player.level} onChoose={chooseLevelUp} />
            )}
            {phase === 'shop' && (
              <ShopModal items={shopItems} playerGold={player.gold} onBuy={buyItem} onClose={closeShop} />
            )}
            {phase === 'treasure' && (
              <TreasureModal items={pendingItems} onCollect={collectTreasure} />
            )}
          </div>

          {/* Combat log */}
          <CombatLog logs={combatLog} />

          {/* Status hint */}
          <div style={{ color: '#555', fontSize: 11, textAlign: 'center' }}>
            {phase === 'playing' && 'Move: Arrow keys / WASD / HJKL  ·  Reach the > stairs to descend'}
            {phase === 'combat' && 'Press Space to attack · F to flee'}
          </div>
        </div>

        {/* Right: controls + minimap */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Controls onMove={move} disabled={phase !== 'playing'} />

          <div>
            <div style={{ color: '#555', fontSize: 11, marginBottom: 4, textAlign: 'center' }}>Mini Map</div>
            <MiniMap state={state} />
          </div>

          {/* Legend */}
          <div style={{ background: '#0d0d1a', border: '1px solid #222', borderRadius: 4, padding: 8, fontSize: 11, color: '#666' }}>
            <div style={{ color: '#888', marginBottom: 4 }}>Legend</div>
            {[
              ['@', '#fff', 'You'],
              ['>', '#ffd700', 'Stairs'],
              ['★', '#ffd700', 'Treasure'],
              ['$', '#00bcd4', 'Shop'],
              ['☠', '#f44336', 'Boss'],
            ].map(([sym, color, label]) => (
              <div key={sym as string} style={{ display: 'flex', gap: 6, marginBottom: 2 }}>
                <span style={{ color: color as string, width: 12, textAlign: 'center' }}>{sym}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: '#0a0a14',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'monospace',
};

function cardStyle(bg: string, border: string): React.CSSProperties {
  return {
    background: bg,
    border: `2px solid ${border}`,
    borderRadius: 8,
    padding: 40,
    textAlign: 'center' as const,
    color: '#fff',
  };
}

function bigBtnStyle(bg: string, color: string): React.CSSProperties {
  return {
    background: bg,
    color,
    border: `2px solid ${color}`,
    borderRadius: 6,
    padding: '12px 32px',
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: 'bold',
  };
}

export default App;
