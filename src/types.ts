export interface FloodNode {
  id: number;
  x: number;
  y: number;
  elevation: number;
  floodLevel?: number;
  isFailurePoint?: boolean;
  isMajorNode?: boolean;
  lastIncrease?: number;
  previousFloodLevel?: number;
  increaseInThisRound?: number;
  // 其他原有属性...
}

// // 新增日志类型
// export type RoundLog = {
//   round: number;
//   timestamp: string;
//   trains: TrainLog[];
//   stations: StationLog[];
//   scoreChange: number;
//   totalScore: number;
// };

// type TrainLog = {
//   id: number;
//   passengersChange: number;
//   newPassengers: number;
//   statusChange?: string;
//   positionChange?: string;
// };

// type StationLog = {
//   id: number;
//   floodLevelChange: number;
//   newFloodLevel: number;
//   passengersChange: number;
//   newPassengers: number;
// }; 