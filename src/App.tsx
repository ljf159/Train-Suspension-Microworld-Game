import React, { useState } from 'react';
import { Instructions } from './components/Instructions';
import { NetworkCanvas } from './components/NetworkCanvas';
import { StationActions } from './components/StationActions';
import { useGameState } from './hooks/useGameState';
import { formatTime } from './utils/timeUtils';
import { Train, TrainLocation } from './types/index';
import { PauseButton } from './components/PauseButton';
import { DebugPanel } from './components/DebugPanel';

export const App: React.FC = () => {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const {
    score,
    decisionTimeRemaining,
    stations,
    selectedTrains,
    trains,
    tracks,
    round,
    handleTrainSelect,
    handleTrainAction,
    handleCancelAction,
    submitDecisions,
    isPaused,
    handleTogglePause
  } = useGameState();

  return (
    <>
      {!isGameStarted ? (
        <Instructions onStart={() => setIsGameStarted(true)} />
      ) : (
        <div className="relative flex h-screen bg-gray-900">
          {/* 左侧画布区域 */}
          <div className="flex-1 h-full overflow-hidden">
            <NetworkCanvas
              stations={stations}
              trains={trains}
              tracks={tracks}
              selectedTrains={selectedTrains}
              onTrainSelect={handleTrainSelect}
              isPaused={isPaused}
            />
          </div>

          {/* 右侧操作面板 */}
          <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col h-full">
            <div className="p-4 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Control Panel</h2>
                <span className="text-sm text-gray-400">Round: {round}</span>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Current Score:</span>
                  <span className="text-xl font-bold text-green-400">{score}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Remaining Time:</span>
                  <span className="text-xl font-bold text-yellow-400">
                    {formatTime(decisionTimeRemaining)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* 可滚动操作区域 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* 遍历selectedTrains，根据location找到对应的train */}
              {selectedTrains.map((selectedTrain: { train: Train; location: TrainLocation; name: string }) => {
                const location = selectedTrain.location;

                const train = selectedTrain.train;

                // 根据location找到对应的train
                // const train = trains.find((t: Train) => {
                //   if (location.type === 'station') {
                //     return t.stationId === location.id;
                //   } else {
                //     const track = tracks.find((tr: Track) => tr.nodes.some((n: TrackNode) => n.id === location.id));
                //     return track && t.trackId === track.id && 
                //       t.nodePosition === track.nodes.findIndex((n: TrackNode) => n.id === location.id);
                //   }
                // });

                if (!train) return null;
                
                // 根据location找到对应的train，然后调用StationActions组件
                return (
                  <StationActions
                    key={selectedTrain.name}
                    location={location}
                    train={train}
                    onAction={(action) => handleTrainAction(train, location, action)}
                    onClose={() => {
                      handleTrainSelect(train, location);
                      // console.log('取消操作', train.id);
                      handleCancelAction(train.id);
                    }}
                  />
                );
              })}

              {selectedTrains.length > 0 && (
                <button
                  className="w-full bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-bold text-lg"
                  onClick={submitDecisions}
                >
                  Submit Decisions
                </button>
              )}
            </div>
          </div>

          {/* 暂停按钮 */}
          <PauseButton
            isPaused={isPaused}
            onTogglePause={handleTogglePause}
          />

          <DebugPanel />
        </div>
      )}
    </>
  );
};

export default App;