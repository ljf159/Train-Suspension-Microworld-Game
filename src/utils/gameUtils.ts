import { GameState } from '../types/index';
import { moveTrainToNextNode } from './trainMovement';
import { updateFloodLevels } from './floodingUtils';
import { calculateRoundScore } from './scoring/scoreCalculator';
import { GameLog } from '../types/index';
import { persistLogs } from './storageUtils';
import { getTrainPositionIdentifier } from './trainUtils';
import { processPendingActions } from './actionHandlers';
import { updatePassengers } from './passengerUtils';
import { defaultDecisionTime, trappedThreshold, failurePointCount, failurePointFloodIncreaseBaseMu, failurePointFloodIncreaseSigmaMin, failurePointFloodIncreaseSigmaMax, getOnAndOffRatioMin, getOnAndOffRatioMax, delayScorePerPassenger, evacuationScorePerPassenger, trappedInTrackScorePerPassenger, PROPAGATION_FLOOD_INCREASE, PROPAGATION_THRESHOLD, elevationDifferenceFactor, floodDifferenceFactor, floodWarningThreshold } from '../data/initialGameState';

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

  // 乘客上下车而导致列车和车站上的乘客数量变化
  const { updatedStationsWithUpdatedPassengers, updatedTrainsWithUpdatedPassengers } = updatePassengers(updatedStations, updatedTrains, updatedState.evacuatedTrainIds || []);


  // let trappedTrainIDs: number[] = [];

  // 对于每辆列车，检测其所在位置处的水位是否大于50%。如果大于50%，则列车被trap到这个位置，将其status改为trapped。如果之前为trapped，现在水位下降到50%以下了，就将status改为stopped。
  const updatedTrainsWithStoppedStatus = updatedTrainsWithUpdatedPassengers.map(train => {
    // 获取列车当前位置的水位
    let currentFloodLevel = 0;
    
    if (train.stationId !== null) {
      // 在车站时检查车站水位
      const currentStation = updatedStationsWithUpdatedPassengers.find(s => s.id === train.stationId);
      currentFloodLevel = currentStation?.floodLevel ?? 0;
    } else if (train.trackId !== null && train.nodePosition !== null) {
      // 在轨道时检查轨道节点水位
      const currentTrack = updatedTracks.find(t => t.id === train.trackId);
      const currentNode = currentTrack?.nodes[train.nodePosition];
      currentFloodLevel = currentNode?.floodLevel ?? 0;
    }

    // 根据水位更新状态
    let newStatus = train.status;
    if (currentFloodLevel > trappedThreshold) {
      newStatus = 'trapped';

      // trappedTrainIDs.push(train.id);

    } else if (train.status === 'trapped') {
      // 水位下降后从trapped转为stopped
      newStatus = 'stopped';
    }

    return {
      ...train,
      status: newStatus,
      // 保持其他属性不变
    };
  });
  

  const roundScore = calculateRoundScore(state.trains, updatedTrainsWithStoppedStatus, updatedState.evacuatedTrainIds || []);
  
  // 生成回合日志
  const newLog: GameLog = {
    // 如果时round为0的时候，记录一下游戏的setting
    setting: state.round === 0 ? {
      // failurePointIds: failurePointIds,
      failurePointCount: failurePointCount,
      failurePointFloodIncreaseBaseMu: failurePointFloodIncreaseBaseMu,
      failurePointFloodIncreaseSigmaMin: failurePointFloodIncreaseSigmaMin,
      failurePointFloodIncreaseSigmaMax: failurePointFloodIncreaseSigmaMax,
      getOnAndOffRatioMin: getOnAndOffRatioMin,
      getOnAndOffRatioMax: getOnAndOffRatioMax,
      trappedThreshold: trappedThreshold,
      floodWarningThreshold: floodWarningThreshold,
      defaultDecisionTime: defaultDecisionTime,
      delayScorePerPassenger: delayScorePerPassenger,
      evacuationScorePerPassenger: evacuationScorePerPassenger,
      trappedInTrackScorePerPassenger: trappedInTrackScorePerPassenger,
      PROPAGATION_FLOOD_INCREASE: PROPAGATION_FLOOD_INCREASE,
      PROPAGATION_THRESHOLD: PROPAGATION_THRESHOLD,
      elevationDifferenceFactor: elevationDifferenceFactor,
      floodDifferenceFactor: floodDifferenceFactor,
      
    } : undefined,

    id: Date.now(),
    round: state.round,
    timestamp: new Date().toISOString(),

    // 列车状态变化
    trains: updatedTrainsWithStoppedStatus.map(train => {
      const original = state.trains.find(t => t.id === train.id)!;
      
      const prevPos = getTrainPositionIdentifier(original, state.tracks);
      const newPos = getTrainPositionIdentifier(train, updatedTracks);
      
      return {
        id: train.id,
        stationId: train.stationId,
        trackId: train.trackId,
        nodePosition: train.nodePosition,
        capacity: train.capacity,
        passengersChange: train.passengers - original.passengers,
        currentPassengers: train.passengers,
        statusChange: train.status !== original.status ? 
          `${original.status}→${train.status}` : undefined,
        currentStatus: train.status,
        directionChange: train.direction !== original.direction ? 
          `${original.direction}→${train.direction}` : undefined,
        currentDirection: train.direction,
        positionChange: `${prevPos} → ${newPos}`,
        delayedRounds: train.delayedRounds,
        lastMoveRound: train.lastMoveRound,
        lineId: train.lineId,
      };
    }),

    // 车站状态变化
    stations: updatedStations.map(station => {
      const original = state.stations.find(s => s.id === station.id)!;

      return {
        id: station.id,
        // floodLevelChange: station.floodLevel - (original.previousFloodLevel || 0),
        elevation: station.elevation,
        isTransfer: station.isTransfer,
        currentFloodLevel: station.floodLevel,
        passengersChange: station.passengers - original.passengers,
        currentPassengers: station.passengers,
        pumpUsed: station.pumpUsed,
        pumpThreshold: station.pumpThreshold,
        pumpRate: station.pumpRate,
        isFailurePoint: station.isFailurePoint
      };
    }),

    // 轨道状态变化
    tracks: updatedTracks.map(track => {
      // const original = state.tracks.find(t => t.id === track.id)!;

      return {
        id: track.id,
        stationA: track.stationA,
        stationB: track.stationB,
        lineId: track.lineId,
        nodes: track.nodes.map(n => ({
          id: n.id,
          // floodLevelChange: n.floodLevel - (original.nodes.find(n => n.id === n.id)?.floodLevel || 0),
          currentFloodLevel: n.floodLevel,
          isFailurePoint: n.isFailurePoint
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

  // console.log('当前回合log:', newLog);

  // console.log('当前回合操作记录:', {
  //   round: state.round,
  //   decisionTimeUsed: state.decisionTimeUsed,
  //   actionCount: state.pendingActions.length,
  //   actions: state.pendingActions
  // });

  // 持久化存储日志
  persistLogs([...state.gameLogs, newLog].slice(0, 500));

  // console.log('gameLog是什么', state.gameLogs);

  return {
    ...state,
    round: state.round + 1,
    stations: updatedStationsWithUpdatedPassengers,
    tracks: updatedTracks,
    trains: updatedTrainsWithStoppedStatus,
    score: state.score + roundScore.total,
    lastRoundScore: roundScore,
    decisionTimeRemaining: defaultDecisionTime,
    evacuatedTrainIds: [],  // 重置已疏散列车列表
    selectedTrains: [],   // 确保清空选择
    gameLogs: [...state.gameLogs, newLog],
    pendingActions: [], // 清空前确认有数据
  };
};