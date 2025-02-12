import { Station, TrainLocation, Train } from '../../types/index';
import { getCanvasScale } from '../../utils/canvasUtils';
import { getElevationColor } from '../../utils/colorUtils';
import { trappedThreshold, floodWarningThreshold } from '../../data/initialGameState';

export const drawStations = (
  ctx: CanvasRenderingContext2D,
  stations: Station[],
  selectedTrains: Array<{ train: Train; location: TrainLocation; name: string }>,
  minElevation: number,
  maxElevation: number
) => {
  const scale = getCanvasScale(ctx);
  
  // 在绘制循环前添加换乘站聚合逻辑
  const transferStationGroups = stations
    .filter(s => s.isTransfer)
    .reduce((groups, station) => {
      const key = `${station.x},${station.y}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)?.push(station);
      return groups;
    }, new Map<string, Station[]>());

  // 修改绘制循环部分
  stations.forEach(station => {
    if (!station.isTransfer) {
      // 普通站保持原有绘制逻辑
      const isSelected = selectedTrains.some(
        t => t.location.type === 'station' && t.location.id === station.id
      );

      // 缩放站点大小
      const stationRadius = 3 * scale;
      
      ctx.beginPath();
      ctx.arc(station.x, station.y, stationRadius, 0, Math.PI * 2);
      ctx.fillStyle = getElevationColor(station.elevation, minElevation, maxElevation);
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#fbbf24' : '#1F2937';
      ctx.lineWidth = 2 * scale;
      ctx.stroke();

      // Draw station name
      // ctx.fillStyle = '#FFFFFF';
      // ctx.font = `${fontSize}px Arial`;
      // ctx.textAlign = 'center';
      // ctx.fillText(station.name, station.x, station.y + stationRadius - 8 * scale);
      // ctx.textBaseline = 'top';

      // Draw flood level with color coding
      if (station.floodLevel > trappedThreshold) {
        ctx.fillStyle = '#EF4444'; // Red for over 50%
      } else if (station.floodLevel > floodWarningThreshold) {
        ctx.fillStyle = '#F59E0B'; // Yellow for over 40%
      } else {
        ctx.fillStyle = '#FFF';
      }
      ctx.fillText(
        `${station.floodLevel.toFixed(1)}% (+${(station.increaseInThisRound ?? 0).toFixed(1)}) 🌊`,
        station.x - 7 * scale, 
        station.y + stationRadius + 13 * scale
      );

      // Draw passenger count
      ctx.fillStyle = '#FFF';
      ctx.fillText(`${station.passengers} 👥`, station.x - 7 * scale, station.y + stationRadius + 6 * scale);

      // Indicate failure point (新增)
      if (station.isFailurePoint) {
        ctx.beginPath();
        ctx.arc(station.x, station.y, (stationRadius + 1) * scale, 0, Math.PI * 2);
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 1 * scale;
        ctx.stroke();
      }

      // 绘制泵的状态指示
      if (station.hasPump && station.floodLevel >= station.pumpThreshold) {
        ctx.beginPath();
        ctx.arc(station.x, station.y, (stationRadius + 2) * scale, 0, Math.PI * 2);
        ctx.strokeStyle = '#3B82F6'; // 蓝色表示泵在工作
        ctx.lineWidth = 2 * scale;
        ctx.stroke();
        
        // 添加泵工作的文字提示
        ctx.font = `${5 * scale}px Arial`;
        ctx.fillStyle = '#3B82F6';
        ctx.textAlign = 'center';
        ctx.fillText(
          '⚡️', 
          station.x + stationRadius * 2, 
          station.y - stationRadius
        );
      }

      // 添加高程标签
      ctx.fillStyle = '#FFF';
      ctx.font = `${4 * scale}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(
        `${station.elevation.toFixed(1)}m`,
        station.x,
        station.y - stationRadius - 5 * scale
      );

      return;
    }

    // 处理换乘站
    const groupKey = `${station.x},${station.y}`;
    const group = transferStationGroups.get(groupKey);
    if (!group || group[0].id !== station.id) return; // 只处理组内第一个站点

    // 计算聚合值
    const totalPassengers = group.reduce((sum: number, s: Station) => sum + s.passengers, 0);
    const avgFloodLevel = group.reduce((sum: number, s: Station) => sum + s.floodLevel, 0) / group.length;
    const avgIncrease = group.reduce((sum: number, s: Station) => sum + (s.increaseInThisRound || 0), 0) / group.length;
    const hasFailurePoint = group.some((s: Station) => s.isFailurePoint);
    const isSelected = group.some((s: Station) => 
      selectedTrains.some((t: { train: Train; location: TrainLocation; name: string }) => t.location.type === 'station' && t.location.id === s.id)
    );

    // 在换乘站绘制逻辑中添加水泵指示
    const hasActivePump = group.some((s: Station) => 
      s.hasPump && s.floodLevel >= s.pumpThreshold
    );

    // 绘制换乘站图形
    ctx.beginPath();
    ctx.arc(station.x, station.y, 4 * scale, 0, Math.PI * 2);
    ctx.fillStyle = getElevationColor(group[0].elevation, minElevation, maxElevation); // 使用第一个站的高程
    ctx.fill();
    ctx.strokeStyle = isSelected ? '#fbbf24' : '#1F2937'; // #fbbf24 黄色, #1F2937 黑色
    ctx.lineWidth = 2 * scale;
    ctx.stroke();

    // 在绘制换乘站图形后添加水泵指示（保持原有图形不变）
    if (hasActivePump) {
      // 绘制蓝色边框
      ctx.beginPath();
      ctx.arc(station.x, station.y, (4 * scale + 2) * scale, 0, Math.PI * 2);
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2 * scale;
      ctx.stroke();

      // 添加水泵工作图标
      ctx.font = `${5 * scale}px Arial`;
      ctx.fillStyle = '#3B82F6';
      ctx.textAlign = 'center';
      ctx.fillText(
        '⚡️',
        station.x + 4 * scale * 2, // 调整位置到换乘站右侧
        station.y - 4 * scale
      );
    }

    // 绘制聚合数据
    if (avgFloodLevel > trappedThreshold) {
      ctx.fillStyle = '#EF4444'; // Red for over 50%
    } else if (avgFloodLevel > floodWarningThreshold) {
      ctx.fillStyle = '#F59E0B'; // Yellow for over 40%
    } else {
      ctx.fillStyle = '#FFF';
    }
    ctx.fillText(
      `${avgFloodLevel.toFixed(1)}% (+${avgIncrease.toFixed(1)}) 🌊`,
      station.x - 7 * scale, 
      station.y + 4 * scale + 13 * scale
    );

    ctx.fillStyle = '#FFF';
    ctx.fillText(
      `${totalPassengers} 👥`, 
      station.x - 7 * scale, 
      station.y + 4 * scale + 6 * scale
    );

    // 绘制故障点指示（任意一个换乘站有故障点即显示）
    if (hasFailurePoint) {
      ctx.beginPath();
      ctx.arc(station.x, station.y, 5 * scale, 0, Math.PI * 2);
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 1 * scale;
      ctx.stroke();
    }

    // 换乘站高程标签
    ctx.fillStyle = '#FFF';
    ctx.fillText(
      `${group[0].elevation.toFixed(1)}m`,
      station.x,
      station.y - 4 * scale - 5 * scale
    );
  });
};