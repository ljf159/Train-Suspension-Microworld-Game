import { Station, Train, Track, TrainLocation } from '../../types/index';
import { getTrainLocation } from '../../utils/locationUtils';
import { drawDirectionArrow } from './DirectionArrowDrawer';
import { getCanvasScale } from '../../utils/canvasUtils';

const drawTrainLabel = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  train: Train,
  scale: number
) => {
  const labelDistance = 25 * scale;
  const angle = 7 * Math.PI / 4;
  const labelX = x + Math.cos(angle) * labelDistance;
  const labelY = y + Math.sin(angle) * labelDistance;

  // 绘制引线
  ctx.beginPath();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;
  ctx.moveTo(x, y);
  ctx.lineTo(labelX, labelY);
  ctx.stroke();

  // 绘制文本背景和文本
  ctx.font = `${5 * scale}px Arial`;
  const text = `Train ${train.id} : ${train.passengers} 👥`;
  const metrics = ctx.measureText(text);
  const textHeight = parseInt(ctx.font, 10);
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(
    labelX - metrics.width/2 - 4,
    labelY - textHeight/2 - 4,
    metrics.width + 8,
    textHeight + 8
  );

  ctx.fillStyle = '#FFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, labelX, labelY);
};

export const drawTrains = (
  ctx: CanvasRenderingContext2D,
  trains: Train[],
  stations: Station[],
  tracks: Track[],
  selectedTrains: Array<{ train: Train; location: TrainLocation; name: string }>
) => {
  const scale = getCanvasScale(ctx);
  
  trains.forEach(train => {
    const location = getTrainLocation(train, stations, tracks);
    if (!location) return;

    let x: number, y: number;
    let nextX: number | undefined, nextY: number | undefined;

    if (location.type === 'station') {
      const station = stations.find(s => s.id === location.id);
      if (!station) return;
      x = station.x;
      y = station.y;

      // Find next position for direction arrow
      const track = tracks.find(t => 
        train.direction === 'forward' 
          ? t.stationA === location.id
          : t.stationB === location.id
      );
      if (track) {
        const nextNode = train.direction === 'forward' 
          ? track.nodes[0] 
          : track.nodes[track.nodes.length - 1];
        nextX = nextNode.x;
        nextY = nextNode.y;
      }
    } else {
      const track = tracks.find(t => t.nodes.some(n => n.id === location.id));
      if (!track) return;
      const node = track.nodes.find(n => n.id === location.id);
      if (!node) return;
      x = node.x;
      y = node.y;

      // Find next position for direction arrow
      const nextNodeIndex = train.direction === 'forward' 
        ? train.nodePosition + 1 
        : train.nodePosition - 1;

      if (nextNodeIndex >= 0 && nextNodeIndex < track.nodes.length) {
        nextX = track.nodes[nextNodeIndex].x;
        nextY = track.nodes[nextNodeIndex].y;
      } else {
        const nextStation = stations.find(s => 
          train.direction === 'forward' 
            ? s.id === track.stationB 
            : s.id === track.stationA
        );
        if (nextStation) {
          nextX = nextStation.x;
          nextY = nextStation.y;
        }
      }
    }

    const isSelected = selectedTrains.some(
      t => t.name === `Train ${train.id} at ${location.type} ${location.id}`
    );

    // Draw train
    const trainRadius = 3 * scale;
    
    ctx.beginPath();
    ctx.fillStyle = isSelected 
      ? '#FBBF24' 
      : (train.status === 'running' ? '#3B82F6' : '#EF4444');
    ctx.arc(x, y, trainRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw passenger count
    ctx.font = `${5 * scale}px Arial`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(`${train.passengers} 👥`, x, y + trainRadius + 5 * scale);

    // Draw direction arrow if running
    if (train.status === 'running' && nextX !== undefined && nextY !== undefined) {
      let angle = Math.atan2(nextY - y, nextX - x);
      
      if (train.direction === 'backward') {
        angle += Math.PI;
      }
      
      drawDirectionArrow(ctx, x, y, train.direction, angle, scale);
    }

    // 在绘制列车后添加标签
    drawTrainLabel(ctx, x, y, train, scale);
  });
};