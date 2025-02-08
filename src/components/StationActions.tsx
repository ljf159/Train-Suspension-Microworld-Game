import React, { useState } from 'react';
import { Train, Play, Square, LogOut, RotateCcw, Clock } from 'lucide-react';
import { TrainLocation, StationAction, Train as TrainType } from '../types/index';

interface StationActionsProps {
  location: TrainLocation;
  train: TrainType;
  onAction: (action: StationAction) => void;
  onClose: () => void;
}

export const StationActions: React.FC<StationActionsProps> = ({
  location,
  train,
  onAction,
  onClose
}) => {
  const [clickedAction, setClickedAction] = useState<StationAction | null>(null);

  const handleAction = (action: StationAction) => {
    onAction(action);
    setClickedAction(action);
  };

  const getButtonStyle = (action: StationAction) => {
    const baseStyle = "flex items-center justify-center gap-2 px-4 py-2 rounded";
    const isClicked = clickedAction === action;
    
    switch (action) {
      case 'start':
        return `${baseStyle} ${isClicked 
          ? 'bg-green-300 cursor-not-allowed opacity-70' 
          : 'bg-green-500 hover:bg-green-600'}`;
      case 'stop':
        return `${baseStyle} ${isClicked 
          ? 'bg-red-300 cursor-not-allowed opacity-70' 
          : 'bg-red-500 hover:bg-red-600'}`;
      case 'reverse':
        return `${baseStyle} ${isClicked 
          ? 'bg-purple-300 cursor-not-allowed opacity-70' 
          : 'bg-purple-500 hover:bg-purple-600'}`;
      case 'evacuate':
        return `${baseStyle} ${isClicked 
          ? 'bg-yellow-300 cursor-not-allowed opacity-70' 
          : 'bg-yellow-500 hover:bg-yellow-600'}`;
    }
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4 shadow-lg relative">
      <button 
        onClick={() => {
          onClose();
        }}
        className="absolute -top-1 right-2 p-1 hover:text-gray-300"
      >
        ×
      </button>
      
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold">Train {train.id}</h3>
          <span className="text-sm text-gray-400">Location: {location.name}</span>
        </div>
        <Train className="text-blue-400" />
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center">
          <Train className="text-green-400 mr-2" />
          <span>{train.passengers} passengers</span>
        </div>
        <div className="flex items-center">
          <Clock className="text-yellow-400 mr-2" />
          <span>{train.delayedRounds} rounds delayed</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {train.status === 'running' && (
          <button
            className={getButtonStyle('stop')}
            onClick={() => handleAction('stop')}
            disabled={clickedAction === 'stop'}
          >
            <Square size={16} />
            Stop
          </button>
        )}
        
        {train.status === 'stopped' && (
          <button
            className={getButtonStyle('start')}
            onClick={() => handleAction('start')}
            disabled={clickedAction === 'start'}
          >
            <Play size={16} />
            Start
          </button>
        )}

        {location.type === 'station' && (
          <button
            className={getButtonStyle('evacuate')}
            onClick={() => handleAction('evacuate')}
            disabled={clickedAction === 'evacuate'}
          >
            <LogOut size={16} />
            Evacuate
          </button>
        )}

        <button
          className={getButtonStyle('reverse')}
          onClick={() => handleAction('reverse')}
          disabled={clickedAction === 'reverse'}
        >
          <RotateCcw size={16} />
          Reverse
        </button>
      </div>
    </div>
  );
};