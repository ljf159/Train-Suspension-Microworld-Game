import { useRef, useEffect } from 'react';
import { GameState } from '../../types/index';

interface GameCanvasProps {
  gameState: GameState;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ gameState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = (ctx: CanvasRenderingContext2D) => {
    // ... 现有的绘制代码

    // 如果游戏暂停，添加半透明遮罩和文字
    if (gameState.isPaused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      
      ctx.font = '48px Arial';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        'PAUSED', 
        ctx.canvas.width / 2, 
        ctx.canvas.height / 2
      );
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      draw(ctx);
    }
  }, [gameState]);

  return (
    <canvas ref={canvasRef} />
  );
}; 