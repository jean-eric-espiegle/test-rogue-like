import { useReducer } from 'react';
import { GameState, LevelUpOption } from '../game/types';
import {
  createGame, enterRoom, doCombatRound, chooseLevelUp,
  equipItem, usePotion, buyShopItem, leaveShop,
  collectTreasureItem, doRest, fleeCombat,
} from '../game/engine';

type Action =
  | { type: 'ENTER_ROOM'; nodeId: string }
  | { type: 'COMBAT_ROUND' }
  | { type: 'LEVELUP'; option: LevelUpOption }
  | { type: 'EQUIP'; itemId: string }
  | { type: 'USE_POTION'; itemId: string }
  | { type: 'BUY'; itemId: string }
  | { type: 'LEAVE_SHOP' }
  | { type: 'COLLECT_TREASURE'; itemId: string }
  | { type: 'REST'; action: 'heal' | 'upgrade' }
  | { type: 'FLEE' }
  | { type: 'NEW_GAME' };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'ENTER_ROOM': return enterRoom(state, action.nodeId);
    case 'COMBAT_ROUND': return doCombatRound(state);
    case 'LEVELUP': return chooseLevelUp(state, action.option);
    case 'EQUIP': return equipItem(state, action.itemId);
    case 'USE_POTION': return usePotion(state, action.itemId);
    case 'BUY': return buyShopItem(state, action.itemId);
    case 'LEAVE_SHOP': return leaveShop(state);
    case 'COLLECT_TREASURE': return collectTreasureItem(state, action.itemId);
    case 'REST': return doRest(state, action.action);
    case 'FLEE': return fleeCombat(state);
    case 'NEW_GAME': return createGame();
    default: return state;
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(reducer, undefined, createGame);
  return {
    state,
    enterRoom: (nodeId: string) => dispatch({ type: 'ENTER_ROOM', nodeId }),
    combatRound: () => dispatch({ type: 'COMBAT_ROUND' }),
    chooseLevelUp: (option: LevelUpOption) => dispatch({ type: 'LEVELUP', option }),
    equipItem: (id: string) => dispatch({ type: 'EQUIP', itemId: id }),
    usePotion: (id: string) => dispatch({ type: 'USE_POTION', itemId: id }),
    buyItem: (id: string) => dispatch({ type: 'BUY', itemId: id }),
    leaveShop: () => dispatch({ type: 'LEAVE_SHOP' }),
    collectTreasure: (id: string) => dispatch({ type: 'COLLECT_TREASURE', itemId: id }),
    rest: (action: 'heal' | 'upgrade') => dispatch({ type: 'REST', action }),
    flee: () => dispatch({ type: 'FLEE' }),
    newGame: () => dispatch({ type: 'NEW_GAME' }),
  };
}
