import { GameState } from '../types/index';
import { updateStations } from './stationUtils';
import { moveTrainToNextNode } from './trainMovement';
import { updateFloodLevels } from './floodingUtils';
import { calculateRoundScore } from './scoring/scoreCalculator';
import { GameLog } from '../types/index';
import { persistLogs } from './storageUtils';
import { getTrainPositionIdentifier } from './trainUtils';
import { processPendingActions } from './actionHandlers';
import { getTrainLocation } from './locationUtils';

export const updateGameState = (state: GameState): GameState => {
  // 如果游戏暂停，只更新倒计时
  if (state.isPaused) {
    return {
      ...state,
      decisionTimeRemaining: state.decisionTimeRemaining
    };
  }

  let updatedState = state;

  if (state.decisionTimeRemaining > 0) {
    // 处理所有暂存操作
    updatedState = processPendingActions(state);
  } else {
    updatedState = state;
  }

  // 原有的游戏状态更新逻辑
  const updatedTrains = updatedState.trains.map(train => 
    moveTrainToNextNode(train, updatedState.tracks, updatedState.stations, updatedState.round, updatedState.trains)
  );

  console.log('更新后的列车状态:', updatedTrains.map(train => ({
    id: train.id,
    status: train.status,
    trackId: train.trackId,
    nodePosition: train.nodePosition,
    direction: train.direction,
    indexInLine: getTrainLocation(train, updatedState.stations, updatedState.tracks).indexInLine
  })));

  const { updatedStations, updatedTracks } = updateFloodLevels(
    updatedState.stations.map(s => ({
      ...s,
      previousFloodLevel: s.floodLevel
    })),
    updatedState.tracks.map(t => ({
      ...t,
      nodes: t.nodes.map(n => ({
        ...n,
        previousFloodLevel: n.floodLevel
      }))
    }))
  );
  const stationsWithPassengers = updateStations(updatedStations);
  const roundScore = calculateRoundScore(updatedTrains, updatedState.evacuatedTrainIds || []);
  
  // 生成回合日志
  const newLog: GameLog = {
    // 生成唯一ID
    id: Date.now(),
    round: state.round,
    timestamp: new Date().toISOString(),

    // 列车状态变化
    trains: updatedTrains.map(train => {
      const original = state.trains.find(t => t.id === train.id)!;
      
      const prevPos = getTrainPositionIdentifier(original, state.tracks);
      const newPos = getTrainPositionIdentifier(train, updatedTracks);
      
      return {
        id: train.id,
        passengersChange: train.passengers - original.passengers,
        currentPassengers: train.passengers,
        statusChange: train.status !== original.status ? 
          `${original.status}→${train.status}` : undefined,
        directionChange: train.direction !== original.direction ? 
          `${original.direction}→${train.direction}` : undefined,
        positionChange: `${prevPos} → ${newPos}`
      };
    }),

    // 车站状态变化
    stations: updatedStations.map(station => {
      const original = state.stations.find(s => s.id === station.id)!;

      return {
        id: station.id,
        floodLevelChange: station.floodLevel - (original.previousFloodLevel || 0),
        currentFloodLevel: station.floodLevel,
        passengersChange: station.passengers - original.passengers,
        currentPassengers: station.passengers,
        pumpUsed: station.pumpUsed,
        pumpThreshold: station.pumpThreshold,
        pumpRate: station.pumpRate
      };
    }),

    // 轨道状态变化
    tracks: updatedTracks.map(track => {
      const original = state.tracks.find(t => t.id === track.id)!;

      return {
        id: track.id,
        stationA: track.stationA,
        stationB: track.stationB,
        lineId: track.lineId,
        nodes: track.nodes.map(n => ({
          id: n.id,
          floodLevelChange: n.floodLevel - (original.nodes.find(n => n.id === n.id)?.floodLevel || 0),
          currentFloodLevel: n.floodLevel
        }))
      };
    }),

    // 玩家操作
    playerActions: state.pendingActions,

    // 分数变化 
    scoreChange: roundScore.total,
    totalScore: state.score + roundScore.total,

    // 决策用时
    decisionTimeUsed: state.decisionTimeUsed,

  };

  console.log('当前回合操作记录:', {
    round: state.round,
    decisionTimeUsed: state.decisionTimeUsed,
    actionCount: state.pendingActions.length,
    actions: state.pendingActions
  });

  // 持久化存储日志
  persistLogs([newLog, ...state.gameLogs].slice(0, 100));

  return {
    ...state,
    round: state.round + 1,
    stations: stationsWithPassengers,
    tracks: updatedTracks,
    trains: updatedTrains,
    score: state.score + roundScore.total,
    lastRoundScore: roundScore,
    decisionTimeRemaining: 30,
    evacuatedTrainIds: [],  // 重置已疏散列车列表
    selectedTrains: [],   // 确保清空选择
    gameLogs: [newLog, ...state.gameLogs].slice(0, 50),
    pendingActions: [], // 清空前确认有数据
  };
};