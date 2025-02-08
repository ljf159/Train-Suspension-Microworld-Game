import { useState } from 'react';
import { PauseButton } from './PauseButton';
import { GameState, Train, TrainLocation } from '../types/index';
import { NetworkCanvas } from './NetworkCanvas';
import { StationActions } from './StationActions';

export const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    round: 0,
    score: 0,
    decisionTimeRemaining: 30,
    stations: [],
    selectedTrains: [],
    trains: [],
    tracks: [],
    gameOver: false,
    evacuatedTrainIds: [],
    isPaused: false,
    gameLogs: [], // 添加缺失的 gameLogs 字段
    pendingActions: [],
    decisionTimeUsed: 0
  });

  const handleTogglePause = () => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  };

  return (
    <div className="relative flex h-screen">
      {/* 左侧画布 */}
      <div className="flex-1 h-full">
        <NetworkCanvas 
          stations={gameState.stations}
          trains={gameState.trains}
          tracks={gameState.tracks}
          selectedTrains={gameState.selectedTrains}
          onTrainSelect={(train: Train, location: TrainLocation) => {
            // 处理列车选择逻辑
          }}
          isPaused={gameState.isPaused}
        />
      </div>

      {/* 右侧操作面板容器 */}
      <div className="w-80 bg-gray-800 border-l border-gray-700 h-full overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* 示例操作面板 - 根据实际需要替换 */}
          <StationActions 
            location={{ type: 'station', id: 1, name: 'Sample Station', indexInLine: 0 }}
            train={{
              id: 1,
              stationId: 1,
              trackId: null,
              nodePosition: 0,
              capacity: 100,
              passengers: 50,
              status: 'running',
              direction: 'forward',
              lineId: 1,
              delayedRounds: 0,
              lastMoveRound: 0
            }}
            onAction={() => {}}
            onClose={() => {}}
          />
          {/* 可以添加更多操作面板组件 */}
        </div>
      </div>

      <PauseButton 
        isPaused={gameState.isPaused} 
        onTogglePause={handleTogglePause} 
      />
    </div>
  );
}; 