import React from 'react';
import { Pause, Play } from 'lucide-react';

interface PauseButtonProps {
  isPaused: boolean;
  onTogglePause: () => void;
}

export const PauseButton: React.FC<PauseButtonProps> = ({ isPaused, onTogglePause }) => {
  return (
    <button
      className="fixed bottom-4 right-4 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full"
      onClick={onTogglePause}
      title={isPaused ? "Resume Game" : "Pause Game"}
    >
      {isPaused ? <Play size={24} /> : <Pause size={24} />}
    </button>
  );
}; 