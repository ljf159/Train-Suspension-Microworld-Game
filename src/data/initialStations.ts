import { Station } from '../types/index';

export const initialStations: Station[] = [
  // 水平线1（上）
  { id: 0, name: "H1-West", x: 100, y: 200, passengers: 30, isTransfer: false, connected: [1], floodLevel: 0, previousFloodLevel: 0, isFailurePoint: false, elevation: 5, hasPump: true, pumpThreshold: 10, pumpRate: 3, pumpUsed: false },
  { id: 1, name: "H1-WestXfer", x: 200, y: 200, passengers: 40, isTransfer: true, connected: [0, 2], floodLevel: 0, previousFloodLevel: 0, isFailurePoint: false, elevation: 4, hasPump: true, pumpThreshold: 10, pumpRate: 3, pumpUsed: false },
  { id: 2, name: "H1-EastXfer", x: 300, y: 200, passengers: 40, isTransfer: true, connected: [1, 3], floodLevel: 0, previousFloodLevel: 0, isFailurePoint: false, elevation: 4, hasPump: true, pumpThreshold: 10, pumpRate: 3, pumpUsed: false },
  { id: 3, name: "H1-East", x: 400, y: 200, passengers: 30, isTransfer: false, connected: [2], floodLevel: 0, previousFloodLevel: 0, isFailurePoint: false, elevation: 3, hasPump: true, pumpThreshold: 10, pumpRate: 3, pumpUsed: false },
  
  // 水平线2（下）
  { id: 4, name: "H2-West", x: 100, y: 300, passengers: 30, isTransfer: false, connected: [5], floodLevel: 0, previousFloodLevel: 0, isFailurePoint: false, elevation: 3, hasPump: true, pumpThreshold: 10, pumpRate: 3, pumpUsed: false },
  { id: 5, name: "H2-WestXfer", x: 200, y: 300, passengers: 40, isTransfer: true, connected: [4, 6], floodLevel: 0, previousFloodLevel: 0, isFailurePoint: false, elevation: 2, hasPump: true, pumpThreshold: 10, pumpRate: 3, pumpUsed: false },
  { id: 6, name: "H2-EastXfer", x: 300, y: 300, passengers: 40, isTransfer: true, connected: [5, 7], floodLevel: 0, previousFloodLevel: 0, isFailurePoint: false, elevation: 2, hasPump: true, pumpThreshold: 10, pumpRate: 3, pumpUsed: false },
  { id: 7, name: "H2-East", x: 400, y: 300, passengers: 30, isTransfer: false, connected: [6], floodLevel: 0, previousFloodLevel: 0, isFailurePoint: false, elevation: 1, hasPump: true, pumpThreshold: 10, pumpRate: 3, pumpUsed: false  },
  
  // 垂直线1（左）
  { id: 8, name: "V1-North", x: 200, y: 100, passengers: 30, isTransfer: false, connected: [9], floodLevel: 0, previousFloodLevel: 0, isFailurePoint: false, elevation: 5, hasPump: true, pumpThreshold: 10, pumpRate: 3, pumpUsed: false },
  { id: 9, name: "V1-NorthXfer", x: 200, y: 200, passengers: 40, isTransfer: true, connected: [8, 10], floodLevel: 0, previousFloodLevel: 0, isFailurePoint: false, elevation: 4, hasPump: true, pumpThreshold: 10, pumpRate: 3, pumpUsed: false },
  { id: 10, name: "V1-SouthXfer", x: 200, y: 300, passengers: 40, isTransfer: true, connected: [9, 11], floodLevel: 0, previousFloodLevel: 0, isFailurePoint: false, elevation: 2, hasPump: true, pumpThreshold: 10, pumpRate: 3, pumpUsed: false },
  { id: 11, name: "V1-South", x: 200, y: 400, passengers: 30, isTransfer: false, connected: [10], floodLevel: 0, previousFloodLevel: 0, isFailurePoint: false, elevation: 1, hasPump: true, pumpThreshold: 10, pumpRate: 3, pumpUsed: false },
  
  // 垂直线2（右）
  { id: 12, name: "V2-North", x: 300, y: 100, passengers: 30, isTransfer: false, connected: [13], floodLevel: 0, previousFloodLevel: 0, isFailurePoint: false, elevation: 5, hasPump: true, pumpThreshold: 10, pumpRate: 3, pumpUsed: false },
  { id: 13, name: "V2-NorthXfer", x: 300, y: 200, passengers: 40, isTransfer: true, connected: [12, 14], floodLevel: 0, previousFloodLevel: 0, isFailurePoint: false, elevation: 4, hasPump: true, pumpThreshold: 10, pumpRate: 3, pumpUsed: false },
  { id: 14, name: "V2-SouthXfer", x: 300, y: 300, passengers: 40, isTransfer: true, connected: [13, 15], floodLevel: 0, previousFloodLevel: 0, isFailurePoint: false, elevation: 2, hasPump: true, pumpThreshold: 10, pumpRate: 3, pumpUsed: false },
  { id: 15, name: "V2-South", x: 300, y: 400, passengers: 30, isTransfer: false, connected: [14], floodLevel: 0, previousFloodLevel: 0, isFailurePoint: false, elevation: 1, hasPump: true, pumpThreshold: 10, pumpRate: 3, pumpUsed: false },
];
