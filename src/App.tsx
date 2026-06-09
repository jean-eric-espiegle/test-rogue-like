import React from 'react';
import { useGame } from './hooks/useGame';
import MapView from './components/MapView';
import CombatScreen from './components/CombatScreen';
import LevelUpModal from './components/LevelUpModal';
import ShopModal from './components/ShopModal';
import TreasureModal from './components/TreasureModal';
import RestScreen from './components/RestScreen';
import HeroPanel from './components/HeroPanel';

const PHASE_TITLES: Partial<Record<string, string>> = {
  map: 'Choose Your Path',
  combat: 'Combat',
  levelup: 'Level Up!',
  shop: 'Shop',
  treasure: 'Treasure',
  rest: 'Campfire',
};

export default function App() {
  const { state, enterRoom, combatRound, chooseLevelUp, equipItem, usePotion, buyItem, leaveShop, collectTreasure, rest, flee, newGame } = useGame();
  const { phase, player, levelUpOptions, shopItems, pendingItems, floor } = state;

  if (phase === 'gameover') {
    return (
      <Screen>
        <div style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>💀</div>
          <div style={{ color: '#f44336', fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>GAME OVER</div>
          <div style={{ color: '#888', fontSize: 14, marginBottom: 6 }}>You fell in the dungeon.</div>
          <div style={{ color: '#555', fontSize: 13, marginBottom: 32 }}>Level {player.level} · Floor {floor} · {player.gold}g</div>
          <BigButton onClick={newGame} color="#f44336" bg="#7f0000">Play Again</BigButton>
        </div>
      </Screen>
    );
  }

  if (phase === 'victory') {
    return (
      <Screen>
        <div style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🏆</div>
          <div style={{ color: '#ffd700', fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>VICTORY!</div>
          <div style={{ color: '#ccc', fontSize: 14, marginBottom: 6 }}>You conquered the dungeon!</div>
          <div style={{ color: '#888', fontSize: 13, marginBottom: 32 }}>Level {player.level} · {player.gold}g collected</div>
          <BigButton onClick={newGame} color="#ffd700" bg="#1b5e20">Play Again</BigButton>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      {/* Top bar */}
      <div style={{ background: '#080810', borderBottom: '1px solid #1a1a2e', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <span style={{ color: '#7c4dff', fontFamily: 'monospace', fontWeight: 'bold', fontSize: 14 }}>⚔ DUNGEON</span>
        <span style={{ color: '#ffd700', fontFamily: 'monospace', fontSize: 13 }}>Floor {floor}/5</span>
        <span style={{ color: '#aaa', fontFamily: 'monospace', fontSize: 12 }}>
          ❤️ {player.stats.hp}/{player.stats.maxHp}
        </span>
      </div>

      {/* Phase title */}
      <div style={{ background: '#0d0d1a', borderBottom: '1px solid #111', padding: '8px 16px', fontFamily: 'monospace', fontSize: 13, color: '#666', textAlign: 'center' }}>
        {PHASE_TITLES[phase] ?? phase}
      </div>

      {/* Main content */}
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 24 }}>

        {phase === 'map' && (
          <MapView map={state.map} floor={floor} onEnterRoom={enterRoom} />
        )}

        {phase === 'combat' && (
          <CombatScreen state={state} onAttack={combatRound} onFlee={flee} />
        )}

        {phase === 'levelup' && (
          <LevelUpModal options={levelUpOptions} playerLevel={player.level} onChoose={chooseLevelUp} />
        )}

        {phase === 'shop' && (
          <ShopModal items={shopItems} playerGold={player.gold} onBuy={buyItem} onClose={leaveShop} />
        )}

        {phase === 'treasure' && (
          <TreasureModal items={pendingItems} onCollect={collectTreasure} />
        )}

        {phase === 'rest' && (
          <RestScreen player={player} onRest={rest} />
        )}

        {/* Hero panel — always visible */}
        <HeroPanel player={player} onUsePotion={usePotion} onEquipItem={equipItem} />
      </div>
    </Screen>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a14', maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  );
}

function BigButton({ onClick, color, bg, children }: { onClick: () => void; color: string; bg: string; children: React.ReactNode }) {
  return (
    <button onTouchStart={onClick} onClick={onClick} style={{ background: bg, color, border: `2px solid ${color}`, borderRadius: 12, padding: '16px 40px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 18, fontWeight: 'bold', WebkitTapHighlightColor: 'transparent' }}>
      {children}
    </button>
  );
}
