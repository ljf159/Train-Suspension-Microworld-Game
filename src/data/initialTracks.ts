import { Track } from '../types/index';
import { initialStations } from './initialStations';

// 辅助函数：根据两个车站的elevation计算中间track node的elevation
const calculateNodeElevation = (stationAId: number, stationBId: number): number => {
  const stationA = initialStations.find(s => s.id === stationAId);
  const stationB = initialStations.find(s => s.id === stationBId);
  if (!stationA || !stationB) return 3; // 默认值

  // 计算两个车站elevation的中间值
  return (stationA.elevation + stationB.elevation) / 2;
};

export const initialTracks: Track[] = [
  // 水平线1（上）
  {
    id: 0,
    lineId: 1,
    stationA: 0,
    stationB: 1,
    nodes: [
      { id: 100, x: 150, y: 200, floodLevel: 0, isFailurePoint: false, name: "H1-1", 
        elevation: calculateNodeElevation(0, 1) }
    ]
  },
  {
    id: 1,
    lineId: 1,
    stationA: 1,
    stationB: 2,
    nodes: [
      { id: 101, x: 250, y: 200, floodLevel: 0, isFailurePoint: false, name: "H1-2", 
        elevation: calculateNodeElevation(1, 2) }
    ]
  },
  {
    id: 2,
    lineId: 1,
    stationA: 2,
    stationB: 3,
    nodes: [
      { id: 102, x: 350, y: 200, floodLevel: 0, isFailurePoint: false, name: "H1-3", elevation: 4.5 }
    ]
  },
  
  // 水平线2（下）
  {
    id: 3,
    lineId: 2,
    stationA: 4,
    stationB: 5,
    nodes: [
      { id: 103, x: 150, y: 300, floodLevel: 0, isFailurePoint: false, name: "H2-1", elevation: 4.5 }
    ]
  },
  {
    id: 4,
    lineId: 2,
    stationA: 5,
    stationB: 6,
    nodes: [
      { id: 104, x: 250, y: 300, floodLevel: 0, isFailurePoint: false, name: "H2-2", elevation: 4.5 }
    ]
  },
  {
    id: 5,
    lineId: 2,
    stationA: 6,
    stationB: 7,
    nodes: [
      { id: 105, x: 350, y: 300, floodLevel: 0, isFailurePoint: false, name: "H2-3", elevation: 4.5 }
    ]
  },
  
  // 垂直线1（左）
  {
    id: 6,
    lineId: 3,
    stationA: 8,
    stationB: 9,
    nodes: [
      { id: 106, x: 200, y: 150, floodLevel: 0, isFailurePoint: false, name: "V1-1", elevation: 4.5 }
    ]
  },
  {
    id: 7,
    lineId: 3,
    stationA: 9,
    stationB: 10,
    nodes: [
      { id: 107, x: 200, y: 250, floodLevel: 0, isFailurePoint: false, name: "V1-2", 
        elevation: calculateNodeElevation(9, 10) }
    ]
  },
  {
    id: 8,
    lineId: 3,
    stationA: 10,
    stationB: 11,
    nodes: [
      { id: 108, x: 200, y: 350, floodLevel: 0, isFailurePoint: false, name: "V1-3", elevation: 4.5 }
    ]
  },
  
  // 垂直线2（右）
  {
    id: 9,
    lineId: 4,
    stationA: 12,
    stationB: 13,
    nodes: [
      { id: 109, x: 300, y: 150, floodLevel: 0, isFailurePoint: false, name: "V2-1", elevation: 4.5 }
    ]
  },
  {
    id: 10,
    lineId: 4,
    stationA: 13,
    stationB: 14,
    nodes: [
      { id: 110, x: 300, y: 250, floodLevel: 0, isFailurePoint: false, name: "V2-2", elevation: 4.5 }
    ]
  },
  {
    id: 11,
    lineId: 4,
    stationA: 14,
    stationB: 15,
    nodes: [
      { id: 111, x: 300, y: 350, floodLevel: 0, isFailurePoint: false, name: "V2-3", elevation: 4.5 }
    ]
  }
];