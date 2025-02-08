import { GameState, StationAction, PlayerSelectActionLog, Train, TrainLocation } from '../types/index';
import { DECISION_TIME } from '../hooks/useGameState';
import { handleEvacuation } from '../utils/trainUtils';

export const storePlayerAction = (
  state: GameState,
  actionType: StationAction,
  targetTrain: Train,
  targetLocation: TrainLocation,
): GameState => {

  if (!['evacuate', 'start', 'stop', 'reverse'].includes(actionType)) {
    console.warn('非法操作类型:', actionType);
    return state;
  }

  const newAction: PlayerSelectActionLog = {
    type: actionType,
    targetTrain,
    targetLocation,
    timestamp: new Date().toISOString(),
    round: state.round,
    selectTimeUsed: DECISION_TIME - state.decisionTimeRemaining
  };

  console.log('记录新操作:', newAction);

  return {
    ...state,
    pendingActions: [...state.pendingActions, newAction]
  };
};

export const processPendingActions = (state: GameState): GameState => {
  let newState = { ...state };
  
  state.pendingActions.forEach(action => {
    newState = applyAction(newState, action);
  });
  
  return newState;
};

const applyAction = (state: GameState, action: PlayerSelectActionLog): GameState => {
  const updatedTrains = state.trains.map(t => {
    if (t.id !== action.targetTrain.id) return t;

    switch (action.type) {
      case 'start':
        return { ...t, status: 'running' as const };
      case 'stop':
        return { ...t, status: 'stopped' as const };
      case 'reverse': {
        const newDirection = t.direction === 'forward' ? 
          ('backward' as const) : 
          ('forward' as const);
        return { 
          ...t, 
          direction: newDirection
        };
      }
      case 'evacuate':
        if (action.targetLocation.type === 'station') {
          const station = state.stations.find(s => s.id === action.targetLocation.id);
          if (!station) return t;
          const { updatedStation, updatedTrain } = handleEvacuation(station, t);
          return {
            ...updatedTrain,
            status: 'stopped' as const
          };
        }
        return t;
      default:
        return t;
    }
  });

  return {
    ...state,
    trains: updatedTrains,
    evacuatedTrainIds: action.type === 'evacuate' ? 
      [...state.evacuatedTrainIds, action.targetTrain.id] : 
      state.evacuatedTrainIds
  };
};

// export const removePendingActionsForTrain = (
//   state: GameState,
//   trainId: number
// ): GameState => {
//   return {
//     ...state,
//     pendingActions: state.pendingActions.filter(
//       action => action.targetTrain.id !== trainId
//     )
//   };
// }; 