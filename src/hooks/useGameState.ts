import { useState, useEffect, useMemo } from 'react';
import { 
  Train, 
  StationAction, 
  GameState, 
  TrainLocation 
} from '../types/index';
import { initialGameState } from '../data/initialGameState.ts';
import { updateGameState } from '../utils/gameUtils';
import { storePlayerAction } from '../utils/actionHandlers';
import { defaultDecisionTime } from '../data/initialGameState';

interface GameStateHook extends GameState {
  handleTrainSelect: (train: Train, location: TrainLocation) => void;
  handleTrainAction: (train: Train, location: TrainLocation, action: StationAction) => void;
  handleCancelAction: (trainId: number) => void;
  submitDecisions: () => void;
  hasTrainsAtStations: boolean;
  handleTogglePause: () => void;
};

export const useGameState = (): GameStateHook => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  const handleTrainSelect = (train: Train, location: TrainLocation) => {
    const compositeId = `Train ${train.id} at ${location.type} ${location.id}`;
    const isAlreadySelected = gameState.selectedTrains.some(
      t => t.name === compositeId
    );

    if (isAlreadySelected) {
      // 如果已选中，则移除该位置
      setGameState(prev => ({
        ...prev,
        selectedTrains: prev.selectedTrains.filter(
          t => t.name !== compositeId
        )
      }));
    } else {
      // 如果未选中，则添加到已选位置列表中
      setGameState(prev => ({
        ...prev,
        selectedTrains: [
          ...prev.selectedTrains, 
          {
            train: train,
            location: location,
            name: compositeId
          }
        ]
      }));
    }
  };

  const handleTrainAction = (train: Train, location: TrainLocation, action: StationAction) => {
    setGameState(prev => {
      // 仅记录操作，不立即执行
      const updated = storePlayerAction(prev, action, train, location);
      return {
        ...updated,
        // 移除已选中的列车。为什么需要移除已选中的列车？ 因为当列车操作被记录后，需要从已选列表中移除
        // selectedTrains: prev.selectedTrains.filter(t => t.train.id !== train.id)
      };
    });
  };

  const submitDecisions = () => {
    setGameState(prev => {

      // 如果时间已经用完，直接进入下一轮，不执行已有选择的任何操作
      if (prev.decisionTimeRemaining <= 0) {
        const decisionTimeUsed = defaultDecisionTime;
        return updateGameState({
          ...prev,
          //selectedTrains: [], // 清空已选位置
          pendingActions: [], // 清空待处理的操作
          decisionTimeUsed
        });
      }
      
      // 如果时间未用完，则处理所有暂存操作，并进入下一轮
      const decisionTimeUsed = defaultDecisionTime - prev.decisionTimeRemaining;
      // 处理所有暂存操作
      //const processedState = processPendingActions(prev);

      return updateGameState({
        ...prev,
        //selectedTrains: [],
        decisionTimeUsed
      });
    });
  };

  const handleTogglePause = () => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  };

  const handleCancelAction = (trainId: number) => {
    setGameState(prev => ({
      ...prev,
      pendingActions: prev.pendingActions.filter(
        action => action.targetTrain.id !== trainId
      )
    }));
    // console.log('取消操作', trainId);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.isPaused) {
          return prev;
        }
        if (prev.decisionTimeRemaining > 0) {
          return {
            ...prev,
            decisionTimeRemaining: prev.decisionTimeRemaining - 1
          };
        }
        submitDecisions();
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hasTrainsAtStations = useMemo(() => {
    return gameState.trains.some(train => train.stationId !== null);
  }, [gameState.trains]);

  // useEffect(() => {
  //   if (gameState.round % 5 === 0) {
  //     const failurePoints = [
  //       ...gameState.stations.filter(s => s.isFailurePoint),
  //       ...gameState.tracks.flatMap(t => t.nodes.filter(n => n.isFailurePoint))
  //     ];
  //     console.log('洪水上涨统计:', 
  //       failurePoints.map(p => ({
  //         id: p.id,
  //         increase: p.lastIncrease,
  //         total: p.floodLevel
  //       }))
  //     );
  //   }
  // }, [gameState.round]);

  useEffect(() => {
    if (gameState.round > 0) {
      const latestLog = gameState.gameLogs[0];
      console.groupCollapsed(`Round ${latestLog.round} Log`);
      console.log('Timestamp:', latestLog.timestamp);
      console.table(latestLog.trains);
      console.table(latestLog.stations);
      console.table(latestLog.tracks);
      console.log('Score:', `Score Change: ${latestLog.scoreChange} → Total Score: ${latestLog.totalScore}`);
      console.groupEnd();
    }
  }, [gameState.round]);

  return {
    ...gameState,
    handleTrainSelect,
    handleTrainAction,
    submitDecisions,
    hasTrainsAtStations,
    handleTogglePause,
    handleCancelAction
  };
};