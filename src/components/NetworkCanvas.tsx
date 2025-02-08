import React, { useRef, useEffect } from 'react';
import { Station, Train, Track, TrainLocation } from '../types/index';
import { drawLegend } from './canvas/LegendDrawer';
import { drawTrains } from './canvas/TrainDrawer';
import { drawTracks } from './canvas/TrackDrawer';
import { drawStations } from './canvas/StationDrawer';
import { getTrainLocation } from '../utils/locationUtils';
// import { useCanvasSetup } from '../hooks/useCanvasSetup';

interface NetworkCanvasProps {
  stations: Station[];
  trains: Train[];
  tracks: Track[];
  selectedTrains: Array<{ 
    train: Train; 
    location: TrainLocation; 
    name: string 
  }>;
  onTrainSelect: (train: Train, location: TrainLocation) => void;
  isPaused: boolean;
}

export const NetworkCanvas: React.FC<NetworkCanvasProps> = ({
  stations,
  trains,
  tracks,
  selectedTrains,
  onTrainSelect,
  isPaused
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 增加边距
    const padding = Math.min(canvas.width, canvas.height) * 0.03;  // 设置为canvas尺寸的10%

    // 计算网络的边界（包括所有站点和轨道节点）
    const allPoints = [
      ...stations.map(s => ({ x: s.x, y: s.y })),
      ...tracks.flatMap(t => t.nodes)
    ];

    const networkBounds = {
      minX: Math.min(...allPoints.map(p => p.x)),
      maxX: Math.max(...allPoints.map(p => p.x)),
      minY: Math.min(...allPoints.map(p => p.y)),
      maxY: Math.max(...allPoints.map(p => p.y))
    };

    // 计算网络尺寸（包括边距）
    const networkWidth = networkBounds.maxX - networkBounds.minX + padding * 2;
    const networkHeight = networkBounds.maxY - networkBounds.minY + padding * 2;

    // 获取容器尺寸
    const containerWidth = canvas.parentElement?.clientWidth || 800;
    const containerHeight = canvas.parentElement?.clientHeight || 600;

    // 计算缩放比例（考虑一定的缩放余量）
    const scaleX = (containerWidth * 0.9) / networkWidth;  // 留出10%的余量
    const scaleY = (containerHeight * 0.9) / networkHeight;
    const scale = Math.min(scaleX, scaleY);

    // 设置canvas尺寸
    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;

    // 设置绘图上下文
    ctx.scale(dpr, dpr);

    // 计算居中偏移（确保完全居中）
    const offsetX = (containerWidth - networkWidth * scale) / 2;
    const offsetY = (containerHeight - networkHeight * scale) / 2;

    // 在useEffect顶部添加高程计算
    const allElevations = [
      ...stations.map(s => s.elevation),
      ...tracks.flatMap(t => t.nodes.map(n => n.elevation))
    ];
    const minElevation = Math.min(...allElevations);
    const maxElevation = Math.max(...allElevations);
    const elevationRange = maxElevation - minElevation;

    // 创建高程颜色映射函数
    const getElevationColor = (elevation: number) => {
      const ratio = (elevation - minElevation) / elevationRange;
      const hue = 240 - (ratio * 120); // 从蓝色(240)渐变到绿色(120)
      return `hsl(${hue}, 70%, 50%)`;
    };

    const draw = () => {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 保存当前状态
      ctx.save();
      
      // 应用变换
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);
      ctx.translate(-networkBounds.minX + padding, -networkBounds.minY + padding);

      // 绘制网络
      drawTracks(ctx, tracks, stations, minElevation, maxElevation);
      drawStations(ctx, stations, selectedTrains, minElevation, maxElevation);
      drawTrains(ctx, trains, stations, tracks, selectedTrains);
      
      // 恢复状态
      ctx.restore();

      // 绘制图例
      drawLegend(ctx, minElevation, maxElevation);

      // 如果游戏暂停，添加半透明遮罩和文字
      if (isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = `${48 * scale}px Arial`;
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
      }
    };

    draw();

    // 处理点击事件
    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // 转换回网络坐标系
      const networkX = ((x - offsetX) / scale) + networkBounds.minX - padding;
      const networkY = ((y - offsetY) / scale) + networkBounds.minY - padding;

      // 增加点击判定范围
      const clickRadius = 20 / scale;  // 增加点击判定范围

      // 遍历所有列车，找到点击的列车
      trains.forEach(train => {
        const location = getTrainLocation(train, stations, tracks);
        if (!location) return;

        let trainX: number, trainY: number;

        // 如果列车在车站，返回车站位置
        if (location.type === 'station') {
          const station = stations.find(s => s.id === location.id);
          if (!station) return;
          trainX = station.x;
          trainY = station.y;
        } else {
          // 如果列车在轨道上，返回轨道位置
          const track = tracks.find(t => t.nodes.some(n => n.id === location.id));
          if (!track) return;
          const node = track.nodes.find(n => n.id === location.id);
          if (!node) return;
          trainX = node.x;
          trainY = node.y;
        }

        const distance = Math.sqrt(
          Math.pow(networkX - trainX, 2) + 
          Math.pow(networkY - trainY, 2)
        );
        
        if (distance <= clickRadius) {
          onTrainSelect(train, location);
        }
      });
    };

    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, [stations, trains, tracks, selectedTrains, onTrainSelect, isPaused]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full bg-gray-800 rounded-lg"
    />
  );
};