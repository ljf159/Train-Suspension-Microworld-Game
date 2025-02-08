import { GameState } from '../types/index';
import { initialStations } from './initialStations';
import { initialTracks } from './initialTracks';
import { initializeFailurePoints } from '../utils/floodingUtils';
import { loadPersistedLogs } from '../utils/storageUtils';

// Initialize game state with failure points
const { updatedStations, updatedTracks } = initializeFailurePoints(
  initialStations,
  initialTracks,
  3 // Number of failure points
);

export const initialGameState: GameState = {
  round: 0,
  score: 0,
  decisionTimeRemaining: 30,
  stations: updatedStations,
  tracks: updatedTracks,
  trains: [
    // West-East Line 1 (North)
    {
      id: 0,
      stationId: 0,
      trackId: null,
      nodePosition: 0,
      capacity: 100,
      passengers: 50,
      status: 'running' as const,
      direction: 'forward' as const,
      lineId: 1,
      delayedRounds: 0,
      lastMoveRound: 0
    },
    {
      id: 1,
      stationId: 3,
      trackId: null,
      nodePosition: 0,
      capacity: 100,
      passengers: 40,
      status: 'running' as const,
      direction: 'backward' as const,
      lineId: 1,
      delayedRounds: 0,
      lastMoveRound: 0
    },
    
    // West-East Line 2 (South)
    {
      id: 2,
      stationId: 4,
      trackId: null,
      nodePosition: 0,
      capacity: 100,
      passengers: 45,
      status: 'running' as const,
      direction: 'forward' as const,
      lineId: 2,
      delayedRounds: 0,
      lastMoveRound: 0
    },
    {
      id: 3,
      stationId: 7,
      trackId: null,
      nodePosition: 0,
      capacity: 100,
      passengers: 35,
      status: 'running' as const,
      direction: 'backward' as const,
      lineId: 2,
      delayedRounds: 0,
      lastMoveRound: 0
    },
    
    // North-South Line 3 (Left)
    {
      id: 4,
      stationId: 8,
      trackId: null,
      nodePosition: 0,
      capacity: 100,
      passengers: 35,
      status: 'running' as const,
      direction: 'forward' as const,
      lineId: 3,
      delayedRounds: 0,
      lastMoveRound: 0
    },
    {
      id: 5,
      stationId: 11,
      trackId: null,
      nodePosition: 0,
      capacity: 100,
      passengers: 45,
      status: 'running' as const,
      direction: 'backward' as const,
      lineId: 3,
      delayedRounds: 0,
      lastMoveRound: 0
    },
    
    // North-South Line 4 (Right)
    {
      id: 6,
      stationId: 12,
      trackId: null,
      nodePosition: 0,
      capacity: 100,
      passengers: 40,
      status: 'running' as const,
      direction: 'forward' as const,
      lineId: 4,
      delayedRounds: 0,
      lastMoveRound: 0
    },
    {
      id: 7,
      stationId: 15,
      trackId: null,
      nodePosition: 0,
      capacity: 100,
      passengers: 30,
      status: 'running' as const,
      direction: 'backward' as const,
      lineId: 4,
      delayedRounds: 0,
      lastMoveRound: 0
    }
  ],
  selectedTrains: [],
  gameOver: false,
  evacuatedTrainIds: [],
  lastRoundScore: undefined,
  isPaused: false,
  // gameLogs: loadPersistedLogs(), // 从本地存储加载
  gameLogs: [], // 初始化空日志
  pendingActions: [], // 初始化空操作队列
  decisionTimeUsed: 0, // 初始化为0
}; 