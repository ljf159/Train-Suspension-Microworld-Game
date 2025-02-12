import { CanvasDrawer } from './types';
import { drawDirectionArrow } from './DirectionArrowDrawer';
import { getCanvasScale } from '../../utils/canvasUtils';

export const drawLegend: CanvasDrawer = (ctx: CanvasRenderingContext2D, minElevation: number, maxElevation: number) => {
  const scale = getCanvasScale(ctx);
  
  const fontSize = 8 * scale;
  const padding = 15 * scale;
  const iconSize = 7 * scale;
  
  const lineHeight = fontSize * 1.8;

  ctx.font = `${fontSize}px Arial`;
  ctx.fillStyle = '#FFF';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  // Station
  ctx.beginPath();
  ctx.fillStyle = '#1F2937';
  ctx.strokeStyle = '#6B7280';
  ctx.lineWidth = 2;
  ctx.arc(padding + iconSize, padding, iconSize * 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#FFF';
  ctx.fillText('Station', padding + iconSize + padding, padding + 2);

  // Track Node
  ctx.beginPath();
  ctx.fillStyle = '#4B5563';
  ctx.strokeStyle = '#6B7280';
  ctx.arc(padding + iconSize, padding + lineHeight, iconSize * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#FFF';
  ctx.fillText('Track Node', padding + iconSize + padding, padding + lineHeight + 2);

  // Running Train
  ctx.beginPath();
  ctx.fillStyle = '#3B82F6';
  ctx.strokeStyle = '#6B7280';
  ctx.arc(padding + iconSize, padding + lineHeight * 2, iconSize * 0.8, 0, Math.PI * 2);
  ctx.fill();
  drawDirectionArrow(ctx, padding + iconSize, padding + lineHeight * 2, 'forward', 0, scale * 2.2);
  ctx.fillStyle = '#FFF';
  ctx.fillText('Running Train', padding + iconSize + padding, padding + lineHeight * 2);

  // Stopped Train
  ctx.beginPath();
  ctx.fillStyle = '#EF4444';
  ctx.arc(padding + iconSize, padding + lineHeight * 3, iconSize * 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFF';
  ctx.fillText('Stopped or Trapped Train', padding + iconSize + padding, padding + lineHeight * 3);

  // Selected Location
  ctx.beginPath();
  ctx.fillStyle = '#FBBF24';
  ctx.strokeStyle = '#6B7280';
  ctx.arc(padding + iconSize, padding + lineHeight * 4, iconSize * 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#FFF';
  ctx.fillText('Selected Location', padding + iconSize + padding, padding + lineHeight * 4);

  // failure point
  ctx.beginPath();
  ctx.arc(padding + iconSize, padding + lineHeight * 5, iconSize * 0.8, 0, Math.PI * 2);
  ctx.strokeStyle = '#EF4444';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#FFF';
  ctx.fillText('Failure Point', padding + iconSize + padding, padding + lineHeight * 5);

  // pump
  ctx.beginPath();
  ctx.strokeStyle = '#3B82F6';
  ctx.lineWidth = 2;
  ctx.arc(padding + iconSize, padding + lineHeight * 6, iconSize * 0.8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#FFF';
  ctx.fillText('Pump Active', padding + iconSize + padding, padding + lineHeight * 6);

  // 添加泵工作的文字提示
  ctx.fillStyle = '#3B82F6';
  ctx.font = `${fontSize}px Arial`;
  ctx.fillText(
    '⚡️', 
    padding + iconSize + iconSize * 0, 
    padding + lineHeight * 6 - iconSize * 0.6
  );

  // 在现有图例下方添加高程渐变图例
  const ELEVATION_LEGEND_WIDTH = 80 * scale;
  const ELEVATION_LEGEND_HEIGHT = 10 * scale;
  const ELEVATION_TEXT_HEIGHT = 14 * scale;
  const ELEVATION_OFFSET = lineHeight * 3;

  // 创建高程渐变
  const gradient = ctx.createLinearGradient(
    padding,
    padding + lineHeight * 5 + ELEVATION_TEXT_HEIGHT + ELEVATION_OFFSET,
    padding + ELEVATION_LEGEND_WIDTH,
    padding + lineHeight * 5 + ELEVATION_TEXT_HEIGHT + ELEVATION_OFFSET
  );
  gradient.addColorStop(0, 'hsl(240, 70%, 50%)'); // 蓝色
  gradient.addColorStop(1, 'hsl(120, 70%, 50%)'); // 绿色

  // 绘制渐变条
  ctx.fillStyle = gradient;
  ctx.fillRect(
    padding,
    padding + lineHeight * 5 + ELEVATION_OFFSET,
    ELEVATION_LEGEND_WIDTH,
    ELEVATION_LEGEND_HEIGHT
  );

  // 添加高程标签
  ctx.fillStyle = '#FFF';
  ctx.font = `${fontSize}px Arial`;
  ctx.fillText(
    `${minElevation.toFixed(0)}m`,
    padding,
    padding + lineHeight * 5 + ELEVATION_LEGEND_HEIGHT + ELEVATION_TEXT_HEIGHT + ELEVATION_OFFSET * 0.85
  );
  ctx.fillText(
    `${maxElevation.toFixed(0)}m`,
    padding + ELEVATION_LEGEND_WIDTH - ctx.measureText(`${maxElevation.toFixed(0)}m`).width,
    padding + lineHeight * 5 + ELEVATION_LEGEND_HEIGHT + ELEVATION_TEXT_HEIGHT + ELEVATION_OFFSET * 0.85
  );
  ctx.fillText(
    'Elevation (m)',
    padding,
    padding + lineHeight * 5 - ELEVATION_TEXT_HEIGHT + ELEVATION_OFFSET * 1.15
  );
};