import { LevelUpOption, StatName } from './types';
import { shuffle } from './utils';

const ALL_OPTIONS: Array<Omit<LevelUpOption, 'amount'> & { amount: number }> = [
  { stat: 'maxHp',     label: 'Vitality',     amount: 15,  description: '+15 Max HP (and heal for that amount)' },
  { stat: 'attack',    label: 'Strength',     amount: 3,   description: '+3 Attack damage' },
  { stat: 'defense',   label: 'Resilience',   amount: 2,   description: '+2 Defense' },
  { stat: 'speed',     label: 'Agility',      amount: 2,   description: '+2 Speed (act first more often)' },
  { stat: 'critChance',label: 'Precision',    amount: 5,   description: '+5% Critical Hit Chance' },
  { stat: 'critDamage',label: 'Brutality',    amount: 25,  description: '+25% Critical Hit Damage' },
  { stat: 'attack',    label: 'Fury',         amount: 5,   description: '+5 Attack damage' },
  { stat: 'maxHp',     label: 'Fortitude',    amount: 25,  description: '+25 Max HP (and heal for that amount)' },
  { stat: 'defense',   label: 'Iron Skin',    amount: 4,   description: '+4 Defense' },
  { stat: 'critChance',label: 'Eagle Eye',    amount: 8,   description: '+8% Critical Hit Chance' },
];

export function generateLevelUpOptions(count = 3): LevelUpOption[] {
  return shuffle(ALL_OPTIONS).slice(0, count);
}
