import { useReducer, useCallback, useEffect } from 'react';
import { GameState, LevelUpOption } from '../game/types';
import {
  createGame, movePlayer, doCombatRound, chooseLevelUp,
  equipItem, usePotion, buyShopItem, closeShop,
  collectTreasureItem, fleeCombat,
} from '../game/engine';

type Action =
  | { type: 'MOVE'; dx: number; dy: number }
  | { type: 'COMBAT_ROUND' }
  | { type: 'LEVELUP'; option: LevelUpOption }
  | { type: 'EQUIP'; itemId: string }
  | { type: 'USE_POTION'; itemId: string }
  | { type: 'BUY'; itemId: string }
  | { type: 'CLOSE_SHOP' }
  | { type: 'COLLECT_TREASURE'; itemId: string }
  | { type: 'FLEE' }
  | { type: 'NEW_GAME' };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'MOVE': return movePlayer(state, action.dx, action.dy);
    case 'COMBAT_ROUND': return doCombatRound(state);
    case 'LEVELUP': return chooseLevelUp(state, action.option);
    case 'EQUIP': return equipItem(state, action.itemId);
    case 'USE_POTION': return usePotion(state, action.itemId);
    case 'BUY': return buyShopItem(state, action.itemId);
    case 'CLOSE_SHOP': return closeShop(state);
    case 'COLLECT_TREASURE': return collectTreasureItem(state, action.itemId);
    case 'FLEE': return fleeCombat(state);
    case 'NEW_GAME': return createGame();
    default: return state;
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(reducer, undefined, createGame);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (state.phase === 'playing') {
      const moves: Record<string, [number, number]> = {
        ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
        w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
        k: [0, -1], j: [0, 1], h: [-1, 0], l: [1, 0],
      };
      const move = moves[e.key];
      if (move) {
        e.preventDefault();
        dispatch({ type: 'MOVE', dx: move[0], dy: move[1] });
      }
    }
    if (state.phase === 'combat' && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      dispatch({ type: 'COMBAT_ROUND' });
    }
    if (state.phase === 'combat' && e.key === 'f') {
      dispatch({ type: 'FLEE' });
    }
  }, [state.phase]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    state,
    move: (dx: number, dy: number) => dispatch({ type: 'MOVE', dx, dy }),
    combatRound: () => dispatch({ type: 'COMBAT_ROUND' }),
    chooseLevelUp: (option: LevelUpOption) => dispatch({ type: 'LEVELUP', option }),
    equipItem: (id: string) => dispatch({ type: 'EQUIP', itemId: id }),
    usePotion: (id: string) => dispatch({ type: 'USE_POTION', itemId: id }),
    buyItem: (id: string) => dispatch({ type: 'BUY', itemId: id }),
    closeShop: () => dispatch({ type: 'CLOSE_SHOP' }),
    collectTreasure: (id: string) => dispatch({ type: 'COLLECT_TREASURE', itemId: id }),
    flee: () => dispatch({ type: 'FLEE' }),
    newGame: () => dispatch({ type: 'NEW_GAME' }),
  };
}
