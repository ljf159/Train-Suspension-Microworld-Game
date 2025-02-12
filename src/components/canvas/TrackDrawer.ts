import { Station, Track, FloodNode } from '../../types/index';
import { getCanvasScale } from '../../utils/canvasUtils';
import { getElevationColor } from '../../utils/colorUtils';

export const drawTracks = (
  ctx: CanvasRenderingContext2D,
  tracks: Track[],
  stations: Station[],
  minElevation: number,
  maxElevation: number
) => {
  const scale = getCanvasScale(ctx);
  const trackNodeRadius = 1.5 * scale;

  const createGradient = (
    ctx: CanvasRenderingContext2D, 
    start: FloodNode & { x: number; y: number; elevation: number },
    end: FloodNode & { x: number; y: number; elevation: number }
  ) => {
    const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
    gradient.addColorStop(0, getElevationColor(start.elevation, minElevation, maxElevation));
    gradient.addColorStop(1, getElevationColor(end.elevation, minElevation, maxElevation));
    return gradient;
  };

  tracks.forEach(track => {
    // 构建完整节点链
    const nodes = [
      stations.find(s => s.id === track.stationA),
      ...track.nodes.map(n => ({ ...n, type: 'trackNode' })),
      stations.find(s => s.id === track.stationB)
    ].filter(Boolean) as FloodNode[];

    // 绘制渐变轨道线
    nodes.forEach((current, index) => {
      if (index === 0) return;
      const prev = nodes[index - 1];
      
      const prevNode = prev as FloodNode & { x: number; y: number; elevation: number };
      const currentNode = current as FloodNode & { x: number; y: number; elevation: number };

      const gradient = ctx.createLinearGradient(prevNode.x, prevNode.y, currentNode.x, currentNode.y);
      gradient.addColorStop(0, getElevationColor(prevNode.elevation, minElevation, maxElevation));
      gradient.addColorStop(1, getElevationColor(currentNode.elevation, minElevation, maxElevation));

      ctx.beginPath();
      ctx.moveTo(prevNode.x, prevNode.y);
      ctx.lineTo(currentNode.x, currentNode.y);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3 * scale;
      ctx.stroke();
    });

    // 绘制轨道节点
    track.nodes.forEach(node => {

      // Draw node
      ctx.beginPath();
      ctx.arc(node.x, node.y, trackNodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = getElevationColor(node.elevation, minElevation, maxElevation);
      ctx.fill();
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 0.5 * scale;
      ctx.stroke();

      // Indicate failure point
      // if (node.isFailurePoint) {
      //   ctx.beginPath();
      //   ctx.arc(node.x, node.y, (trackNodeRadius + 1) * scale, 0, Math.PI * 2);
      //   ctx.strokeStyle = '#EF4444';
      //   ctx.lineWidth = 1 * scale;
      //   ctx.stroke();
      // }

      // Add elevation label
      ctx.fillStyle = '#FFF';
      ctx.font = `${3.5 * scale}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(
        `${node.elevation}m`,
        node.x,
        node.y - trackNodeRadius - 4 * scale
      );
    });
  });
};