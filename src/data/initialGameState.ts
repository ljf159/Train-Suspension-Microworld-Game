import { GameState } from '../types/index';
import { initialStations } from './initialStations';
import { initialTracks } from './initialTracks';
import { initializeFailurePoints } from '../utils/floodingUtils';

// Initialize game state with failure points
const { updatedStations, updatedTracks } = initializeFailurePoints(
  initialStations,
  initialTracks,
  3 // Number of failure points
);

export const defaultDecisionTime = 30;

// Scoring
export const delayScorePerPassenger = 5;
export const evacuationScorePerPassenger = -15;
export const trappedInTrackScorePerPassenger = -50;

// Flooding
export const PROPAGATION_FLOOD_INCREASE = 6;  // 节点与节点之间传播时，接收节点水位上涨的最大量
export const PROPAGATION_THRESHOLD = 20;   // 节点与节点之间传播时，水位上涨的阈值，超过这个阈值，才会向外传播
export const elevationDifferenceFactor = 0.2;  // 水流向高处或低处时，水位因高差传播的系数
export const floodDifferenceFactor = 0.1;  // 水位传播时，因为水位差传播的系数
export const trappedThreshold = 50;
export const floodWarningThreshold = 40;

// Failure point
export const failurePointCount = 2;
// Flood increase setting in failure point，即对数正态分布的参数
export const failurePointFloodIncreaseBaseMu = 5;  // 对数正态分布的众数
export const failurePointFloodIncreaseSigmaMin = 0.3;  // 对数正态分布的方差最小值
export const failurePointFloodIncreaseSigmaMax = 0.7;  // 对数正态分布的方差最大值

// 乘客上下车比例
export const getOnAndOffRatioMin = 0.2;
export const getOnAndOffRatioMax = 0.4;


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
  isPaused: true,
  // gameLogs: loadPersistedLogs(), // 从本地存储加载
  gameLogs: [], // 初始化空日志
  pendingActions: [], // 初始化空操作队列
  decisionTimeUsed: 0, // 初始化为0
}; 