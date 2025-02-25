// ... existing types ...

export interface RoundScore {
  total: number;          // 回合总分
  trainScores: {         // 每辆列车的得分详情
    trainId: number;     // 列车ID
    delayScore: number;  // 延误得分
    evacuationScore: number;  // 疏散得分
    trackStopScore: number;   // 轨道停止得分
    total: number;      // 该列车总分
  }[];
}

export interface Station {
  id: number;
  name: string;
  x: number;
  y: number;
  passengers: number;
  isTransfer: boolean;
  connected: number[]; // 连接的轨道id
  floodLevel: number;
  isFailurePoint: boolean;
  elevation: number;
  hasPump: boolean;
  pumpThreshold: number;
  pumpRate: number;
  pumpUsed: boolean;
  lastIncrease?: number;
  increaseInThisRound?: number;
  previousFloodLevel: number;
}

export interface TrackNode {
  id: number;
  name: string;
  x: number;
  y: number;
  floodLevel: number;
  isFailurePoint: boolean;
  elevation: number;
  lastIncrease?: number;
}

export interface Track {
  id: number;
  stationA: number;
  stationB: number;
  nodes: TrackNode[];
  lineId: number;
}

export interface Train {
  id: number;
  stationId: number | null;
  trackId: number | null;
  nodePosition: number;
  capacity: number;
  direction: 'forward' | 'backward';
  status: 'running' | 'stopped' | 'trapped';
  passengers: number;
  delayedRounds: number;
  lastMoveRound: number;
  lineId: number;
  pendingAction?: StationAction;
}

export interface TrainLocation {
  type: 'station' | 'track';
  id: number;
  name: string;
  indexInLine: number;
}

export type StationAction = 'start' | 'stop' | 'reverse' | 'evacuate';

export interface FloodNode {
  id: number;
  type: 'station' | 'trackNode';
  floodLevel: number;
  isFailurePoint: boolean;
}

export interface PlayerSelectActionLog {
  type: StationAction;
  targetTrain: Train;
  targetLocation: TrainLocation;
  timestamp: string;  // ISO格式时间戳
  round: number;      // 所属回合
  selectTimeUsed: number; // 选择某个操作所用时间（未提交
}

export interface GameLog {
  setting?: GameSetting;
  id: number;
  round: number;
  timestamp: string;
  trains: TrainLogEntry[];
  stations: StationLogEntry[];
  tracks: TrackLogEntry[];
  decisionTimeUsed: number;
  scoreChange: number;
  totalScore: number;
  playerActions: PlayerSelectActionLog[]; // 新增玩家操作记录
}

export interface GameSetting {
  failurePointCount: number;
  failurePointFloodIncreaseBaseMu: number;
  failurePointFloodIncreaseSigmaMin: number;
  failurePointFloodIncreaseSigmaMax: number;
  getOnAndOffRatioMin: number;
  getOnAndOffRatioMax: number;
  trappedThreshold: number;
  floodWarningThreshold: number;
  defaultDecisionTime: number;
  delayScorePerPassenger: number;
  evacuationScorePerPassenger: number;
  trappedInTrackScorePerPassenger: number;
  PROPAGATION_FLOOD_INCREASE: number;
  PROPAGATION_THRESHOLD: number;
  elevationDifferenceFactor: number;
  floodDifferenceFactor: number;  
}

export interface TrainLogEntry {
  id: number;
  passengersChange: number;
  currentPassengers: number;
  statusChange?: string;
  directionChange?: string;
  positionChange: string;
}

export interface StationLogEntry {
  id: number;
  // floodLevelChange: number;
  currentFloodLevel: number;
  passengersChange: number;
  currentPassengers: number;
  pumpUsed: boolean;
  pumpThreshold: number;
  pumpRate: number;
  isFailurePoint: boolean;
}

export interface TrackLogEntry {
  id: number;
  stationA: number;
  stationB: number;
  lineId: number;
  nodes: TrackNodeLogEntry[];
}

export interface TrackNodeLogEntry {
  id: number;
  // floodLevelChange: number;
  currentFloodLevel: number;
  isFailurePoint: boolean;
}

export interface GameState {
  round: number;
  score: number;
  lastRoundScore?: RoundScore;
  decisionTimeRemaining: number;
  decisionTimeUsed: number;
  stations: Station[];
  selectedTrains: Array<{
    train: Train;
    location: TrainLocation;
    name: string;
  }>;
  trains: Train[];
  tracks: Track[];
  gameOver: boolean;
  evacuatedTrainIds: number[];
  isPaused: boolean;
  gameLogs: GameLog[];
  pendingActions: PlayerSelectActionLog[]; // 仅包含已提交操作，关闭面板时自动清理
} 
